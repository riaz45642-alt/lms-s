<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthenticationRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_a_reset_link_without_revealing_accounts(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'https://frontend.example']);
        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link has been sent.');

        $this->postJson('/api/auth/forgot-password', ['email' => 'missing@example.test'])
            ->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link has been sent.');

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;
            parse_str(parse_url($url, PHP_URL_QUERY), $query);

            return str_starts_with($url, 'https://frontend.example/reset-password?')
                && $query['token'] === $notification->token
                && $query['email'] === $user->email;
        });
    }

    public function test_password_can_be_reset_once_with_a_valid_token(): void
    {
        Notification::fake();
        $user = User::factory()->create(['password' => 'old-password']);
        $token = null;

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $payload = [
            'email' => $user->email,
            'token' => $token,
            'password' => 'a-new-password',
            'password_confirmation' => 'a-new-password',
        ];

        $this->postJson('/api/auth/reset-password', $payload)->assertOk();
        $this->assertTrue(Hash::check('a-new-password', $user->fresh()->password));
        $this->postJson('/api/auth/reset-password', $payload)->assertUnprocessable();
    }

    public function test_invalid_reset_data_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'invalid',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_expired_reset_token_is_rejected(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $token = null;

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $this->travel(config('auth.passwords.users.expire') + 1)->minutes();

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'a-new-password',
            'password_confirmation' => 'a-new-password',
        ])->assertUnprocessable();
    }

    public function test_verification_link_marks_email_verified_and_is_idempotent(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addHour(), [
            'user' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $this->getJson($url)->assertOk()->assertJsonPath('verified', true);
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->getJson($url)->assertOk()->assertJsonPath('verified', true);
    }

    public function test_invalid_verification_link_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $this->getJson("/api/auth/email/verify/{$user->id}/invalid")
            ->assertForbidden()
            ->assertJsonPath('verified', false);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_unverified_user_can_check_status_and_resend_but_not_use_verified_routes(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->getJson('/api/auth/email/status', $headers)
            ->assertOk()->assertJsonPath('verified', false);
        $this->postJson('/api/auth/email/verification-notification', [], $headers)->assertOk();
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->getJson('/api/worksheets', $headers)->assertForbidden();
    }

    public function test_already_verified_user_gets_an_idempotent_resend_response(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/auth/email/verification-notification')
            ->assertOk()
            ->assertJsonPath('message', 'Your email address is already verified.');

        Notification::assertNothingSent();
    }
}
