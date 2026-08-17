# Frequently Asked Questions

## Students

### Which worksheets can I see?

Only worksheets assigned to your student profile. If expected work is missing, ask your parent or administrator to confirm the assignment and account link.

### Which files can I upload?

PDF, JPG, JPEG, PNG, and WebP files up to 20 MB.

### Can I submit again?

Only when **Allow another attempt** was selected for the assignment. Every accepted upload receives a new attempt number.

### Can I submit after the deadline?

Only when late submission was allowed. Otherwise the upload is blocked after the due time.

### Where is my grade?

Open the assignment's submission history or scroll to **Performance reports**. A result appears after a linked teacher completes the review.

## Teachers

### Why can I not see a student?

The student must be linked to your teacher profile in `teacher_student`. There is no current screen for changing this link, so an administrator or developer must prepare it through controlled database setup.

### Can I assign worksheets?

No. Current business rules allow parents and administrators to create assignments. The teacher portal is for viewing linked work and reviewing submissions.

### Can I upload worksheets?

No. Worksheet management is administrator-only.

### How is the grade calculated?

EduSphere divides obtained marks by total marks and multiplies by 100. It then assigns A+ for 90 or above, A for 80–89.99, B for 70–79.99, C for 60–69.99, D for 50–59.99, and F below 50.

### Can I review any student's work?

No. The server confirms the teacher/student link before saving a review.

## Parents

### Which children can I manage?

Only student profiles whose `parent_id` points to your parent profile. One parent profile can have many children; each student currently has at most one direct parent profile.

### Why is a worksheet missing from the assignment list?

Parents can assign only published worksheets. It may be a draft, on another page of the 20-item API result, or unavailable because of a loading error.

### Can I upload work for my child?

Yes, if the child is linked to your account and the deadline and attempt rules allow the upload.

### Can I change a grade or teacher comment?

No. Only the linked teacher can submit the evaluation.

## Administrators

### Can administrators register on the public sign-up page?

No. Public registration allows parent, teacher, and student roles only. Create the first admin through approved seed/setup procedures or a controlled administrative process.

### Can I delete an assigned worksheet?

No. The API returns a conflict error so assignment history is not broken. Unassigned worksheets can be deleted.

### Where is user management?

It is not implemented as an API or screen. The database contains role and permission structures, but the active admin interface currently manages worksheets only.

### Are attendance and notifications available?

No. Attendance has no implementation. Notifications have only unused prototype code and no API or delivery system.

### Are uploaded files public?

No. They are stored on the local private disk and downloaded through endpoints that check the user's role and relationship.

## General

### Does “Remember me” keep me signed in?

It stores the access token in longer-lived browser storage. Without it, the token is stored for the current browser session. Use it only on a trusted device.

### Does the password reset link work?

No. The current interface shows a link, but there is no reset endpoint or mail workflow.

### Why do some pages look complete but have sample data?

The repository contains unused interface prototypes and static marketing content. Only pages connected in `FrontendApp.jsx` and backed by active APIs should be treated as working product features.
