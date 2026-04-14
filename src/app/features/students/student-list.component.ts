import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentService } from '../departments/department.service';
import { StudentService } from './student.service';
import { CreateStudentDto, StudentDto, UpdateStudentDto } from '../../shared/models/student';
import { DepartmentDto } from '../../shared/models/department';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-students',
  templateUrl: './student-list.component.html',
  styles: [
    ".feature-shell { padding:2rem; }",
    ".feature-header { display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; }",
    "h1, h2 { margin:0; color:#0f172a; }",
    "p { margin:.5rem 0 0; color:#475569; }",
    ".grid-layout { display:grid; gap:1.5rem; grid-template-columns:1.7fr 1fr; }",
    "table { width:100%; border-collapse:collapse; background:white; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; }",
    "th, td { padding:.95rem 1rem; text-align:left; border-bottom:1px solid #e2e8f0; }",
    "thead { background:#f8fafc; }",
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
export class StudentListComponent implements OnInit {
  students: StudentDto[] = [];
  departments: DepartmentDto[] = [];
  selectedStudent: StudentDto | null = null;
  error = '';

  private fb = inject(FormBuilder);
  studentForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    departmentId: ['', Validators.required]
  });

  constructor(private studentService: StudentService, private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => (this.departments = departments),
      error: (err) => (this.error = err?.error?.message || 'Could not load departments.')
    });

    this.studentService.getStudents().subscribe({
      next: (students) => (this.students = students),
      error: (err) => (this.error = err?.error?.message || 'Could not load students.')
    });
  }

  selectStudent(student: StudentDto): void {
    this.selectedStudent = student;
    this.studentForm.setValue({
      name: student.name,
      email: student.email,
      departmentId: String(student.departmentId)
    });
    this.error = '';
  }

  saveStudent(): void {
    if (this.studentForm.invalid) {
      this.error = 'Please fill out every field before saving.';
      return;
    }

    const payload = this.studentForm.getRawValue();
    if (this.selectedStudent) {
      const payloadToUpdate: UpdateStudentDto = {
        name: payload.name,
        email: payload.email,
        departmentId: Number(payload.departmentId)
      };
      this.studentService.updateStudent(this.selectedStudent.id, payloadToUpdate).subscribe({
        next: () => {
          this.resetForm();
          this.loadData();
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to update student.')
      });
    } else {
      const payloadToCreate: CreateStudentDto = {
        name: payload.name,
        email: payload.email,
        departmentId: Number(payload.departmentId)
      };
      this.studentService.createStudent(payloadToCreate).subscribe({
        next: () => {
          this.resetForm();
          this.loadData();
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to create student.')
      });
    }
  }

  deleteStudent(id: number): void {
    if (!confirm('Delete this student?')) {
      return;
    }
    this.studentService.deleteStudent(id).subscribe({
      next: () => this.loadData(),
      error: (err) => (this.error = err?.error?.message || 'Unable to delete student.')
    });
  }

  resetForm(): void {
    this.selectedStudent = null;
    this.error = '';
    this.studentForm.reset({ name: '', email: '', departmentId: '' });
  }
}
