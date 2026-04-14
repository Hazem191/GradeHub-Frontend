import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseDto, CreateCourseDto, UpdateCourseDto } from '../../shared/models/course';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly apiUrl = `${environment.apiUrl}/Courses`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getCourse(id: number): Observable<CourseDto> {
    return this.http.get<CourseDto>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createCourse(dto: CreateCourseDto): Observable<CourseDto> {
    return this.http.post<CourseDto>(this.apiUrl, dto).pipe(catchError(this.handleError));
  }

  updateCourse(id: number, dto: UpdateCourseDto): Observable<CourseDto> {
    return this.http.put<CourseDto>(`${this.apiUrl}/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: unknown) {
    return throwError(() => error);
  }
}
