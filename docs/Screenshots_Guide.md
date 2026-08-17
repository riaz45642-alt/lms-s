# Screenshots Guide

## Where to place screenshots

Create this folder inside the documentation folder:

```text
docs/
└── screenshots/
    ├── login/
    ├── dashboard/
    ├── admin/
    ├── teacher/
    ├── student/
    ├── parent/
    ├── assignments/
    └── reports/
```

Use lowercase file names with hyphens, for example `teacher-review-form.png`. Prefer PNG for interface screenshots. Keep images wide enough to read but compressed enough for GitHub; about 1400–1800 pixels wide is normally sufficient.

Add an image to Markdown with a relative path:

```markdown
![Teacher review form](screenshots/teacher/teacher-review-form.png)
```

## Recommended screenshots

| Area | Suggested image | What it should show |
|---|---|---|
| Login | `login/login-form.png` | Email, password, Remember me, and Log in controls |
| Dashboard | `dashboard/role-summary.png` | Role title and summary cards |
| Admin portal | `admin/worksheet-library.png` | Upload/edit form and worksheet list |
| Teacher portal | `teacher/submission-review.png` | Linked-student filter, submission download, and marking form |
| Student portal | `student/assigned-work.png` | Assignment, deadline, download, and upload control |
| Parent portal | `parent/assign-worksheet.png` | Child and worksheet selection, due date, and attempt rules |
| Assignments | `assignments/submission-history.png` | Attempt numbers, dates, uploader, and results |
| Reports | `reports/performance-report.png` | Grade, percentage, and teacher comment |
| Profile | `dashboard/profile-form.png` | Role-appropriate editable fields |
| Worksheet details | `assignments/worksheet-details.png` | Description, instructions, and download button |

## Capture checklist

- Use demo data, not real student names, emails, dates of birth, or submitted work.
- Do not show access tokens, `.env` values, database passwords, browser developer tools, or private file paths.
- Capture both desktop and mobile views when layout differences matter.
- Make sure success and error messages are readable.
- Crop out unrelated browser tabs and personal bookmarks.
- Add a short caption describing the user's goal, not only the page name.
- Refresh screenshots after a visible interface change.

## Features that should not be pictured as working

Do not present attendance, notifications, password recovery, Google login, direct messages, user management, class management, or certificates as complete. They do not have an implemented end-to-end workflow in the current project.
