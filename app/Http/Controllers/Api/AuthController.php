<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Services\Auth0TokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['parent', 'teacher', 'student'])],
            ...$this->profileRules(),
        ]);

        $this->assertProfileLinksMatchRole($data);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
            ]);

            $this->createProfileFor($user, $data);

            return $user;
        });

        return response()->json($this->tokenPayload($user), 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        // Social-only accounts have no usable password, so they must never reach
        // Hash::check with a null hash.
        if (! $user || blank($user->password) || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['The supplied credentials are invalid.']]);
        }

        return response()->json($this->tokenPayload($user));
    }

    /**
     * Trade a verified Auth0 access token for a Sanctum token.
     *
     * Auth0 proves who the person is; it cannot know whether they are a parent,
     * teacher or student. A first-time visitor therefore gets `needs_role` back
     * and the SPA re-posts the same token together with the chosen role.
     */
    public function auth0Exchange(Request $request, Auth0TokenVerifier $verifier)
    {
        $data = $request->validate([
            'access_token' => ['required', 'string'],
            'role' => ['nullable', Rule::in(['parent', 'teacher', 'student'])],
            'name' => ['nullable', 'string', 'max:255'],
            ...$this->profileRules(),
        ]);

        try {
            $claims = $verifier->verify($data['access_token']);
            $profile = $verifier->userInfo($data['access_token']);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 401);
        }

        $subject = $claims['sub'];
        $email = $profile['email'] ?? null;
        $emailVerified = (bool) ($profile['email_verified'] ?? false);
        $avatar = $profile['picture'] ?? null;

        $user = User::where('auth0_sub', $subject)->first();

        if ($user) {
            $user->forceFill(['avatar_url' => $avatar])->save();

            return response()->json($this->tokenPayload($user));
        }

        if (blank($email)) {
            throw ValidationException::withMessages([
                'access_token' => ['Auth0 did not return an email address for this account.'],
            ]);
        }

        if (! $emailVerified) {
            throw ValidationException::withMessages([
                'access_token' => ['Verify your email with the identity provider before signing in.'],
            ]);
        }

        // An existing password account keeps its role and profiles; we only attach
        // the Auth0 subject so later logins resolve on the first lookup above.
        $existing = User::where('email', $email)->first();

        if ($existing) {
            $existing->forceFill([
                'auth0_sub' => $subject,
                'avatar_url' => $avatar,
            ])->save();

            return response()->json($this->tokenPayload($existing));
        }

        if (blank($data['role'] ?? null)) {
            return response()->json([
                'needs_role' => true,
                'name' => $profile['name'] ?? '',
                'email' => $email,
                'avatar_url' => $avatar,
            ]);
        }

        $this->assertProfileLinksMatchRole($data);

        $user = DB::transaction(function () use ($data, $profile, $email, $subject, $avatar) {
            $user = User::create([
                'name' => $data['name'] ?? $profile['name'] ?? Str::before($email, '@'),
                'email' => $email,
                // Social accounts authenticate through Auth0 only. A random secret
                // keeps the column populated without granting a password login.
                'password' => Str::random(64),
                'role' => $data['role'],
                'auth0_sub' => $subject,
                'avatar_url' => $avatar,
            ]);

            $this->createProfileFor($user, $data);

            return $user;
        });

        return response()->json($this->tokenPayload($user), 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    /**
     * Validation rules for the optional subtype fields shared by both sign-up paths.
     *
     * @return array<string, array<int, string>>
     */
    private function profileRules(): array
    {
        return [
            'grade_level' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'phone' => ['nullable', 'string', 'max:30'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:parent_profiles,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:teacher_profiles,id'],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertProfileLinksMatchRole(array $data): void
    {
        if ($data['role'] !== 'student' && (isset($data['parent_id']) || isset($data['teacher_id']))) {
            throw ValidationException::withMessages([
                'role' => ['Parent ID and Teacher ID can only be used when registering a student.'],
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createProfileFor(User $user, array $data): void
    {
        match ($data['role']) {
            'parent' => ParentProfile::create(['user_id' => $user->id, 'phone' => $data['phone'] ?? null]),
            'teacher' => TeacherProfile::create(['user_id' => $user->id, 'specialization' => $data['specialization'] ?? null]),
            'student' => StudentProfile::create([
                'user_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
                'grade_level' => $data['grade_level'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
            ]),
        };

        if ($data['role'] === 'student' && isset($data['teacher_id'])) {
            $user->studentProfile->teachers()->attach($data['teacher_id']);
        }
    }

    private function tokenPayload(User $user): array
    {
        return [
            'token' => $user->createToken('lms-web')->plainTextToken,
            'portal_path' => $user->portalPath(),
            'user' => $user->load(
                'roles.permissions',
                'parentProfile',
                'teacherProfile',
                'studentProfile.parent.user',
                'studentProfile.teachers.user',
                'studentProfile.schoolClass'
            ),
        ];
    }
}
