# API Documentation

## Conventions

The base path is `/api`. Send and receive JSON unless a file is being uploaded or downloaded.

For every protected endpoint, send:

```http
Authorization: Bearer YOUR_TOKEN
Accept: application/json
```

File uploads use `multipart/form-data`. List endpoints return Laravel pagination with `data`, page numbers, and navigation URLs. IDs shown below are examples.

### Common errors

| Status | Meaning | Example body |
|---|---|---|
| `401` | Missing or invalid token | `{"message":"Unauthenticated."}` |
| `403` | Role or relationship is not allowed | `{"message":"This action is unauthorized."}` |
| `404` | Record or stored file was not found | `{"message":"Not Found"}` |
| `422` | Submitted values are invalid | `{"message":"The given data was invalid.","errors":{"email":["..."]}}` |
| `429` | Too many login or registration attempts | `{"message":"Too Many Attempts."}` |
| `500` | Unexpected server error | Error detail is hidden in production |

## Authentication and profile

### Register

- **Method and URL:** `POST /api/auth/register`
- **Purpose:** Create a parent, teacher, or student account and return a token.
- **Authentication:** No. Limited to 10 requests per minute.
- **Request:**

```json
{
  "name": "Amina Student",
  "email": "amina@example.com",
  "password": "strong-password",
  "password_confirmation": "strong-password",
  "role": "student",
  "grade_level": "Year 4",
  "parent_id": 2,
  "teacher_id": 3
}
```

- **Response `201`:** `{"token":"1|secret...","portal_path":"/student","user":{"id":8,"name":"Amina Student","role":"student","student_profile":{"parent_id":2}}}`
- **Possible errors:** `422` for duplicate email, short/unconfirmed password, invalid role, missing linked profile, a future birth date, or parent/teacher IDs supplied for a non-student; `429`.

### Login

- **Method and URL:** `POST /api/auth/login`
- **Purpose:** Check credentials and create an API token.
- **Authentication:** No. Limited to 10 requests per minute.
- **Request:** `{"email":"student@example.com","password":"password"}`
- **Response `200`:** `{"token":"2|secret...","portal_path":"/student","user":{"id":4,"name":"Demo Student","role":"student"}}`
- **Possible errors:** `422` for invalid email format or credentials; `429`.

### Logout

- **Method and URL:** `POST /api/auth/logout`
- **Purpose:** Delete the token used for this request.
- **Authentication:** Required.
- **Request:** No body.
- **Response `204`:** Empty body.
- **Possible errors:** `401`.

### Current user

- **Method and URLs:** `GET /api/user` and `GET /api/profile`
- **Purpose:** Return the account, roles, permissions, role profile, and authorized relationship details. Both URLs run the same action.
- **Authentication:** Required.
- **Request:** No body.
- **Response `200`:** `{"id":4,"name":"Demo Student","email":"student@example.com","role":"student","roles":[{"slug":"student"}],"student_profile":{"grade_level":"Year 4"}}`
- **Possible errors:** `401`.

### Update profile

- **Method and URL:** `PATCH /api/profile`
- **Purpose:** Change supported fields for the current role.
- **Authentication:** Required.
- **Request:** `{"name":"Amina Khan","grade_level":"Year 5","date_of_birth":"2016-04-12"}`
- **Response `200`:** The updated user object, in the same general form as Current user.
- **Possible errors:** `401`; `422` for blank/long name, long role field, invalid date, or a birth date today/in the future. Irrelevant fields are validated but only the field belonging to the user's profile type is saved.

## Dashboard and students

### Dashboard summary

- **Method and URL:** `GET /api/dashboard`
- **Purpose:** Return role-specific counts.
- **Authentication:** Required.
- **Request:** No body.
- **Response `200`:** `{"role":"student","counts":{"students":1,"assignments":3,"completed":1,"reports":1}}`
- **Possible errors:** `401`. A user without the expected profile may receive zero/empty counts.

### Student directory

- **Method and URL:** `GET /api/students`
- **Purpose:** List all students for an admin, linked students for a teacher, or children for a parent.
- **Authentication:** Required; role must be admin, teacher, or parent.
- **Request:** No body.
- **Response `200`:** `[{"id":1,"grade_level":"Year 4","user":{"id":4,"name":"Demo Student"},"parent":{"user":{"name":"Demo Parent"}},"teachers":[]}]`
- **Possible errors:** `401`, `403`.

### Student progress

- **Method and URL:** `GET /api/students/{student}/progress`
- **Purpose:** Return one student's details, summary, assignment history, attempts, reviews, and reports.
- **Authentication:** Required. Allowed for the student, their direct parent, a linked teacher, or an admin.
- **Request:** No body.
- **Response `200`:**

```json
{
  "student": {"id": 1, "user": {"name": "Demo Student"}},
  "summary": {"assignments": 2, "submitted": 1, "checked": 1, "average_progress": 85},
  "assignments": [],
  "reports": []
}
```

- **Possible errors:** `401`, `403`, `404`.

## Worksheets

### List worksheets

- **Method and URL:** `GET /api/worksheets`
- **Purpose:** List accessible worksheets, 20 per page.
- **Authentication:** Required.
- **Query:** Optional `subject`, `grade_level`, and `page`.
- **Access behavior:** Admins see all. Parents see published items. Students see assigned items. Teachers see items assigned to linked students.
- **Request example:** `GET /api/worksheets?subject=Maths&grade_level=Year%204`
- **Response `200`:** `{"current_page":1,"data":[{"id":5,"title":"Fractions","subject":"Maths","grade_level":"Year 4","is_published":true,"creator":{"name":"Demo Admin"}}],"last_page":1}`
- **Possible errors:** `401`, `403` for a user outside supported roles.

### Create worksheet

- **Method and URL:** `POST /api/worksheets`
- **Purpose:** Upload a worksheet and its details.
- **Authentication:** Required; admin only.
- **Request:** `multipart/form-data` with required `title`, `subject`, `grade_level`, and `file`; optional `description`, `instructions`, `default_total_marks`, `default_due_days`, and `is_published`.
- **Example fields:** `title=Fractions`, `subject=Maths`, `grade_level=Year 4`, `is_published=1`, `file=@fractions.pdf`.
- **Response `201`:** `{"id":5,"title":"Fractions","file_path":"worksheets/...pdf","original_filename":"fractions.pdf","is_published":true,"creator":{"id":1}}`
- **Possible errors:** `401`, `403`, `422` for missing fields, unsupported file, file over 20 MB, non-positive marks, or due days outside 1–365; `500` on storage failure.

### Show worksheet

- **Method and URL:** `GET /api/worksheets/{worksheet}`
- **Purpose:** Return details and bundle membership.
- **Authentication:** Required and authorized for that worksheet.
- **Request:** No body.
- **Response `200`:** `{"id":5,"title":"Fractions","description":"Practice halves","bundles":[]}`
- **Possible errors:** `401`, `403`, `404`.

### Update worksheet

- **Method and URL:** `PUT|PATCH /api/worksheets/{worksheet}`
- **Purpose:** Change details and optionally replace the file.
- **Authentication:** Required; admin only.
- **Request:** JSON for text-only changes or `multipart/form-data` when sending `file`. Example: `{"title":"Fractions Practice","is_published":true}`.
- **Response `200`:** Updated worksheet with creator.
- **Possible errors:** `401`, `403`, `404`, `422` with the same field rules as creation. If replacement fails, the newly stored file is removed and the old file is kept.

### Delete worksheet

- **Method and URL:** `DELETE /api/worksheets/{worksheet}`
- **Purpose:** Delete an unassigned worksheet and its file.
- **Authentication:** Required; admin only.
- **Request:** No body.
- **Response `204`:** Empty body.
- **Possible errors:** `401`, `403`, `404`, `409` with `{"message":"Assigned worksheets cannot be deleted."}`.

### Download worksheet

- **Method and URL:** `GET /api/worksheets/{worksheet}/download`
- **Purpose:** Download the private worksheet using its original filename.
- **Authentication:** Required and authorized for that worksheet.
- **Request:** No body.
- **Response `200`:** Binary file with download headers, not JSON.
- **Possible errors:** `401`, `403`, `404` for missing record or missing stored file.

## Worksheet bundles

### List bundles

- **Method and URL:** `GET /api/worksheet-bundles`
- **Purpose:** List ordered worksheet collections, 20 per page.
- **Authentication:** Required. Admins see all; other users see published bundles only.
- **Request:** Optional `page` query.
- **Response `200`:** `{"data":[{"id":2,"title":"Year 4 Pack","is_published":true,"worksheets":[]}]}`
- **Possible errors:** `401`.

### Create bundle

- **Method and URL:** `POST /api/worksheet-bundles`
- **Purpose:** Create a collection and set worksheet order.
- **Authentication:** Required; admin only.
- **Request:** `{"title":"Year 4 Pack","description":"Term practice","is_published":true,"worksheet_ids":[5,8]}`
- **Response `201`:** `{"id":2,"title":"Year 4 Pack","worksheets":[{"id":5},{"id":8}]}`
- **Possible errors:** `401`, `403`, `422` for missing title, duplicate/unknown worksheet IDs, or excessive text.

### Show bundle

- **Method and URL:** `GET /api/worksheet-bundles/{worksheet_bundle}`
- **Purpose:** Return a bundle and its ordered worksheets.
- **Authentication:** Required. Draft bundles are admin-only.
- **Request:** No body.
- **Response `200`:** `{"id":2,"title":"Year 4 Pack","creator":{"name":"Demo Admin"},"worksheets":[]}`
- **Possible errors:** `401`, `403`, `404`.

## Assignments and submissions

### List assignments

- **Method and URL:** `GET /api/assignments`
- **Purpose:** List assignments, attempts, latest submission, and result details, 20 per page.
- **Authentication:** Required.
- **Query:** Optional `status` and `page`. Status is passed directly to the query; callers should use `assigned`, `submitted`, or `checked`.
- **Access behavior:** Students see their own, parents their children, teachers linked students, and admins all.
- **Response `200`:** `{"data":[{"id":10,"status":"assigned","worksheet":{"id":5,"title":"Fractions"},"student":{"user":{"name":"Demo Student"}},"submissions":[]}]}`
- **Possible errors:** `401`.

### Create assignment

- **Method and URL:** `POST /api/assignments`
- **Purpose:** Assign a worksheet to a student.
- **Authentication:** Required; parent or admin. A parent is limited to their children and published worksheets.
- **Request:**

```json
{
  "worksheet_id": 5,
  "student_id": 1,
  "instructions": "Complete questions 1–10",
  "due_at": "2026-08-10T16:00:00Z",
  "allow_resubmission": true,
  "allow_late_submission": false
}
```

- **Response `201`:** `{"id":10,"status":"assigned","assigned_at":"...","worksheet":{"id":5},"student":{"id":1},"assigner":{"id":3}}`
- **Possible errors:** `401`, `403` for wrong role or unrelated child; `404` if an ID disappears between validation and creation; `422` for unknown IDs, a deadline not after now, or a parent selecting a draft.

### Show assignment

- **Method and URL:** `GET /api/assignments/{worksheetAssignment}`
- **Purpose:** Return one assignment with all attempts and result details.
- **Authentication:** Required for the student, direct parent, linked teacher, or admin.
- **Request:** No body.
- **Response `200`:** `{"id":10,"status":"submitted","submission":{"id":20,"attempt_number":1},"submissions":[{"id":20}]}`
- **Possible errors:** `401`, `403`, `404`.

### Submit completed work

- **Method and URL:** `POST /api/assignments/{worksheetAssignment}/submission`
- **Purpose:** Upload one completed-work attempt and mark the assignment submitted.
- **Authentication:** Required; student, parent, or admin. Student and parent relationship rules apply.
- **Request:** `multipart/form-data` with required `file` and optional `student_note`. Example: `file=@completed.pdf`, `student_note=My answers`.
- **Response `201`:** `{"id":20,"assignment_id":10,"attempt_number":1,"original_filename":"completed.pdf","submitted_at":"...","review":null}`
- **Possible errors:** `401`, `403`, `404`, `409` for a passed deadline or forbidden repeat attempt, `422` for an unsupported/missing file or file over 20 MB, `500` on storage failure. A file stored before a failed database operation is cleaned up.

### Show submission

- **Method and URL:** `GET /api/submissions/{worksheetSubmission}`
- **Purpose:** Return submission, assignment, student, uploader, review, and report details.
- **Authentication:** Required for the student, direct parent, linked teacher, or admin.
- **Request:** No body.
- **Response `200`:** `{"id":20,"attempt_number":1,"uploader":{"name":"Demo Student"},"review":{"status":"checked","percentage":"85.00"}}`
- **Possible errors:** `401`, `403`, `404`.

### Download submission

- **Method and URL:** `GET /api/submissions/{worksheetSubmission}/download`
- **Purpose:** Download the private completed-work file.
- **Authentication:** Required for the student, direct parent, linked teacher, or admin.
- **Request:** No body.
- **Response `200`:** Binary file with download headers.
- **Possible errors:** `401`, `403`, `404` for missing record or stored file.

## Reviews and reports

### List reviews

- **Method and URL:** `GET /api/reviews`
- **Purpose:** List reviews, 20 per page. Teachers see their own; admins see all.
- **Authentication:** Required; teacher or admin.
- **Query:** Optional `status` and `page`.
- **Response `200`:** `{"data":[{"id":30,"status":"pending","teacher":{"user":{"name":"Demo Teacher"}},"submission":{"id":20},"report":null}]}`
- **Possible errors:** `401`, `403`.

### Create or update a teacher review

- **Method and URL:** `POST /api/submissions/{worksheetSubmission}/review`
- **Purpose:** Save a pending review or final checked evaluation. A checked evaluation creates or updates a report.
- **Authentication:** Required; teacher only, and the teacher must be linked to the student.
- **Request:** `{"status":"checked","obtained_marks":17,"total_marks":20,"remarks":"Good work","teacher_comment":"Steady progress"}`
- **Response `201` for first review or `200` for update:** `{"id":30,"status":"checked","percentage":"85.00","report":{"overall_grade":"A","progress":"85.00"}}`
- **Possible errors:** `401`, `403`, `404`, `422` for no teacher profile, missing/invalid marks, marks above total, non-positive total, invalid status, or excessive comments.

### Show review

- **Method and URL:** `GET /api/reviews/{teacherReview}`
- **Purpose:** Return a review, its assignment, student, and report.
- **Authentication:** Required for its teacher, student, direct parent, or any admin.
- **Request:** No body.
- **Response `200`:** `{"id":30,"status":"checked","percentage":"85.00","report":{"overall_grade":"A"}}`
- **Possible errors:** `401`, `403`, `404`.

### List performance reports

- **Method and URL:** `GET /api/performance-reports`
- **Purpose:** List visible final reports, 20 per page.
- **Authentication:** Required. Students see their own, parents their children's, teachers reports from their reviews, and admins all.
- **Request:** Optional `page` query.
- **Response `200`:** `{"data":[{"id":40,"overall_grade":"A","progress":"85.00","teacher_comment":"Steady progress"}]}`
- **Possible errors:** `401`. Unsupported roles receive an empty list.

### Show performance report

- **Method and URL:** `GET /api/performance-reports/{performance_report}`
- **Purpose:** Return one complete report and source review.
- **Authentication:** Required for the student, direct parent, review teacher, or admin.
- **Request:** No body.
- **Response `200`:** `{"id":40,"student":{"user":{"name":"Demo Student"}},"overall_grade":"A","progress":"85.00","review":{"percentage":"85.00"}}`
- **Possible errors:** `401`, `403`, `404`.

## Non-API routes

`GET /{path?}` returns the React application for every non-API path. Laravel Sanctum also registers `GET /sanctum/csrf-cookie`, but the active frontend uses bearer tokens and does not call that cookie endpoint. Development-only Laravel Ignition routes may appear when the debugging package is enabled; they are framework diagnostics, not LMS APIs, and must not be exposed with debug mode enabled in production.
