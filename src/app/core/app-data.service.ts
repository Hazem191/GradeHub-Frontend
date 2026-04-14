import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CourseService } from '../features/courses/course.service';
import { DepartmentService } from '../features/departments/department.service';
import { StudentService } from '../features/students/student.service';
import { CourseDto } from '../shared/models/course';
import { DepartmentDto } from '../shared/models/department';
import { StudentDto } from '../shared/models/student';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  courses$ = new BehaviorSubject<CourseDto[]>([]);
  departments$ = new BehaviorSubject<DepartmentDto[]>([]);
  students$ = new BehaviorSubject<StudentDto[]>([]);

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private studentService: StudentService
  ) {}

  preloadAllData(): Observable<void> {
    return forkJoin({
      courses: this.safe(this.courseService.getCourses(), 'courses'),
      departments: this.safe(this.departmentService.getDepartments(), 'departments'),
      students: this.safe(this.studentService.getStudents(), 'students')
    }).pipe(
      tap(({ courses, departments, students }) => {
        this.courses$.next(courses);
        this.departments$.next(departments);
        this.students$.next(students);
      }),
      map(() => undefined)
    );
  }

  loadCourses(forceReload = false): Observable<CourseDto[]> {
    if (!forceReload && this.courses$.value.length > 0) {
      return of(this.courses$.value);
    }

    return this.courseService.getCourses().pipe(
      tap((courses) => this.courses$.next(courses)),
      catchError((error) => {
        console.error('Unable to load courses', error);
        return of([] as CourseDto[]);
      })
    );
  }

  loadDepartments(forceReload = false): Observable<DepartmentDto[]> {
    if (!forceReload && this.departments$.value.length > 0) {
      return of(this.departments$.value);
    }

    return this.departmentService.getDepartments().pipe(
      tap((departments) => this.departments$.next(departments)),
      catchError((error) => {
        console.error('Unable to load departments', error);
        return of([] as DepartmentDto[]);
      })
    );
  }

  loadStudents(forceReload = false): Observable<StudentDto[]> {
    if (!forceReload && this.students$.value.length > 0) {
      return of(this.students$.value);
    }

    return this.studentService.getStudents().pipe(
      tap((students) => this.students$.next(students)),
      catchError((error) => {
        console.error('Unable to load students', error);
        return of([] as StudentDto[]);
      })
    );
  }

  private safe<T>(obs: Observable<T>, name: string): Observable<T> {
    return obs.pipe(
      catchError((error) => {
        console.error(`App preload failed for ${name}`, error);
        return of([] as unknown as T);
      })
    );
  }
}
