import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { DepartmentDto } from '../../shared/models/department';
import { CourseDto } from '../../shared/models/course';
import { DepartmentService } from './department.service';
import { CourseService } from '../courses/course.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-departments',
  templateUrl: './department-list.component.html',
  styles: [
    ".feature-shell { padding:2rem; }",
    ".feature-header { display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; }",
    "h1, h2, h3, h4 { margin:0; color:#0f172a; }",
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
    "input { width:100%; margin-top:.5rem; padding:.85rem 1rem; border:1px solid #cbd5e1; border-radius:12px; }",
    ".form-actions { display:flex; gap:.75rem; margin-top:1rem; }",
    ".assign-grid { display:grid; gap:1rem; grid-template-columns:1fr 1fr; margin-top:1rem; }",
    ".assign-panel { background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1rem; display:flex; flex-direction:column; gap:1rem; min-height:360px; }",
    ".checkbox-list { display:flex; flex-direction:column; gap:.75rem; margin-bottom:1rem; max-height:280px; overflow:auto; padding-right:.5rem; }",
    ".checkbox-item { display:flex; align-items:center; gap:.75rem; padding:.8rem 1rem; border:1px solid #e2e8f0; border-radius:12px; background:#ffffff; }",
    ".checkbox-item input { flex-shrink:0; margin:0; width:1.05rem; height:1.05rem; }",
    ".checkbox-item label { margin:0; font-weight:500; color:#0f172a; cursor:pointer; }",
    ".assign-panel h6 { font-size:1rem; font-weight:700; margin-bottom:.75rem; }",
    ".assign-panel button { margin-top:auto; }",
    ".primary { background:#0f766e; }",
    ".error { color:#b91c1c; margin-top:1rem; }",
    "@media (max-width: 980px) { .grid-layout, .assign-grid { grid-template-columns:1fr; } }"
  ]
})
export class DepartmentListComponent implements OnInit {
  departments: DepartmentDto[] = [];
  courses: CourseDto[] = [];
  selectedDepartment: DepartmentDto | null = null;
  assignedCourses: CourseDto[] = [];
  availableCourses: CourseDto[] = [];
  assignCourseIds: number[] = [];
  removeCourseIds: number[] = [];
  error = '';

  private fb = inject(FormBuilder);
  departmentForm = this.fb.nonNullable.group({ name: ['', Validators.required] });

  constructor(
    private departmentService: DepartmentService,
    private courseService: CourseService,
    private appDataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.appDataService.departments$.subscribe((departments) => {
      this.departments = departments;
      this.updateCourseLists();
    });
    this.appDataService.courses$.subscribe((courses) => {
      this.courses = courses;
      this.updateCourseLists();
    });
    this.loadData();
  }

  loadData(forceReload = false): void {
    this.appDataService.loadDepartments(forceReload).subscribe({
      next: (departments) => {
        this.departments = departments;
        this.updateCourseLists();
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to load departments.')
    });
    this.appDataService.loadCourses(forceReload).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.updateCourseLists();
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to load courses.')
    });
  }

  selectDepartment(department: DepartmentDto): void {
    this.selectedDepartment = department;
    this.departmentForm.patchValue({ name: department.name });
    this.updateCourseLists();
  }

  saveDepartment(): void {
    if (this.departmentForm.invalid) {
      this.error = 'The department name is required.';
      return;
    }

    this.error = '';
    const payload = this.departmentForm.getRawValue();
    if (this.selectedDepartment) {
      this.departmentService.updateDepartment(this.selectedDepartment.id, payload).subscribe({
        next: () => {
          this.clearSelection();
          this.loadData(true);
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to update department.')
      });
    } else {
      this.departmentService.createDepartment(payload).subscribe({
        next: () => {
          this.departmentForm.reset();
          this.loadData(true);
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to create department.')
      });
    }
  }

  deleteDepartment(id: number): void {
    if (!confirm('Delete this department?')) {
      return;
    }
    this.departmentService.deleteDepartment(id).subscribe({
      next: () => {
        this.clearSelection();
        this.loadData(true);
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to delete department.')
    });
  }

  toggleAssign(courseId: number, checked: boolean): void {
    this.assignCourseIds = checked
      ? [...this.assignCourseIds, courseId]
      : this.assignCourseIds.filter((id) => id !== courseId);
  }

  toggleRemove(courseId: number, checked: boolean): void {
    this.removeCourseIds = checked
      ? [...this.removeCourseIds, courseId]
      : this.removeCourseIds.filter((id) => id !== courseId);
  }

  assignCourses(): void {
    if (!this.selectedDepartment || this.assignCourseIds.length === 0) {
      return;
    }
    this.departmentService.assignCourses({ departmentId: this.selectedDepartment.id, courseIds: this.assignCourseIds }).subscribe({
      next: () => {
        this.assignCourseIds = [];
        this.loadData(true);
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to assign courses.')
    });
  }

  removeCourses(): void {
    if (!this.selectedDepartment || this.removeCourseIds.length === 0) {
      return;
    }
    this.departmentService.removeCourses({ departmentId: this.selectedDepartment.id, courseIds: this.removeCourseIds }).subscribe({
      next: () => {
        this.removeCourseIds = [];
        this.loadData(true);
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to remove courses.')
    });
  }

  clearSelection(): void {
    this.selectedDepartment = null;
    this.assignCourseIds = [];
    this.removeCourseIds = [];
    this.departmentForm.reset();
    this.updateCourseLists();
  }

  private updateCourseLists(): void {
    if (!this.selectedDepartment) {
      this.assignedCourses = [];
      this.availableCourses = this.courses;
      return;
    }

    this.assignedCourses = this.courses.filter((course) => course.departmentId === this.selectedDepartment?.id);
    this.availableCourses = this.courses.filter((course) => course.departmentId !== this.selectedDepartment?.id);
  }
}
