# LMS frontend/backend integration audit

## Active application architecture

- React entry: `resources/js/FrontendApp.jsx`
- Routing: `resources/js/router/Router.jsx`
- Shared auth/state: `resources/js/context/AppContext.jsx`
- HTTP client: `resources/js/services/api.js` (`VITE_API_URL`, bearer token, timeout, normalized errors, global 401 expiry handling)
- Laravel API routes: `routes/api.php`
- Authentication: Laravel Sanctum personal access tokens
- Authorization: verified-user middleware, role middleware, policies, form requests, model relationship checks, and RBAC permissions

Only pages imported and selected by `FrontendApp.jsx` are part of the active production route graph. Older page modules that import `resources/js/data/*` are retained for compatibility but are not routed by the active application.

## Feature mapping

| Frontend page / feature | API | Controller | Models / tables |
|---|---|---|---|
| Login, registration, logout | `POST /auth/login`, `/auth/register`, `/auth/logout` | `AuthController` | `User`, role-specific profiles, `users`, `personal_access_tokens` |
| Current profile / profile edit | `GET /user`, `GET/PATCH /profile` | `ProfileController` | `User`, `StudentProfile`, `TeacherProfile`, `ParentProfile` |
| Email verification / password recovery | `/auth/email/*`, `/auth/forgot-password`, `/auth/reset-password` | `EmailVerificationController`, `PasswordResetController` | `users`, `password_reset_tokens` |
| Role dashboard | `GET /dashboard` | `DashboardController` | users, profiles, courses, enrollments, worksheets, assignments, reviews, reports, certificates |
| Student/parent/teacher directory and progress | `GET /students`, `/students/{student}/progress` | `StudentDirectoryController`, `StudentProgressController` | profiles, assignments, submissions, reviews, reports |
| Worksheet library and admin CRUD/upload | `/worksheets`, `/worksheets/{id}/download` | `WorksheetController` | `Worksheet`, `worksheets`, filesystem |
| Worksheet bundles | `/worksheet-bundles` | `WorksheetBundleController` | `WorksheetBundle`, `bundle_worksheet` |
| Assignments | `/assignments` | `WorksheetAssignmentController` | `WorksheetAssignment`, students, worksheets |
| Student submissions and downloads | `POST /assignments/{id}/submission`, `/submissions/{id}` | `WorksheetSubmissionController` | `WorksheetSubmission`, filesystem |
| Teacher grading and feedback | `POST /submissions/{id}/review`, `/reviews` | `TeacherReviewController`, `ManualReviewService` | `TeacherReview`, `PerformanceReport` |
| Courses, enrollment, lessons, progress | `/courses`, `/courses/{id}/enroll`, `/lessons/{id}/complete` | `LmsFeatureController` | courses, lessons, course_enrollments, lesson_completions, certificates |
| Workbooks | `/workbooks` | `LmsFeatureController` | workbooks, workbook_worksheet, worksheets |
| Activities/quizzes/results | `/quizzes`, `/quizzes/{id}/attempts` | `LmsFeatureController` | quizzes, quiz_questions, quiz_attempts |
| Saved items | `/content-items`, `/content-items/toggle` | `LmsFeatureController` | user_content_items plus hydrated catalog tables |
| Search and recent activity | `/search`, `/recent-activity` | `LmsFeatureController` | published catalog tables, activity_log |
| Messages | `/messages` | `LmsFeatureController` | `DirectMessage`, direct_messages |
| Notifications | `/notifications` | `LmsFeatureController` | Laravel notifications table |
| Calendar | `/calendar-events` | `LmsFeatureController` | calendar_events, classes and role relationships |
| Classes and subjects | `/classes`, `/subjects` | `LmsFeatureController` | `SchoolClass`, `Subject`, academic relationship tables |
| Admin users and roles | `/admin/users` | `LmsFeatureController` | `User`, roles, permissions, user_roles |
| Public homepage catalog and pricing | `/catalog/home`, `/billing/plans` | `LmsFeatureController` | published worksheets/bundles, billing_plans |
| Newsletter subscription form | `POST /newsletter/subscriptions` | `LmsFeatureController` | newsletter_subscribers |

## Static content policy

Static arrays remain only for editorial/non-transactional content such as FAQs, testimonials, decorative event copy, character configuration, and layout metadata. The active course, worksheet, workbook, quiz, assignment, submission, grade, progress, user, class, subject, message, notification, saved-item, certificate, dashboard, and pricing flows are database-backed.

## Known external dependency

Billing plan selection records a `billing_interests` row with `pending_provider` status. Payment processing, renewals, refunds, invoices, and subscription lifecycle require a payment-provider integration and are intentionally not simulated.
