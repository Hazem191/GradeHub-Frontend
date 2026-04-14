export interface DepartmentDto {
  id: number;
  name: string;
}

export interface CreateDepartmentDto {
  name: string;
}

export interface UpdateDepartmentDto {
  name: string;
}

export interface AssignCoursesToDepartmentDto {
  departmentId: number;
  courseIds: number[];
}

export interface RemoveCoursesFromDepartmentDto {
  departmentId: number;
  courseIds: number[];
}
