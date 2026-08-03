# Role Dashboards, Workflow Rules, and Admin Panel Update

## Implemented outcome

The LMS now provides four distinct, API-backed workspaces:

- **Teacher:** student submission review, file access, marks, remarks, progress comments, final evaluation, attempt history, and per-student progress.
- **Parent:** child filtering, assigned work, worksheet download, submission on behalf of a child, submission status/history, marks, remarks, and performance reports.
- **Student:** own assigned work only, worksheet download, permitted submission/resubmission, marks, feedback, attempt history, and reports.
- **Admin:** responsive worksheet administration for upload, title, description, instructions, subject, grade, default marks, default due period, file replacement, publishing, editing, deletion, and complete listing.

Teachers remain unable to create, upload, edit, delete, or assign worksheets. The existing `WorksheetPolicy`, Form Requests, and route middleware enforce this independently of the UI.

## Database changes

### Migration `2026_08_03_000002_add_submission_attempt_rules.php`

- Adds `worksheets.default_due_days` as optional admin-configured assignment metadata.
- Adds `worksheet_assignments.allow_resubmission` (default false).
- Adds `worksheet_assignments.allow_late_submission` (default false).
- Adds `worksheet_submissions.attempt_number`.
- Removes the old unique constraint on `worksheet_submissions.assignment_id`.
- Adds unique `(assignment_id, attempt_number)` so each attempt is immutable and ordered.

Fresh-install migrations were updated with the same final structure. Existing data becomes attempt 1 automatically.

### Updated relationships

```text
WorksheetAssignment 1 ───── * WorksheetSubmission
                                   attempt_number 1..n

WorksheetAssignment ─────── latest submission via latestOfMany(attempt_number)

WorksheetSubmission 1 ───── 0..1 TeacherReview ───── 0..1 PerformanceReport
```

The existing `submission` relationship remains available as the latest attempt, preserving API compatibility. The new `submissions` relationship exposes complete history.

## Backend workflow rules

### Submission

`WorksheetSubmissionController@store` now:

1. Confirms the actor is the assigned student, their parent, or Admin.
2. Rejects work after `due_at` unless `allow_late_submission=true`.
3. Rejects a second attempt unless `allow_resubmission=true`.
4. Stores each permitted attempt as a new row and retains previous files/history.
5. Uses a database row lock and database unique constraint to prevent concurrent duplicate attempt numbers.
6. Deletes the newly stored file if the database transaction fails.
7. Returns the new attempt number in the API response.

### Evaluation

- Review creation is now Teacher-only; Admin retains read/oversight access but does not impersonate a teacher evaluation.
- A teacher must be linked to the submission's student through `teacher_student`.
- Marks must be nonnegative, total marks positive, and obtained marks no greater than total.
- Final evaluation generates/updates the report transactionally.
- Reviewing an older attempt does not incorrectly change the current assignment state; only the latest attempt controls current status.

### Assignment deadlines

- Parent/Admin may choose a due timestamp.
- If omitted and the worksheet has `default_due_days`, the API calculates `due_at` automatically.
- Assignment creation validates that explicit due dates are in the future.
- Late behavior and resubmission behavior are explicit per assignment.

### Student progress API

`GET /api/students/{student}/progress` returns:

- Student identity and class.
- Counts for assignments, submitted work, checked work, and average progress.
- Every assignment.
- Every submission attempt with uploader, teacher review, marks, remarks, and report.
- Performance reports.

Access is limited to Admin, that Student, their Parent, and linked Teachers. All other users receive 403.

## UI changes

### Teacher dashboard

- Heading and statistics are teacher-specific.
- Student selector loads only linked students.
- Progress summary shows average and checked/assignment totals.
- Assigned worksheets are filtered by selected student.
- Each latest unreviewed submission exposes an “Open submitted file” action.
- Evaluation form collects marks, total marks, remarks, and an overall progress comment.
- Submission history displays all attempts and previous evaluation results.
- No worksheet upload, edit, delete, or assignment controls are rendered.

### Parent dashboard

- Child selector makes multi-child accounts easy to navigate.
- Parent can assign a published worksheet to a child with deadline, instructions, resubmission, and late-submission settings.
- Each assignment includes worksheet download, status, deadline, upload control, and attempt history.
- Marks, feedback, and reports are visible after review.
- Backend checks prevent access to another parent's children even if IDs are manually altered.

### Student dashboard

- Shows only the authenticated student's assignments and reports.
- Allows worksheet download and completed-file upload.
- Upload is hidden when already submitted without resubmission permission.
- Expired work displays a clear blocked message unless late submission is allowed.
- All attempt results and teacher feedback are visible.
- No parent, teacher, or admin controls are rendered; backend routes independently reject unauthorized requests.

### Admin panel

- Dedicated `/admin/worksheets` route remains role-protected.
- Responsive two-column form with mobile single-column layout.
- Subject and grade selectors.
- Title, description, learner instructions, default total marks, and default due days.
- PDF/JPG/PNG/WebP upload with size guidance.
- Published/draft selection.
- Edit, optional file replacement, cancel, and delete flows.
- Success/error/loading states and clean full-library listing.

## Modified files

| File | Change |
|---|---|
| `database/migrations/2026_07_28_000002_create_worksheet_tables.php` | Fresh schema default due metadata |
| `database/migrations/2026_07_28_000003_create_assignment_and_submission_tables.php` | Fresh schema resubmission/late flags and attempt history |
| `database/migrations/2026_08_03_000002_add_submission_attempt_rules.php` | Upgrade migration for existing databases |
| `app/Models/Worksheet.php` | Default due-day fillable/cast |
| `app/Models/WorksheetAssignment.php` | New flags/casts plus latest and historical submission relationships |
| `app/Models/WorksheetSubmission.php` | Attempt number support |
| `app/Http/Requests/StoreWorksheetRequest.php` | Default due-day validation |
| `app/Http/Requests/UpdateWorksheetRequest.php` | Default due-day update validation |
| `app/Http/Requests/StoreAssignmentRequest.php` | Late/resubmission boolean validation |
| `app/Http/Requests/StoreTeacherReviewRequest.php` | Teacher-only evaluation; removed unused grade input |
| `app/Http/Controllers/Api/WorksheetAssignmentController.php` | Full attempt history eager loading and automatic due date |
| `app/Http/Controllers/Api/WorksheetSubmissionController.php` | Deadline, duplicate, resubmission, locking, and immutable attempts |
| `app/Http/Controllers/Api/StudentProgressController.php` | New authorized progress/history endpoint |
| `app/Services/ManualReviewService.php` | Latest-attempt state protection |
| `routes/api.php` | Progress route and Teacher-only evaluation write route |
| `resources/js/pages/PortalDashboard.jsx` | Complete role-specific Teacher/Parent/Student/Admin portal workflow |
| `resources/js/pages/AdminWorksheets.jsx` | Redesigned dedicated worksheet admin panel |
| `resources/js/pages/Portal.css` | Responsive portal, form, status, attempt, review, report, and admin styles |
| `tests/Feature/NewBusinessRulesTest.php` | Deadline, duplicate, resubmission, history authorization regression tests |

## Verification

Automated results:

- **13 Laravel tests passed, 70 assertions.**
- Laravel Pint passed for changed files.
- Vite production build passed; 142 modules transformed.
- `git diff --check` passed.
- SQLite upgrade migration ran successfully against the local development database.

Run the checks:

```powershell
php artisan migrate
php artisan test
npm.cmd run build
```

Manual role workflow:

1. Log in as `admin@example.com` / `password` and open `/admin/worksheets`.
2. Upload a worksheet with subject, grade, marks, instructions, and default due period.
3. Log in as `parent@example.com` / `password`, assign it to the demo child, and choose deadline/resubmission rules.
4. Download and submit the work as Parent, or log in as `student@example.com` / `password` and submit it.
5. Confirm a duplicate upload is blocked unless resubmission was enabled.
6. Log in as `teacher@example.com` / `password`, open the submitted file, enter marks and feedback, and submit the final evaluation.
7. Return as Parent/Student and verify status, all attempts, marks, remarks, and performance report.
8. Confirm Teacher cannot access `/admin/worksheets` or worksheet write APIs and Student cannot access teacher/admin/student-directory functionality.

