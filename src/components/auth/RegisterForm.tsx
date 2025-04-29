"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterFormData, FormErrors } from "@/lib/types";
import { validateRegisterForm, isFormValid } from "@/lib/auth";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterForm() {
  const router = useRouter();
  const { register, error: authError, loading } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    gender: "male",
    birthDate: "",
    address: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate the field if it's been touched
    if (touchedFields[name]) {
      const fieldErrors = validateRegisterForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof FormErrors],
      }));
    }
  };

  const handleGenderChange = (value: "male" | "female") => {
    setFormData((prev) => ({ ...prev, gender: value }));

    // Validate gender field if touched
    if (touchedFields.gender) {
      const fieldErrors = validateRegisterForm({ ...formData, gender: value });
      setErrors((prev) => ({ ...prev, gender: fieldErrors.gender }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      const birthDate = format(date, "yyyy-MM-dd");
      setFormData((prev) => ({ ...prev, birthDate }));

      // Validate birthDate field if touched
      if (touchedFields.birthDate) {
        const fieldErrors = validateRegisterForm({ ...formData, birthDate });
        setErrors((prev) => ({ ...prev, birthDate: fieldErrors.birthDate }));
      }
    }
  };

  const handleBlur = (fieldName: keyof RegisterFormData) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate the field
    const fieldErrors = validateRegisterForm(formData);
    setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateRegisterForm(formData);
    setErrors(formErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouchedFields(allTouched);

    // Reset error
    setSubmitError(null);

    // Submit if valid
    if (isFormValid(formErrors)) {
      const success = await register(formData);
      if (success) {
        router.push("/dashboard");
      } else {
        setSubmitError(authError || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Register
        </CardTitle>
        <CardDescription className="text-center">
          Buat akun baru untuk mengakses Member Portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={() => handleBlur("fullName")}
              className={cn(errors.fullName && "border-red-500")}
              placeholder="Masukkan nama lengkap"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur("email")}
              className={cn(errors.email && "border-red-500")}
              placeholder="email@example.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={() => handleBlur("password")}
                className={cn(errors.password && "border-red-500")}
                placeholder="********"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Konfirmasi Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={() => handleBlur("confirmPassword")}
                className={cn(errors.confirmPassword && "border-red-500")}
                placeholder="********"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Nomor HP */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Nomor HP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={() => handleBlur("phoneNumber")}
              className={cn(errors.phoneNumber && "border-red-500")}
              placeholder="08xxxxxxxxxx"
              disabled={loading}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>
              Gender <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value: "male" | "female") =>
                handleGenderChange(value)
              }
              onBlur={() => handleBlur("gender")}
              className="flex flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" disabled={loading} />
                <Label htmlFor="male">Laki-laki</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" disabled={loading} />
                <Label htmlFor="female">Perempuan</Label>
              </div>
            </RadioGroup>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">
              Tanggal Lahir <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.birthDate && "border-red-500"
                  )}
                  onBlur={() => handleBlur("birthDate")}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "dd MMMM yyyy", { locale: id })
                    : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate}</p>
            )}
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Alamat <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              onBlur={() => handleBlur("address")}
              className={cn(errors.address && "border-red-500")}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              disabled={loading}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
