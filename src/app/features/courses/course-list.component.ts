import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { CourseService } from './course.service';
import { DepartmentService } from '../departments/department.service';
import { CourseDto, CreateCourseDto, UpdateCourseDto } from '../../shared/models/course';
import { DepartmentDto } from '../../shared/models/department';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-courses',
  templateUrl: './course-list.component.html',
  styles: [
    ".feature-shell { padding:2rem; }",
    ".feature-header { display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; }",
    "h1, h2 { margin:0; color:#0f172a; }",
    "p { margin:.5rem 0 0; color:#475569; }",
    ".grid-layout { display:grid; gap:1.5rem; grid-template-columns:1.7fr 1.3fr; }",
    "table { width:100%; border-collapse:collapse; background:white; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; }",
    "th, td { padding:.95rem 1rem; text-align:left; border-bottom:1px solid #e2e8f0; }",
    ".actions-cell { display:flex; gap:.5rem; }",
    "button { cursor:pointer; padding:.65rem .9rem; border:none; border-radius:10px; background:#3b82f6; color:white; font-weight:600; }",
    "button.danger { background:#ef4444; }",
    "button.secondary { background:#e2e8f0; color:#0f172a; }",
    ".form-panel { background:white; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; }",
    "label { display:block; margin-bottom:1rem; font-size:.95rem; color:#334155; }",
    "input, select { width:100%; margin-top:.5rem; padding:.85rem 1rem; border:1px solid #cbd5e1; border-radius:12px; font-size:1rem; }",
    ".form-actions { display:flex; gap:.75rem; margin-top:1rem; }",
    ".error { color:#b91c1c; margin-top:1rem; }",
    "@media (max-width: 980px) { .grid-layout { grid-template-columns:1fr; } }"
  ]
})
export class CourseListComponent implements OnInit {
  courses: CourseDto[] = [];
  departments: DepartmentDto[] = [];
  selectedCourse: CourseDto | null = null;
  error = '';

  private fb = inject(FormBuilder);
  courseForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    departmentId: ['']
  });

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private appDataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.appDataService.courses$.subscribe((courses) => (this.courses = courses));
    this.appDataService.departments$.subscribe((departments) => (this.departments = departments));
    this.loadData();
  }

  loadData(forceReload = false): void {
    this.appDataService.loadCourses(forceReload).subscribe({
      next: (courses) => (this.courses = courses),
      error: (err) => (this.error = err?.error?.message || 'Unable to load courses.')
    });
    this.appDataService.loadDepartments(forceReload).subscribe({
      next: (departments) => (this.departments = departments),
      error: (err) => (this.error = err?.error?.message || 'Unable to load departments.')
    });
  }

  selectCourse(course: CourseDto): void {
    this.selectedCourse = course;
    this.courseForm.setValue({ name: course.name, departmentId: course.departmentId !== undefined && course.departmentId !== null ? String(course.departmentId) : '' });
    this.error = '';
  }

  saveCourse(): void {
    if (this.courseForm.invalid) {
      this.error = 'Course name is required.';
      return;
    }

    this.error = '';
    const raw = this.courseForm.getRawValue();
    const payload: CreateCourseDto | UpdateCourseDto = {
      name: raw.name,
      departmentId: raw.departmentId ? Number(raw.departmentId) : null
    };

    if (this.selectedCourse) {
      this.courseService.updateCourse(this.selectedCourse.id, payload as UpdateCourseDto).subscribe({
        next: () => {
          this.resetForm();
          this.loadData(true);
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to update course.')
      });
    } else {
      this.courseService.createCourse(payload as CreateCourseDto).subscribe({
        next: () => {
          this.resetForm();
          this.loadData(true);
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to create course.')
      });
    }
  }

  deleteCourse(id: number): void {
    if (!confirm('Delete this course?')) {
      return;
    }
    this.courseService.deleteCourse(id).subscribe({
      next: () => this.loadData(true),
      error: (err) => (this.error = err?.error?.message || 'Unable to delete course.')
    });
  }

  resetForm(): void {
    this.selectedCourse = null;
    this.error = '';
    this.courseForm.reset({ name: '', departmentId: '' });
  }
}
