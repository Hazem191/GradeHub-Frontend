import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignCoursesToDepartmentDto,
  CreateDepartmentDto,
  DepartmentDto,
  RemoveCoursesFromDepartmentDto,
  UpdateDepartmentDto
} from '../../shared/models/department';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly apiUrl = `${environment.apiUrl}/Departments`;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<DepartmentDto[]> {
    return this.http.get<DepartmentDto[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getDepartment(id: number): Observable<DepartmentDto> {
    return this.http.get<DepartmentDto>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createDepartment(dto: CreateDepartmentDto): Observable<DepartmentDto> {
    return this.http.post<DepartmentDto>(this.apiUrl, dto).pipe(catchError(this.handleError));
  }

  updateDepartment(id: number, dto: UpdateDepartmentDto): Observable<DepartmentDto> {
    return this.http.put<DepartmentDto>(`${this.apiUrl}/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  assignCourses(dto: AssignCoursesToDepartmentDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign-courses`, dto).pipe(catchError(this.handleError));
  }

  removeCourses(dto: RemoveCoursesFromDepartmentDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/remove-courses`, dto).pipe(catchError(this.handleError));
  }

  private handleError(error: unknown) {
    return throwError(() => error);
  }
}
