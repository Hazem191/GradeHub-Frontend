import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppDataService } from '../../core/app-data.service';
import { CourseService } from '../courses/course.service';
import { DepartmentService } from '../departments/department.service';
import { EnrollmentService } from './enrollment.service';
import { CourseDto } from '../../shared/models/course';
import { DepartmentDto } from '../../shared/models/department';
import { StudentDto } from '../../shared/models/student';
import { AddGradeDto, StudentGradeDto } from '../../shared/models/enrollment';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styles: [
    ".grades-shell { padding: 2rem; max-width: 1200px; margin: 0 auto; }",
    ".page-header { margin-bottom: 1.5rem; }",
    ".page-header h1 { font-size: 2rem; margin-bottom: 0.35rem; color: #102a43; }",
    ".page-header p { color: #475569; margin: 0; }",
    ".top-grid { display: grid; gap: 1.5rem; grid-template-columns: 1.2fr 0.8fr; }",
    ".panel { padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 1.25rem; background: #ffffff; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04); }",
    ".panel-secondary { background: #f8fafc; }",
    ".panel h2 { font-size: 1.15rem; margin-bottom: 1rem; color: #0f172a; }",
    ".field-row { display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 1rem; }",
    ".field-row label { font-weight: 600; color: #334155; }",
    ".form-select, .form-control { border-radius: 0.85rem; border: 1px solid #cbd5e1; padding: 0.9rem 1rem; }",
    ".button-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }",
    ".button-row .btn { min-width: 140px; }",
    ".selection-summary { margin-top: 1rem; color: #334155; display: grid; gap: 0.35rem; font-size: 0.95rem; }",
    ".status-banner { margin: 1rem 0; }",
    ".grades-table { margin-top: 1.5rem; }",
    ".grades-table h2 { margin-bottom: 1rem; }",
    ".table-scroll { overflow-x: auto; }",
    ".table { width: 100%; border-collapse: collapse; }",
    ".table thead th { text-align: left; padding: 1rem 0.75rem; border-bottom: 1px solid #e2e8f0; color: #334155; }",
    ".table tbody td { padding: 0.95rem 0.75rem; border-bottom: 1px solid #e2e8f0; }",
    ".grade-column { width: 180px; }",
    "@media (max-width: 900px) { .top-grid { grid-template-columns: 1fr; } .button-row { width: 100%; } .button-row .btn { width: 100%; } }"
  ]
})
export class GradesComponent implements OnInit {
  courses: CourseDto[] = [];
  departments: DepartmentDto[] = [];
  students: StudentGradeDto[] = [];
  allStudents: StudentDto[] = [];
  studentsForEnrollment: StudentDto[] = [];
  selectedCourseId: number | null = null;
  selectedDepartmentId: number | null = null;
  selectedEnrollmentStudentId: number | null = null;
  selectedEnrollmentCourseId: number | null = null;
  selectedEnrollmentDepartmentId: number | null = null;
  error = '';
  enrollmentError = '';
  message = '';
  enrollmentMessage = '';
  info = '';
  isLoadingCourses = false;
  isLoadingDepartments = false;
  isLoadingStudents = false;
  isEnrolling = false;

  constructor(
    private appDataService: AppDataService,
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.appDataService.courses$.subscribe((courses) => (this.courses = courses));
    this.appDataService.departments$.subscribe((departments) => (this.departments = departments));
    this.appDataService.students$.subscribe((students) => {
      this.allStudents = students;
      this.studentsForEnrollment = students;
    });

    this.loadCourses();
    this.loadDepartments();
    this.loadStudentsForEnrollment();
  }

  private loadCourses(): void {
    this.error = '';
    this.info = '';
    this.isLoadingCourses = true;

    this.appDataService.loadCourses().pipe(finalize(() => (this.isLoadingCourses = false))).subscribe({
      next: (courses) => (this.courses = courses),
      error: (err) => (this.error = err?.error?.message || 'Unable to load courses.')
    });
  }

  private loadDepartments(): void {
    this.error = '';
    this.info = '';
    this.isLoadingDepartments = true;

    this.appDataService.loadDepartments().pipe(finalize(() => (this.isLoadingDepartments = false))).subscribe({
      next: (departments) => (this.departments = departments),
      error: (err) => (this.error = err?.error?.message || 'Unable to load departments.')
    });
  }

  onCourseChange(value: string): void {
    this.selectedCourseId = value !== '' ? Number(value) : null;
    this.loadStudents();
  }

  onDepartmentChange(value: string): void {
    this.selectedDepartmentId = value !== '' ? Number(value) : null;
    this.loadStudents();
  }

  loadStudents(): void {
    this.message = '';
    this.info = '';
    this.error = '';

    if (this.selectedCourseId === null || this.selectedDepartmentId === null) {
      this.students = [];
      return;
    }

    this.isLoadingStudents = true;

    this.enrollmentService
      .getStudentsForCourse(this.selectedCourseId, this.selectedDepartmentId)
      .pipe(finalize(() => (this.isLoadingStudents = false)))
      .subscribe({
        next: (students) => {
          this.students = students;

          if (this.students.length === 0) {
            this.info = 'No enrolled students found for this course and department.';
          }
        },
        error: (err) => (this.error = err?.error?.message || 'Unable to load students for this selection.')
      });
  }

  updateGrade(student: StudentGradeDto, value: string): void {
    const normalized = value ? Number(value) : null;
    student.grade = normalized !== null && !Number.isNaN(normalized) ? normalized : null;
  }

  enrollStudent(): void {
    this.enrollmentError = '';
    this.enrollmentMessage = '';

    if (this.selectedEnrollmentStudentId === null || this.selectedEnrollmentCourseId === null || this.selectedEnrollmentDepartmentId === null) {
      this.enrollmentError = 'Select a student, course, and department before enrolling.';
      return;
    }

    this.isEnrolling = true;

    this.enrollmentService
      .enrollStudent({
        studentId: this.selectedEnrollmentStudentId,
        courseId: this.selectedEnrollmentCourseId,
        departmentId: this.selectedEnrollmentDepartmentId
      })
      .pipe(finalize(() => (this.isEnrolling = false)))
      .subscribe({
        next: () => {
          this.enrollmentMessage = 'Student enrolled successfully.';
          this.enrollmentError = '';

          if (
            this.selectedEnrollmentCourseId !== this.selectedCourseId ||
            this.selectedEnrollmentDepartmentId !== this.selectedDepartmentId
          ) {
            this.selectedCourseId = this.selectedEnrollmentCourseId;
            this.selectedDepartmentId = this.selectedEnrollmentDepartmentId;
          }

          this.loadStudents();
        },
        error: (err) => (this.enrollmentError = err?.error?.message || 'Unable to enroll student.')
      });
  }

  private loadStudentsForEnrollment(): void {
    this.appDataService.loadStudents().subscribe({
      next: (students) => {
        this.allStudents = students;
        this.studentsForEnrollment = students;
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to load student list.')
    });
  }

  saveGrades(): void {
    if (this.selectedCourseId === null || this.selectedDepartmentId === null) {
      this.error = 'Select a course and department before submitting grades.';
      return;
    }

    const payload: AddGradeDto[] = this.students
      .filter((student) => student.grade !== null && student.grade !== undefined)
      .map((student) => ({
        studentId: student.studentId,
        courseId: student.courseId,
        departmentId: student.departmentId,
        grade: student.grade as number
      }));

    if (payload.length === 0) {
      this.error = 'Enter at least one grade before submitting.';
      return;
    }

    this.enrollmentService.addGrades(payload).subscribe({
      next: () => {
        this.message = 'Grades submitted successfully.';
        this.error = '';
        this.loadStudents();
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to submit grades.')
    });
  }
}
