import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { StudentListComponent } from './features/students/student-list.component';
import { DepartmentListComponent } from './features/departments/department-list.component';
import { CourseListComponent } from './features/courses/course-list.component';
import { GradesComponent } from './features/grades/grades.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'students', component: StudentListComponent, canActivate: [AuthGuard] },
  { path: 'departments', component: DepartmentListComponent, canActivate: [AuthGuard] },
  { path: 'courses', component: CourseListComponent, canActivate: [AuthGuard] },
  { path: 'grades', component: GradesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: '**', redirectTo: 'students' }
];
