export interface StudentDto {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

export interface CreateStudentDto {
  name: string;
  email: string;
  departmentId: number;
}

export interface UpdateStudentDto {
  name: string;
  email: string;
  departmentId: number;
}
