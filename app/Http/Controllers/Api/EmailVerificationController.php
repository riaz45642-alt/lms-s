<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, User $user, string $hash): RedirectResponse|JsonResponse
    {
        $valid = URL::hasValidSignature($request)
            && hash_equals($hash, sha1($user->getEmailForVerification()));

        if (! $valid) {
            return $this->verificationResult($request, false);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return $this->verificationResult($request, true);
    }

    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Your email address is already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'A new verification link has been sent.']);
    }

    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'verified' => $request->user()->hasVerifiedEmail(),
            'email' => $request->user()->email,
        ]);
    }

    private function verificationResult(Request $request, bool $verified): RedirectResponse|JsonResponse
    {
        $message = $verified
            ? 'Email address verified successfully.'
            : 'This verification link is invalid or has expired.';

        if ($request->expectsJson()) {
            return response()->json(['verified' => $verified, 'message' => $message], $verified ? 200 : 403);
        }

        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        return redirect()->away($frontendUrl.'/verify-email?'.http_build_query([
            'verification' => $verified ? 'success' : 'invalid',
        ]));
    }
}
