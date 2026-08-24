<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PerformanceReportController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudentDirectoryController;
use App\Http\Controllers\Api\StudentProgressController;
use App\Http\Controllers\Api\TeacherReviewController;
use App\Http\Controllers\Api\WorksheetAssignmentController;
use App\Http\Controllers\Api\WorksheetBundleController;
use App\Http\Controllers\Api\WorksheetController;
use App\Http\Controllers\Api\WorksheetSubmissionController;
use App\Http\Controllers\Api\LmsFeatureController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('google', [LmsFeatureController::class, 'google'])->middleware('throttle:10,1');
    Route::post('forgot-password', [PasswordResetController::class, 'requestLink'])->middleware('throttle:5,1');
    Route::post('reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');
    Route::get('email/verify/{user}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('throttle:6,1')
        ->name('verification.verify');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [ProfileController::class, 'show']);
    Route::get('profile', [ProfileController::class, 'show']);
    Route::patch('profile', [ProfileController::class, 'update']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/email/status', [EmailVerificationController::class, 'status']);
    Route::post('auth/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1');

    Route::middleware('verified')->group(function () {
        Route::get('dashboard', DashboardController::class);
        Route::get('students', StudentDirectoryController::class)->middleware('role:parent,teacher,admin');
        Route::get('students/{student}/progress', StudentProgressController::class);
        Route::apiResource('worksheets', WorksheetController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::get('worksheets/{worksheet}/download', [WorksheetController::class, 'download']);
        Route::apiResource('worksheet-bundles', WorksheetBundleController::class)->only(['index', 'store', 'show']);

        Route::apiResource('assignments', WorksheetAssignmentController::class)
            ->parameters(['assignments' => 'worksheetAssignment'])
            ->only(['index', 'store', 'show']);

        Route::post('assignments/{worksheetAssignment}/submission', [WorksheetSubmissionController::class, 'store']);
        Route::get('submissions/{worksheetSubmission}', [WorksheetSubmissionController::class, 'show']);
        Route::get('submissions/{worksheetSubmission}/download', [WorksheetSubmissionController::class, 'download']);

        Route::get('reviews', [TeacherReviewController::class, 'index'])->middleware('role:teacher,admin');
        Route::post('submissions/{worksheetSubmission}/review', [TeacherReviewController::class, 'store'])->middleware('role:teacher');
        Route::get('reviews/{teacherReview}', [TeacherReviewController::class, 'show']);

        Route::apiResource('performance-reports', PerformanceReportController::class)->only(['index', 'show']);
        Route::get('courses', [LmsFeatureController::class, 'courses']);
        Route::post('courses', [LmsFeatureController::class, 'storeCourse']);
        Route::get('courses/{id}', [LmsFeatureController::class, 'course'])->whereNumber('id');
        Route::post('courses/{id}/enroll', [LmsFeatureController::class, 'enroll'])->whereNumber('id');
        Route::post('lessons/{id}/complete', [LmsFeatureController::class, 'completeLesson'])->whereNumber('id');
        Route::get('workbooks', [LmsFeatureController::class, 'workbooks']);
        Route::post('workbooks', [LmsFeatureController::class, 'storeWorkbook']);
        Route::get('workbooks/{id}', [LmsFeatureController::class, 'workbook'])->whereNumber('id');
        Route::get('quizzes', [LmsFeatureController::class, 'quizzes']);
        Route::post('quizzes', [LmsFeatureController::class, 'storeQuiz']);
        Route::get('quizzes/{id}', [LmsFeatureController::class, 'quiz'])->whereNumber('id');
        Route::post('quizzes/{id}/attempts', [LmsFeatureController::class, 'submitQuiz'])->whereNumber('id');
        Route::get('content-items', [LmsFeatureController::class, 'contentItems']);
        Route::post('content-items/toggle', [LmsFeatureController::class, 'toggleContentItem']);
        Route::get('recent-activity', [LmsFeatureController::class, 'recent']);
        Route::get('search', [LmsFeatureController::class, 'search'])->middleware('throttle:30,1');
        Route::get('messages', [LmsFeatureController::class, 'messages']);
        Route::post('messages', [LmsFeatureController::class, 'sendMessage']);
        Route::patch('messages/{message}/read', [LmsFeatureController::class, 'readMessage']);
        Route::get('notifications', [LmsFeatureController::class, 'notifications']);
        Route::patch('notifications/{id}/read', [LmsFeatureController::class, 'readNotification']);
        Route::get('calendar-events', [LmsFeatureController::class, 'calendar']);
        Route::post('calendar-events', [LmsFeatureController::class, 'storeCalendarEvent']);
        Route::get('certificates', [LmsFeatureController::class, 'certificates']);
        Route::get('classes', [LmsFeatureController::class, 'classes']);
        Route::post('classes', [LmsFeatureController::class, 'storeClass']);
        Route::post('classes/{class}/students', [LmsFeatureController::class, 'assignStudent']);
        Route::get('subjects', [LmsFeatureController::class, 'subjects']);
        Route::post('subjects', [LmsFeatureController::class, 'storeSubject']);
        Route::get('admin/users', [LmsFeatureController::class, 'users']);
        Route::patch('admin/users/{user}', [LmsFeatureController::class, 'updateUser']);
        Route::get('billing/plans', [LmsFeatureController::class, 'billingPlans']);
        Route::post('billing/interests', [LmsFeatureController::class, 'billingInterest']);
    });
});
