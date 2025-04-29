export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  uuid: string;
  fullName: string;
  initialName: string;
  email: string;
  isEmailVerified: boolean;
  isDetailCompleted: boolean;
  phoneNumber: string;
  gender: "male" | "female";
  birthDate: string;
  university: string;
  address: string;
  role: UserRole;
  birthPlace: string;
  registrationDate: string;
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female";
  birthDate: string;
  address: string;
  registrationDate: string;
}

export type MemberFormData = Omit<Member, "id" | "registrationDate">;

export interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female";
  birthDate: string;
  address: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  gender: "male" | "female";
  birthDate: string;
  address: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface SuccessResponse<T> {
  status: "success";
  data: T;
  message?: string;
  meta_data?: any;
}

export interface ErrorResponse {
  status: "error";
  message?: string;
  errors?: Record<string, any>;
  meta_data?: any;
}

export function isSuccessResponse<T>(
  res: ApiResponse<T>
): res is SuccessResponse<T> {
  return res.status === "success";
}

export interface ApiMemberResponse {
  id: number;
  uuid?: string;
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  birth_date: string;
  address: string;
  created_at: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
