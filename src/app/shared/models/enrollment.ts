export interface StudentGradeDto {
  studentId: number;
  studentName: string;
  courseId: number;
  departmentId: number;
  grade?: number | null;
}

export interface AddGradeDto {
  studentId: number;
  courseId: number;
  departmentId: number;
  grade: number;
}

export interface CreateEnrollmentDto {
  studentId: number;
  courseId: number;
  departmentId: number;
}
