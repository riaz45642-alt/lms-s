<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PerformanceReportController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudentDirectoryController;
use App\Http\Controllers\Api\TeacherReviewController;
use App\Http\Controllers\Api\WorksheetAssignmentController;
use App\Http\Controllers\Api\WorksheetBundleController;
use App\Http\Controllers\Api\WorksheetController;
use App\Http\Controllers\Api\WorksheetSubmissionController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [ProfileController::class, 'show']);
    Route::get('profile', [ProfileController::class, 'show']);
    Route::patch('profile', [ProfileController::class, 'update']);
    Route::get('dashboard', DashboardController::class);
    Route::get('students', StudentDirectoryController::class)->middleware('role:parent,teacher,admin');
    Route::post('auth/logout', [AuthController::class, 'logout']);

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
    Route::post('submissions/{worksheetSubmission}/review', [TeacherReviewController::class, 'store'])->middleware('role:teacher,admin');
    Route::get('reviews/{teacherReview}', [TeacherReviewController::class, 'show']);

    Route::apiResource('performance-reports', PerformanceReportController::class)->only(['index', 'show']);
});
