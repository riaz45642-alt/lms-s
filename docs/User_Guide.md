# User Guide

## Before you begin

Open the EduSphere website in a modern browser. Keep your email address and password private. The words “dashboard” and “portal” both mean your personal work area.

## Common actions

### Log in

1. Select **Log in** in the top menu.
2. Enter your email address.
3. Enter your password.
4. Select **Remember me** only on a private device if you want the login to remain after closing the browser.
5. Select **Log in**.
6. EduSphere opens the dashboard for your role.

The “Forgot password?” and Google buttons are not working features in the current version. Ask an administrator or developer for help if the password is lost.

### Navigate

- Select **Dashboard** to return to your work area.
- Select **Worksheets** to open the worksheet list available to you.
- Select **Profile** on the dashboard to change supported profile details.
- On a small screen, select the menu icon to show navigation choices.

### Log out

1. Select **Log out** in the top menu.
2. EduSphere removes the login token from this browser and returns to the home page.

## Administrator guide

### Open the administrator dashboard

Log in with an administrator account. The dashboard shows totals for users, worksheets, assignments, and pending reviews.

### Upload a worksheet

1. Select **Manage worksheets** or **Open Admin Panel**.
2. Enter the title.
3. Choose a subject and grade.
4. Optionally enter total marks, a default due period, description, and learner instructions.
5. Leave **Published** selected if parents should be able to assign it. Clear it to save a draft.
6. Choose a PDF, JPG, JPEG, PNG, or WebP file no larger than 20 MB.
7. Select **Upload worksheet**.

### Edit or replace a worksheet

1. In **All uploaded worksheets**, select **Edit**.
2. Change the details.
3. Choose a replacement file only if the existing file must change.
4. Select **Update worksheet**.

### Delete a worksheet

1. Select **Delete** beside the worksheet.
2. Confirm the warning.

Deletion is refused if the worksheet has already been assigned. This protects assignment history.

### View other records

The dashboard shows summary counts. Full graphical screens for users, classes, assignments, reviews, reports, roles, and bundles are not available to administrators in this version. Those records can be accessed only through authorized API requests, which are intended for developers.

## Teacher guide

### Review student work

1. Log in and open the teacher dashboard.
2. Use **Review a student** to show one linked student, or leave **All students** selected.
3. Find a submitted assignment.
4. Select **Open submitted file** to download the newest attempt.
5. Read the work on your device.
6. Enter **Marks** and **Total marks**. Marks cannot be higher than the total.
7. Enter optional remarks for the student and parent.
8. Enter an optional overall progress comment.
9. Select **Submit final evaluation**.

EduSphere calculates the percentage and grade and creates a report. The assignment becomes checked. Previous attempts and their results appear under **Submission history**.

### View progress and reports

1. Choose a student in **Review a student**.
2. Read the average percentage and checked-assignment total.
3. Scroll to **Performance reports** to read report grades and comments.

Only students linked to the teacher profile are visible. Teachers cannot assign worksheets or upload/manage worksheet-library files in the current rules.

## Student guide

### Download assigned work

1. Log in and open the student dashboard.
2. Find the assignment under **Assigned worksheets**.
3. Read its instructions, deadline, and attempt rules.
4. Select **Download worksheet**.
5. Open or save the downloaded file on the device.

### Upload completed work

1. Complete the worksheet and save or photograph it as PDF, JPG, JPEG, PNG, or WebP.
2. Find the assignment.
3. Select the file control under **Upload completed worksheet**.
4. Choose a file no larger than 20 MB.
5. Wait for the success message.

If another attempt is allowed, the control changes to **Upload another attempt**. If the deadline has passed and late work is not allowed, uploading is blocked.

### Check submissions, grades, and reports

1. Open **Submission history** under the assignment.
2. Review the attempt number, upload time, marks, percentage, and teacher remarks.
3. Scroll to **Performance reports** for the grade, progress percentage, and teacher comment.

## Parent guide

### Select a child and view progress

1. Log in and open the parent dashboard.
2. Use **Filter by child** to choose a linked child.
3. Read the average progress and checked-assignment count.
4. Review the filtered assignments and performance reports below.

### Assign a worksheet

1. Under **Assign a worksheet to a child**, choose the child.
2. Choose a published worksheet.
3. Optionally choose a future due date. If left empty, the worksheet's default due period may be used.
4. Add optional instructions.
5. Select **Allow another attempt** if the child may submit more than once.
6. Select **Allow late submission** if work may arrive after the deadline.
7. Select **Assign worksheet**.

### Download and upload work

Use **Download worksheet** on the child's assignment. When completed, use **Upload completed worksheet** and choose an accepted file up to 20 MB. Parents can upload only for their own linked children.

### View reports

Scroll to **Performance reports**. Reports show the grade, percentage, and teacher comment. A report appears after a linked teacher completes the review.

## Update a profile

1. Open the dashboard and select **Profile**.
2. Change the available fields for the account type.
3. Select **Save profile**.
4. Wait for “Profile saved.”

Administrators can change only their name here. Email, password, role, and family/teacher links cannot be changed on this screen.
