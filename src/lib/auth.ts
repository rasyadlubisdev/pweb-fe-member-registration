import { User, LoginFormData, RegisterFormData, FormErrors } from "./types";

// Token name in localStorage
const TOKEN_KEY = "member_portal_token";
const USER_KEY = "member_portal_user";

// Set JWT token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get JWT token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove JWT token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Set user in localStorage
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get user from localStorage
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return null;
  }
};

// Remove user from localStorage
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "ADMIN";
};

// Logout user
export const logout = (): void => {
  removeAuthToken();
  removeUser();
};

// Validate login form
export const validateLoginForm = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  // Validate email
  if (!data.email.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format email tidak valid";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password wajib diisi";
  } else if (data.password.length < 6) {
    errors.password = "Password minimal 6 karakter";
  }

  return errors;
};

// Validate register form
export const validateRegisterForm = (data: RegisterFormData): FormErrors => {
  const errors: FormErrors = {};

  // Validate full name
  if (!data.fullName.trim()) {
    errors.fullName = "Nama lengkap wajib diisi";
  }

  // Validate email
  if (!data.email.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format email tidak valid";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password wajib diisi";
  } else if (data.password.length < 6) {
    errors.password = "Password minimal 6 karakter";
  }

  // Validate confirm password
  if (!data.confirmPassword) {
    errors.confirmPassword = "Konfirmasi password wajib diisi";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Password dan konfirmasi password tidak sama";
  }

  // Validate phone number
  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = "Nomor HP wajib diisi";
  } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Format nomor HP tidak valid (format: 08xxxxxxxxxx)";
  }

  // Validate gender
  if (!data.gender) {
    errors.gender = "Gender wajib dipilih";
  }

  // Validate birth date
  if (!data.birthDate) {
    errors.birthDate = "Tanggal lahir wajib diisi";
  }

  // Validate address
  if (!data.address.trim()) {
    errors.address = "Alamat wajib diisi";
  }

  return errors;
};

// Check if form is valid
export const isFormValid = (errors: FormErrors): boolean => {
  return Object.keys(errors).length === 0;
};
