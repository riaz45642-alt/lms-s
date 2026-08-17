<?php

namespace Tests\Feature;

use App\Models\ParentProfile;
use App\Models\User;
use App\Services\Auth0TokenVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use RuntimeException;
use Tests\TestCase;

class Auth0LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_new_google_user_must_choose_a_role_before_an_account_is_created(): void
    {
        $this->fakeAuth0('google-oauth2|1001', 'newcomer@example.com', 'New Comer');

        $this->postJson('/api/auth/auth0/exchange', ['access_token' => 'stub'])
            ->assertOk()
            ->assertJsonPath('needs_role', true)
            ->assertJsonPath('email', 'newcomer@example.com')
            ->assertJsonMissingPath('token');

        $this->assertDatabaseMissing('users', ['email' => 'newcomer@example.com']);
    }

    public function test_a_new_google_user_receives_a_sanctum_token_once_a_role_is_chosen(): void
    {
        $this->fakeAuth0('google-oauth2|1002', 'teacher@example.com', 'Google Teacher');

        $response = $this->postJson('/api/auth/auth0/exchange', [
            'access_token' => 'stub',
            'role' => 'teacher',
            'specialization' => 'Mathematics',
        ])->assertCreated()->assertJsonPath('portal_path', '/teacher');

        $this->assertNotEmpty($response->json('token'));

        $user = User::where('email', 'teacher@example.com')->firstOrFail();
        $this->assertSame('google-oauth2|1002', $user->auth0_sub);
        $this->assertSame('teacher', $user->role);
        $this->assertSame('Mathematics', $user->teacherProfile->specialization);

        // The stored password must not be usable as a login credential.
        $this->postJson('/api/auth/login', ['email' => 'teacher@example.com', 'password' => 'password'])
            ->assertStatus(422);
    }

    public function test_a_returning_google_user_is_matched_on_the_auth0_subject(): void
    {
        $this->fakeAuth0('google-oauth2|1003', 'repeat@example.com', 'Repeat Visitor');

        $this->postJson('/api/auth/auth0/exchange', ['access_token' => 'stub', 'role' => 'parent'])
            ->assertCreated();

        $this->postJson('/api/auth/auth0/exchange', ['access_token' => 'stub'])
            ->assertOk()
            ->assertJsonPath('user.email', 'repeat@example.com')
            ->assertJsonMissingPath('needs_role');

        $this->assertSame(1, User::where('email', 'repeat@example.com')->count());
    }

    public function test_an_existing_password_account_is_linked_by_verified_email(): void
    {
        $existing = User::factory()->create(['email' => 'linked@example.com', 'role' => 'parent']);
        ParentProfile::create(['user_id' => $existing->id]);

        $this->fakeAuth0('google-oauth2|1004', 'linked@example.com', 'Linked Parent');

        $this->postJson('/api/auth/auth0/exchange', ['access_token' => 'stub'])
            ->assertOk()
            ->assertJsonPath('user.id', $existing->id)
            ->assertJsonPath('portal_path', '/parent');

        $this->assertSame('google-oauth2|1004', $existing->fresh()->auth0_sub);
        $this->assertSame(1, User::where('email', 'linked@example.com')->count());
    }

    public function test_an_unverified_google_email_cannot_claim_an_account(): void
    {
        $victim = User::factory()->create(['email' => 'victim@example.com', 'role' => 'parent']);

        $this->fakeAuth0('google-oauth2|1005', 'victim@example.com', 'Impostor', emailVerified: false);

        $this->postJson('/api/auth/auth0/exchange', ['access_token' => 'stub'])
            ->assertStatus(422);

        $this->assertNull($victim->fresh()->auth0_sub);
    }

    public function test_an_untrusted_token_is_rejected(): void
    {
        $this->mock(Auth0TokenVerifier::class, function (MockInterface $mock) {
            $mock->shouldReceive('verify')->andThrow(new RuntimeException('The Auth0 token could not be verified.'));
        });

        $this->postJson('/api/auth/auth0/exchange', ['access_token' => 'forged'])
            ->assertStatus(401);

        $this->assertSame(0, User::count());
    }

    private function fakeAuth0(string $subject, string $email, string $name, bool $emailVerified = true): void
    {
        $this->mock(Auth0TokenVerifier::class, function (MockInterface $mock) use ($subject, $email, $name, $emailVerified) {
            $mock->shouldReceive('verify')->andReturn(['sub' => $subject]);
            $mock->shouldReceive('userInfo')->andReturn([
                'sub' => $subject,
                'email' => $email,
                'email_verified' => $emailVerified,
                'name' => $name,
                'picture' => 'https://example.test/avatar.png',
            ]);
        });
    }
}
