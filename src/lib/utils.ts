import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FormErrors, MemberFormData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function validateMemberForm(data: MemberFormData): FormErrors {
  const errors: FormErrors = {};

  // Validate full name
  if (!data.fullName?.trim()) {
    errors.fullName = "Nama lengkap wajib diisi";
  }

  // Validate email
  if (!data.email?.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format email tidak valid";
  }

  // Validate phone number
  if (!data.phoneNumber?.trim()) {
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
  if (!data.address?.trim()) {
    errors.address = "Alamat wajib diisi";
  }

  return errors;
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}
