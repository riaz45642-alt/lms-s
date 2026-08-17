# Project Overview

## What EduSphere is

EduSphere is a web-based Learning Management System (LMS). An LMS is a website that helps people organize teaching and learning.

The working application focuses on downloadable worksheets. Administrators maintain the worksheet library. Parents assign published worksheets to their children. Students or parents upload completed work. Linked teachers review that work, give marks and comments, and create progress reports.

## Problem it solves

Worksheet-based learning is often spread across email, paper files, and chat messages. This makes it difficult to know which work was assigned, whether it was returned, and what feedback was given.

EduSphere keeps the main worksheet process in one place. It records assignments, deadlines, submission attempts, teacher feedback, grades, and progress reports.

## Target users

- **Administrators** maintain the worksheet library and see system-wide totals.
- **Teachers** see work from linked students, download submissions, and record evaluations.
- **Students** download assigned work, upload completed work, and read results.
- **Parents** manage work for linked children, assign published worksheets, upload completed work, and view progress.
- **Developers and project supervisors** maintain, test, and deploy the system.

Public visitors can also view the marketing pages, activities, pricing information, help, and general information. These pages are informational and are not the core learning workflow.

## Main objectives

1. Give each user a role-based workspace.
2. Keep worksheet files and details in a central library.
3. Connect parents, students, and teachers through recorded relationships.
4. Track an assignment from creation to submission and review.
5. Give students and parents clear feedback and progress information.
6. Protect private learning records from unrelated users.

## Benefits

- A clear record of assigned and completed work.
- Controlled access based on the user's role and relationships.
- Support for deadlines, late work, and more than one attempt.
- Consistent teacher marking and automatic percentage and grade calculation.
- Progress information for students, parents, and teachers.
- A responsive web interface that works without installing a desktop program.

## Current scope

The core worksheet workflow is implemented and covered by automated tests. Attendance, notification delivery, password recovery, user-management screens, messaging screens, and class-management screens are not currently implemented. Some database tables and unused React pages prepare for future features, but they should not be described as available to end users.

See [Features](Features.md) for a feature-by-feature status and [Future Improvements](Future_Improvements.md) for realistic next steps.
