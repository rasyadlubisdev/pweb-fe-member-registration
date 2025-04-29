export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female";
  birthDate: string;
  address: string;
  role: UserRole;
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

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
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
