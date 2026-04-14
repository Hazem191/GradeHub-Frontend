import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppDataService } from '../../core/app-data.service';
import { CourseService } from '../courses/course.service';
import { DepartmentService } from '../departments/department.service';
import { EnrollmentService } from './enrollment.service';
import { StudentService } from '../students/student.service';
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
    ".card { border-radius: 1rem; }"
  ]
})
export class GradesComponent implements OnInit {
  courses: CourseDto[] = [];
  departments: DepartmentDto[] = [];
  students: StudentGradeDto[] = [];
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
    private enrollmentService: EnrollmentService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.appDataService.courses$.subscribe((courses) => (this.courses = courses));
    this.appDataService.departments$.subscribe((departments) => (this.departments = departments));
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
    this.students = [];

    if (this.selectedCourseId === null || this.selectedDepartmentId === null) {
      return;
    }

    this.isLoadingStudents = true;

    this.enrollmentService
      .getStudentsForCourse(this.selectedCourseId, this.selectedDepartmentId)
      .pipe(finalize(() => (this.isLoadingStudents = false)))
      .subscribe({
        next: (students) => {
          this.students = students;
          if (students.length === 0) {
            this.info = 'No students found for this course and department.';
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
            this.selectedEnrollmentCourseId === this.selectedCourseId &&
            this.selectedEnrollmentDepartmentId === this.selectedDepartmentId
          ) {
            this.loadStudents();
          }
        },
        error: (err) => (this.enrollmentError = err?.error?.message || 'Unable to enroll student.')
      });
  }

  private loadStudentsForEnrollment(): void {
    this.studentService.getStudents().subscribe({
      next: (students) => (this.studentsForEnrollment = students),
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
      },
      error: (err) => (this.error = err?.error?.message || 'Unable to submit grades.')
    });
  }
}
