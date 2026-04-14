import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddGradeDto, CreateEnrollmentDto, StudentGradeDto } from '../../shared/models/enrollment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly apiUrl = `${environment.apiUrl}/Enrollments`;

  constructor(private http: HttpClient) {}

  getStudentsForCourse(courseId: number, departmentId: number): Observable<StudentGradeDto[]> {
    return this.http
      .get<StudentGradeDto[]>(`${this.apiUrl}/course/${courseId}/department/${departmentId}`)
      .pipe(catchError(this.handleError));
  }

  addGrades(grades: AddGradeDto[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/add-grades-bulk`, grades).pipe(catchError(this.handleError));
  }

  enrollStudent(dto: CreateEnrollmentDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/enroll`, dto).pipe(catchError(this.handleError));
  }

  private handleError(error: unknown) {
    return throwError(() => error);
  }
}
