export interface CourseDto {
  id: number;
  name: string;
  departmentId?: number | null;
}

export interface CreateCourseDto {
  name: string;
  departmentId?: number | null;
}

export interface UpdateCourseDto {
  name: string;
  departmentId?: number | null;
}
