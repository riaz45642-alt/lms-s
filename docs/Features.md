# Features

This page describes behavior that was verified in the source code. A feature marked **partial** has some supporting code but is not a complete user-facing function.

## Authentication

**What it does:** Creates accounts, signs users in, remembers an optional login, restores a saved session, and signs users out.

**Who uses it:** Parents, teachers, students, and administrators. Public registration permits parent, teacher, and student accounts only. An administrator cannot self-register.

**How it works:** A successful registration or login returns a personal access token. A token is a secret value used to identify the signed-in user on later requests. It is stored for the browser session, or in longer-lived browser storage when “Remember me” is selected. Login and registration are limited to ten attempts per minute.

**Why it exists:** It protects private dashboards and learning records.

**Limits:** The visible “Forgot password?” and Google login controls are not connected to working recovery or social-login services. Email verification is not enforced.

## Role-based portals

**What they do:** Send each user to an Admin, Teacher, Parent, or Student dashboard and show role-appropriate data.

**How they work:** Roles are stored in the database. The application also checks whether a parent owns the student relationship or a teacher is linked to the student before showing private work.

**Why they exist:** Different users need different actions and must not see unrelated student records.

### Admin portal

Administrators see totals for users, worksheets, assignments, and pending reviews. They can open the worksheet administration panel. The backend also allows administrators to view all students, assignments, reviews, and reports and to create assignments through the API.

There is no working graphical user interface for managing users, roles, classes, subjects, or worksheet bundles.

### Teacher portal

Teachers see only students linked to their teacher profile. They can inspect assignments and submissions, download submitted files, enter marks and comments, and finalize a review. Teachers cannot create assignments or manage worksheets in the current business rules.

### Student portal

Students see their own assignments and reports. They can download worksheets, upload completed files, view attempt history, and edit student profile details.

### Parent portal

Parents see children directly linked to their parent profile. They can assign a published worksheet to a child, choose a future deadline, allow late work or another attempt, upload completed work, and view reports.

## Dashboard

**What it does:** Shows summary counts and the main workflow for the current role.

**Who uses it:** Every signed-in user.

**How it works:** The frontend requests live counts, assignments, and reports from the API. Parents and teachers can filter by child or student. Selecting one also loads a progress summary.

**Why it exists:** It gives users one starting point for their most important work.

## Worksheets

**What it does:** Stores worksheet details and a PDF or image file.

**Who uses it:** Administrators manage worksheets. Parents browse published worksheets. Students and teachers see worksheets connected to authorized assignments.

**How it works:** Administrators can upload, edit, publish, replace, and delete files. Accepted formats are PDF, JPG, JPEG, PNG, and WebP, up to 20 MB. Assigned worksheets cannot be deleted. Search on the worksheet screen filters the currently loaded page by title, subject, or grade.

**Why it exists:** It provides a controlled source of learning material.

## Worksheet bundles — partial

The backend can create a named, ordered collection of worksheets and publish it. Administrators can create and view all bundles; other signed-in users can view published bundles. There is no bundle screen in the active frontend.

## Assignments

**What it does:** Connects one worksheet to one student and records instructions, assignment time, deadline, status, and submission rules.

**Who uses it:** Parents can assign work to their own children. Administrators can create assignments through the API. Teachers can view assignments for linked students. Students see their own work.

**How it works:** A parent chooses a published worksheet and linked child. The deadline must be in the future. If no deadline is supplied, the worksheet's default number of due days is used when available. Status moves from `assigned` to `submitted` and then `checked`.

**Why it exists:** It provides a traceable learning task rather than an unrecorded file download.

## File submission and repeat attempts

**What it does:** Lets students, their parents, or an administrator upload completed work.

**How it works:** Files use the same formats and 20 MB limit as worksheets. The server blocks an unrelated user, a late submission unless late work is allowed, and a second attempt unless resubmission is allowed. Each accepted upload receives an attempt number.

**Why it exists:** It keeps completed work and its history attached to the assignment.

## Teacher review and grading

**What it does:** Records marks, total marks, percentage, remarks, status, and review time.

**Who uses it:** A teacher who is linked to the assignment's student. Administrators may inspect reviews but cannot submit a review through the current endpoint.

**How it works:** The server checks that marks are valid, calculates the percentage, updates the assignment status, and creates or updates a performance report. Grades are A+ (90–100), A (80–89.99), B (70–79.99), C (60–69.99), D (50–59.99), or F (below 50).

**Why it exists:** It makes evaluation consistent and visible to authorized users.

## Reports and progress tracking

**What it does:** Shows grades, percentages, teacher comments, assignment totals, submitted work, checked work, and average progress.

**Who uses it:** Students for themselves, parents for linked children, teachers for linked students they reviewed, and administrators for all students.

**How it works:** A final teacher review creates a performance report. “Average progress” is the average percentage across that student's reports. It is not a long-term predictive score.

**Why it exists:** It turns individual worksheet reviews into an understandable learning record.

## Profile management

Users can change their name. Parents can change a phone number, teachers a specialization, and students a grade level and date of birth. Email addresses, passwords, roles, relationships, employee numbers, and student numbers cannot be changed in the current screen.

## User and academic management — partial

The database contains users, role permissions, classes, subjects, teacher/class/subject links, parent/student links, and teacher/student links. Models support these relationships. However, there are no active API endpoints or screens for administrators to list, create, edit, or delete users, classes, subjects, or links. Public registration is the only implemented account-creation interface.

## Attendance — not implemented

There is no attendance table, endpoint, or active screen. Attendance should not be presented as an available feature.

## Notifications — not implemented

Laravel's notification helper is present on the User model and an unused prototype page exists, but there is no notification table, API, delivery service, or route to that page.

## Direct messages — schema only

The database and model can store messages between two users, including read time. There is no message API or active screen.

## Public content and prototypes

The active site includes Home, Activities, Pricing, About, and Help pages. Their content is static. Many additional React pages and sample data files exist but are not connected to the active router; examples include courses, bookmarks, certificates, calendar, discussions, notifications, settings, and quizzes. They are interface prototypes, not implemented LMS services.

## Security

- Passwords are hashed, meaning the plain password is not stored.
- Protected APIs require a Laravel Sanctum bearer token.
- Role and relationship checks restrict access to records and downloads.
- Inputs are validated for type, size, and allowed values.
- Login and registration are rate-limited.
- Database foreign keys and checks protect important relationships and valid status values.
- Private files are stored on the configured local disk and downloaded through authorized endpoints.

Current security gaps include no email verification, no working password reset, no token expiry configured by this project, and no malware scanning for uploaded files.
