import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CourseService } from '../features/courses/course.service';
import { DepartmentService } from '../features/departments/department.service';
import { StudentService } from '../features/students/student.service';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private studentService: StudentService
  ) {}

  preloadAllData(): Observable<void> {
    const safe = <T>(obs: Observable<T>, name: string) =>
      obs.pipe(
        catchError((error) => {
          console.error(`App preload failed for ${name}`, error);
          return of([] as unknown as T);
        })
      );

    return forkJoin({
      courses: safe(this.courseService.getCourses(), 'courses'),
      departments: safe(this.departmentService.getDepartments(), 'departments'),
      students: safe(this.studentService.getStudents(), 'students')
    }).pipe(map(() => undefined));
  }
}
