import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStudentDto, StudentDto, UpdateStudentDto } from '../../shared/models/student';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly apiUrl = `${environment.apiUrl}/Students`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<StudentDto[]> {
    return this.http.get<StudentDto[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getStudent(id: number): Observable<StudentDto> {
    return this.http.get<StudentDto>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createStudent(dto: CreateStudentDto): Observable<StudentDto> {
    return this.http.post<StudentDto>(this.apiUrl, dto).pipe(catchError(this.handleError));
  }

  updateStudent(id: number, dto: UpdateStudentDto): Observable<StudentDto> {
    return this.http.put<StudentDto>(`${this.apiUrl}/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: unknown) {
    return throwError(() => error);
  }
}
