# Future Improvements

The following improvements extend the actual project direction. They are suggestions, not current features.

## High priority

1. **Password recovery and email verification.** Connect secure reset links and verify email ownership before allowing private learning activity.
2. **Administrator user management.** Add safe screens and APIs for accounts, roles, profile creation, parent-child links, and teacher-student links.
3. **Pagination controls.** The API returns 20 records per page, but current screens do not let users move through all pages.
4. **Assignment administration.** Allow approved users to correct deadlines, instructions, and attempt rules with a recorded audit trail.
5. **File protection.** Add malware scanning, stronger content inspection, storage quotas, retention rules, and backup/restore checks.
6. **Audit log.** Record important changes such as role edits, worksheet publication, assignments, downloads, and grade changes.

## Learning workflow

- Add attendance tables, APIs, daily entry screens, and reports.
- Add a notification service for assignments, deadlines, submissions, and grades, with email and in-app preferences.
- Complete direct messaging with participant rules, unread counts, reporting, and moderation.
- Build class, subject, and teaching-assignment management around the existing schema.
- Add a worksheet-bundle interface and the ability to assign a whole bundle.
- Add teacher draft reviews and a clear reopen/correction process for finalized work.
- Display each report's worksheet, student, teacher, and date in the dashboard.
- Add charts for progress by subject and time, while explaining what each metric means.
- Add optional student notes to the upload screen; the backend already accepts them.

## User experience and accessibility

- Replace encoding-damaged punctuation and verify all source files are UTF-8.
- Add accessible labels, keyboard testing, focus indicators, and screen-reader announcements.
- Add confirmation and progress indicators for large file uploads and downloads.
- Add better empty states and direct recovery actions for errors.
- Connect or remove controls that currently do nothing, including Google login and forgot password.
- Clearly separate live product pages from marketing demonstrations.

## Engineering and operations

- Add frontend component and end-to-end browser tests.
- Add API versioning and an OpenAPI machine-readable specification.
- Use database permissions consistently or simplify the dual role/permission design.
- Add token expiry, token management, and optional multi-factor authentication.
- Add continuous integration for tests, formatting, builds, and dependency security checks.
- Add health checks, structured logs, uptime monitoring, error tracking, and performance metrics.
- Add tested off-site backups for PostgreSQL and private uploaded files.
- Consider object storage such as S3 for larger deployments.

## Product safeguards

Before adding analytics, notifications, or communication, define data retention, consent, child privacy, moderation, and school access policies. These are especially important because the system stores information about children and their submitted work.
