<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PerformanceReportController;
use App\Http\Controllers\Api\TeacherReviewController;
use App\Http\Controllers\Api\WorksheetAssignmentController;
use App\Http\Controllers\Api\WorksheetBundleController;
use App\Http\Controllers\Api\WorksheetController;
use App\Http\Controllers\Api\WorksheetSubmissionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', fn (Request $request) => $request->user()->load('parentProfile', 'teacherProfile', 'studentProfile'));
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('worksheets', WorksheetController::class)->only(['index', 'store', 'show', 'destroy']);
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
