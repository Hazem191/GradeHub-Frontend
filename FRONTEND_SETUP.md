# GradeHub Frontend Setup Guide

This document describes how to build the Angular frontend for the GradeHub application. It explains the folder structure, primary files, and the exact commands needed to run the project.

## 1. Project structure overview

The frontend is located in:
- `Frontend/`

Important subfolders:
- `src/app/` — main application code
- `src/app/core/` — authentication and API middleware
- `src/app/features/` — feature-specific modules and components
- `src/app/shared/models/` — DTO interfaces for API payloads
- `src/environments/` — API base URL configuration

## 2. Required commands

Open a terminal inside `Frontend/` and run:

```bash
npm install
npm start
```

This installs Bootstrap too, because Bootstrap is now part of the project dependencies.

To build production files:

```bash
npm run build
```

To run unit tests if configured:

```bash
npm test
```

To serve in development with a specific configuration:

```bash
npm run watch
```

## 3. Terminal commands summary

Use these commands during development:

```bash
# install frontend dependencies
npm install

# run the frontend in development mode
npm start

# build the frontend for production
npm run build

# run unit tests (if available)
npm test

# build in watch mode for continuous compilation
npm run watch
```

For backend startup, open a separate terminal and run from the backend project folder:

```bash
dotnet build
 dotnet run
```

If you use the local backend launch profile, confirm the backend URL from `Properties/launchSettings.json`.

## 4. Environment configuration

`src/environments/environment.ts`
- Contains `apiUrl` for local development.
- Example: `https://localhost:7282/api`

`src/environments/environment.prod.ts`
- Contains the production API base URL.
- Use the same key structure as `environment.ts`.
=====
## 4. App bootstrap and routing

`src/main.ts`
- Bootstraps the Angular application with `bootstrapApplication(App, appConfig)`.
============
`src/app/app.config.ts`
- Registers providers for `Router`, `HttpClient`, and the HTTP interceptor.
- Enables route navigation and HTTP request handling.
========
`src/app/app.routes.ts`
- Defines frontend routes:
  - `/login`
  - `/register`
  - `/students`
  - `/departments`
  - `/courses`
  - `/grades`
- Protects feature routes with `AuthGuard`.

## 5. Root app shell

`src/app/app.ts`
- Root component for the Angular app.
- Exposes authentication state and logout logic.
======
`src/app/app.html`
- Main layout and navigation bar.
- Changes displayed buttons depending on login state.
====
`src/app/app.css`
- Global app shell styling.
====

## 6. Authentication core

`src/app/core/auth/auth.service.ts`
- Handles `login` and `register` API calls.
- Stores JWT token in `localStorage`.
- Exposes current authentication state.

`src/app/core/auth/auth.interceptor.ts`
- Attaches JWT token to all HTTP requests.
- Excludes authentication endpoints when needed.

`src/app/core/auth/auth.guard.ts`
- Prevents unauthenticated users from accessing protected routes.

## 7. Shared data models

`src/app/shared/models/auth.ts`
- `LoginRequest`
- `RegisterRequest`
- `AuthResponse`

`src/app/shared/models/student.ts`
- `StudentDto`
- `CreateStudentDto`
- `UpdateStudentDto`

`src/app/shared/models/department.ts`
- `DepartmentDto`
- `CreateDepartmentDto`
- `UpdateDepartmentDto`
- `AssignCoursesToDepartmentDto`
- `RemoveCoursesFromDepartmentDto`

`src/app/shared/models/course.ts`
- `CourseDto`
- `CreateCourseDto`
- `UpdateCourseDto`

`src/app/shared/models/enrollment.ts`
- `StudentGradeDto`
- `AddGradeDto`

## 8. Feature modules and components

### Students
- `src/app/features/students/student.service.ts`
  - API calls for student CRUD operations.
- `src/app/features/students/student-list.component.ts`
  - Lists students.
  - Supports create, update, and delete.
  - Uses reactive forms.

### Departments
- `src/app/features/departments/department.service.ts`
  - API calls for department CRUD.
  - Bulk assign/remove course endpoints.
- `src/app/features/departments/department-list.component.ts`
  - Lists departments.
  - Supports create, update, and delete.
  - Implements assign/remove courses.

### Courses
- `src/app/features/courses/course.service.ts`
  - API calls for course CRUD.
- `src/app/features/courses/course-list.component.ts`
  - Lists courses.
  - Supports create, update, and delete.

### Grades
- `src/app/features/grades/enrollment.service.ts`
  - API calls for course/department student lists.
  - Submits bulk grade assignments.
- `src/app/features/grades/grades.component.ts`
  - Select course and department.
  - Load students for that selection.
  - Enter and submit grades.

## 9. Practical workflow

### Step 1: Set API base URL
- Edit `src/environments/environment.ts`
- Confirm `apiUrl` points to your backend:
  - `https://localhost:7282/api`

### Step 2: Start the backend
- Run your .NET backend first so the frontend can connect.

### Step 3: Run the Angular app
- In `Frontend/` run:
  - `npm install`
  - `npm start`

### Step 4: Access the application
- Open the browser at the Angular dev server address.
- Use `/login` or `/register`.

### Step 5: Test CRUD and grade flows
- After login, use navigation to manage:
  - students
  - departments
  - courses
  - grades

## 10. Notes and tips

- `AuthInterceptor` is required so the backend receives the JWT.
- `AuthGuard` ensures the user cannot access secure pages directly by URL.
- `Reactive Forms` provide form validation and safe data collection.
- If a page fails, inspect the browser console and network request headers.

## 11. If you want to rebuild the frontend from scratch

1. `ng new Frontend` (already done)
2. Create `src/environments/` files.
3. Create `src/app/shared/models/` for all DTOs.
4. Create `src/app/core/auth/` and implement auth files.
5. Create feature services and components in `src/app/features/`.
6. Configure routing and HTTP provider in `src/app/app.config.ts`.
7. Update `src/app/app.ts`, `app.html`, and `app.css`.
8. Run `npm start` and verify with the backend.
