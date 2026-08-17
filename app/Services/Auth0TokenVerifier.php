<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Validates Auth0 access tokens and reads the matching profile.
 *
 * The SPA never talks to the database directly: it sends the Auth0 access token
 * here, this class proves the token was signed by our tenant and issued for our
 * API, and only then does AuthController mint a Sanctum token.
 */
class Auth0TokenVerifier
{
    private const JWKS_CACHE_KEY = 'auth0.jwks';

    private const JWKS_CACHE_SECONDS = 3600;

    public function __construct(
        private readonly ?string $domain,
        private readonly ?string $audience,
    ) {
    }

    /**
     * Verify the signature, issuer, audience and expiry of an access token.
     *
     * @return array<string, mixed> the decoded claims
     *
     * @throws RuntimeException when the token cannot be trusted
     */
    public function verify(string $accessToken): array
    {
        $this->assertConfigured();

        try {
            $claims = (array) JWT::decode($accessToken, JWK::parseKeySet($this->jwks()));
        } catch (Throwable $exception) {
            // A stale key set is the common cause after a tenant key rotation,
            // so drop the cache and retry once before giving up.
            Cache::forget(self::JWKS_CACHE_KEY);

            try {
                $claims = (array) JWT::decode($accessToken, JWK::parseKeySet($this->jwks()));
            } catch (Throwable $retryException) {
                // The client only ever sees a generic message, so record the real
                // reason: a bad signature and an unreachable JWKS look identical
                // from the browser.
                Log::warning('Auth0 token verification failed.', [
                    'reason' => $retryException->getMessage(),
                ]);

                throw new RuntimeException('The Auth0 token could not be verified.', previous: $retryException);
            }
        }

        if (($claims['iss'] ?? null) !== $this->issuer()) {
            throw new RuntimeException('The Auth0 token was issued by an unexpected tenant.');
        }

        $audiences = (array) ($claims['aud'] ?? []);

        if (! in_array($this->audience, $audiences, true)) {
            throw new RuntimeException('The Auth0 token was not issued for this API.');
        }

        if (empty($claims['sub'])) {
            throw new RuntimeException('The Auth0 token has no subject claim.');
        }

        return $claims;
    }

    /**
     * Read name/email/picture from Auth0.
     *
     * An access token scoped to our API carries authorization claims only, so the
     * profile itself has to come from the tenant's /userinfo endpoint.
     *
     * @return array<string, mixed>
     *
     * @throws RuntimeException when the profile cannot be read
     */
    public function userInfo(string $accessToken): array
    {
        $this->assertConfigured();

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->timeout(10)
            ->get($this->issuer().'userinfo');

        if (! $response->successful()) {
            throw new RuntimeException('The Auth0 profile could not be read.');
        }

        return $response->json();
    }

    private function issuer(): string
    {
        return 'https://'.trim($this->domain, '/').'/';
    }

    /**
     * @return array<string, mixed>
     */
    private function jwks(): array
    {
        return Cache::remember(self::JWKS_CACHE_KEY, self::JWKS_CACHE_SECONDS, function () {
            $response = Http::acceptJson()
                ->timeout(10)
                ->get($this->issuer().'.well-known/jwks.json');

            if (! $response->successful()) {
                throw new RuntimeException('The Auth0 signing keys could not be downloaded.');
            }

            return $response->json();
        });
    }

    private function assertConfigured(): void
    {
        if (blank($this->domain) || blank($this->audience)) {
            throw new RuntimeException('Auth0 is not configured. Set AUTH0_DOMAIN and AUTH0_AUDIENCE.');
        }
    }
}
