# LMS Business Requirements Implementation

## Outcome

The LMS now enforces four primary roles (`admin`, `teacher`, `parent`, `student`), makes worksheet management admin-only, models one parent with many students, keeps the appropriate many-to-many teacher/student relationship, supports registration-time parent/teacher linking, allows students to submit only their own assigned work, and connects the active React portal to the Laravel API.

## Database changes

### New migration

`2026_08_03_000001_apply_new_lms_business_rules.php` safely upgrades an existing database:

- Adds nullable `student_profiles.parent_id` with an indexed foreign key to `parent_profiles`, using `NULL ON DELETE`.
- Copies each legacy student's first parent link from `parent_student`, then removes that pivot table.
- Adds `created_by` foreign keys to `worksheets` and `worksheet_bundles` and backfills them from the legacy owning teacher's user.
- Makes legacy `teacher_id` nullable so old rows remain attributable while new worksheet ownership is admin-user based.
- On PostgreSQL, makes `created_by` required after backfill.
- Adds `worksheets.manage`, grants it to Admin, and revokes worksheet creation/management from Teacher.
- Merges users from any non-primary role into Admin, removes obsolete role records, and restores the PostgreSQL check constraint limiting `users.role` to the four primary roles.

The original identity/worksheet/RBAC migrations were also updated so a brand-new database is created directly in the new normalized form without first creating obsolete structures.

### Relationships after migration

```text
ParentProfile 1 ──────── * StudentProfile
                       parent_id

TeacherProfile * ─────── * StudentProfile
                    teacher_student

User (Admin) 1 ───────── * Worksheet
                       created_by

StudentProfile 1 ─────── * WorksheetAssignment
Worksheet 1 ──────────── * WorksheetAssignment
WorksheetAssignment 1 ─ 0..1 Submission ─ 0..1 Review ─ 0..1 Report
```

## Authorization behavior

| Role | Worksheet access | Assignment/submission/review access |
|---|---|---|
| Admin | List, create, upload, edit, replace file, publish, delete, download | Full assignment/report visibility; may assign any student |
| Teacher | Only worksheets/assignments belonging to linked students; cannot create/edit/delete/assign worksheets | May review submissions from linked students and submit marks/remarks/results |
| Parent | Published worksheet catalogue and assignments for own children | May assign published worksheets to own children and submit for them |
| Student | Only worksheets assigned directly to the student | May view own assignments, submit own work, and view review marks/remarks/reports |

`WorksheetPolicy` is the canonical worksheet gate. Form Requests add role protection on writes, while controllers enforce student/parent/teacher row ownership. Unknown roles now receive an empty performance-report scope rather than all reports.

## Registration behavior

`POST /api/auth/register` accepts optional `parent_id` and `teacher_id` only for `role=student`:

- Valid parent profile ID: saved as `student_profiles.parent_id` automatically.
- No parent ID: standalone student with `parent_id = NULL`.
- Valid teacher profile ID: attached in `teacher_student` automatically.
- Unknown IDs: standard 422 validation response with the relevant field error.
- IDs supplied for a non-student role: 422 response explaining that links are student-only.

IDs refer to profile IDs (`parent_profiles.id`, `teacher_profiles.id`), not user IDs. The UI labels this explicitly.

## New and changed APIs

- `GET /api/user` now returns the complete role-aware profile graph.
- `GET /api/profile` returns the authenticated profile.
- `PATCH /api/profile` updates common name and the allowed role-specific fields.
- `GET /api/dashboard` returns role-scoped real counts.
- `GET /api/students` lists all students for Admin, children for Parent, and linked students for Teacher; Student is forbidden.
- `PUT|PATCH /api/worksheets/{worksheet}` provides admin-only metadata/file updates.
- `POST /api/worksheets`, worksheet update, and delete are admin-only.
- `GET /api/worksheets` is scoped by role.
- `POST /api/assignments` is Parent/Admin only; Teacher assignment creation was removed.
- `POST /api/assignments/{assignment}/submission` now permits the assigned Student as well as linked Parent/Admin.
- Teacher review ownership is based on the teacher/student link, not obsolete worksheet ownership.

## Frontend integration

The active React application now includes:

- Axios API client with automatic Sanctum bearer header.
- Session token storage by default and local storage only when “Remember me” is chosen.
- Initial `/api/user` session restoration and invalid-token cleanup.
- Real login, registration, logout, profile update, loading states, validation messages, and API error display.
- Registration roles matching backend values and optional parent/teacher profile IDs for students.
- Protected `/admin`, `/teacher`, `/parent`, `/student`, `/dashboard`, `/profile`, `/worksheets`, and worksheet-detail routes.
- Role-aware navigation with dashboard/logout controls; students receive no admin/teacher management links.
- Real dashboard counts, assignments, reports, assignment creation, student/parent file submission, and teacher evaluation.
- Admin-only worksheet management UI for create/upload/edit/replace/delete/publish.
- Worksheet list, detail, authorization, and download backed by real APIs rather than static worksheet arrays.

Marketing-only features such as activities, pricing, testimonials, and FAQs remain static because no completed backend API exists for those features.

## Modified files

### Laravel application

- `AuthController.php`: registration linking fields and richer token payload.
- `DashboardController.php`: new role-scoped dashboard counts.
- `ProfileController.php`: new profile read/update API.
- `StudentDirectoryController.php`: new authorized student lookup.
- `WorksheetController.php`: policy-scoped list/view and admin create/update/delete.
- `WorksheetBundleController.php`: admin ownership/creation.
- `WorksheetAssignmentController.php`: parent/admin assignment and linked-teacher visibility.
- `WorksheetSubmissionController.php`: assigned-student submissions and linked-teacher access.
- `TeacherReviewController.php`: linked-student review authorization.
- `PerformanceReportController.php`: explicit default-deny scoping.
- `StoreWorksheetRequest.php`, `UpdateWorksheetRequest.php`, `StoreBundleRequest.php`, `StoreAssignmentRequest.php`, `StoreSubmissionRequest.php`: revised role and update validation.
- `WorksheetPolicy.php` and `AuthServiceProvider.php`: centralized worksheet policy registration.
- `ParentProfile.php`, `StudentProfile.php`, `Worksheet.php`, `WorksheetBundle.php`, `User.php`: new relationships/ownership/helper behavior.
- `routes/api.php`: profile, dashboard, students, and worksheet update routes.

### Database and seed data

- Identity, worksheet, and RBAC base migrations.
- New business-rule upgrade migration.
- `LmsDemoSeeder.php`: direct `parent_id` relationship.

### React

- `services/api.js`: token-aware Axios client and error normalization.
- `context/AppContext.jsx`: authentication/session/profile provider plus existing catalogue state.
- `Login.jsx`, `Signup.jsx`, `Navbar.jsx`, `Auth.css`: real authentication, correct roles, errors/loading, role navigation/logout.
- `FrontendApp.jsx`: protected and role-restricted route selection.
- `PortalDashboard.jsx`, `AccountProfile.jsx`, `AdminWorksheets.jsx`, `Portal.css`: new real-data portal screens.
- `Worksheets.jsx`, `WorksheetDetails.jsx`: replaced static worksheet data with API list/detail/download.

### Tests and documentation

- `ManualWorksheetWorkflowTest.php`: admin creates worksheet while linked teacher reviews.
- `RbacAcademicArchitectureTest.php`: verifies teacher worksheet grants are removed and Admin receives management permission.
- `NewBusinessRulesTest.php`: admin-only management, registration links, invalid/standalone registration, one-to-many parenting, own-student submission, teacher visibility/restrictions, and student restrictions.
- Baseline reverse-engineering report now points to this post-change document.

## Verification

Run:

```powershell
php artisan migrate
php artisan db:seed --class=LmsDemoSeeder
php artisan test
npm.cmd run build
```

Manual workflow:

1. Log in as Admin and create/publish a worksheet.
2. Assign it to a student from the Admin dashboard, or log in as the linked Parent and assign it.
3. Log in as the Student, confirm only assigned worksheets/navigation are visible, and upload completed work.
4. Log in as a linked Teacher, enter marks and remarks, and submit the evaluation.
5. Log back in as Student/Parent and verify remarks, marks, and the generated performance report.
6. Confirm Teacher receives 403 for worksheet creation/deletion and assignment creation.
7. Register students with a valid parent ID, no parent ID, a valid teacher ID, and invalid IDs to verify all linking cases.

## Automated results

- Laravel: **11 tests passed, 55 assertions**.
- Vite production build: **successful**, 142 modules transformed.
- PHP formatting: Laravel Pint completed successfully on changed backend files. A repository-wide `--test` also reports four pre-existing framework scaffold style findings in `Handler.php`, `Http/Kernel.php`, `RedirectIfAuthenticated.php`, and `UserFactory.php`; these unrelated files were intentionally left unchanged.
