"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormData, FormErrors } from "@/lib/types";
import { validateLoginForm, isFormValid } from "@/lib/auth";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { login, error: authError, loading } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate the field if it's been touched
    if (touchedFields[name]) {
      const fieldErrors = validateLoginForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof FormErrors],
      }));
    }
  };

  const handleBlur = (fieldName: keyof LoginFormData) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate the field
    const fieldErrors = validateLoginForm(formData);
    setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateLoginForm(formData);
    setErrors(formErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
  };
  setTouchedFields(allTouched);

  // Reset error
  setSubmitError(null);

  // Submit if valid
  if (isFormValid(formErrors)) {
    const success = await login(formData);
    if (success) {
      router.push("/dashboard");
    } else {
      setSubmitError(
        authError ||
          "Login failed. Please check your credentials and try again."
      );
    }
  }
}

return (
  <Card className="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
      <CardDescription className="text-center">
        Login untuk mengakses Member Portal
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

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
            className={errors.email ? "border-red-500" : ""}
            placeholder="email@example.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

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
            className={errors.password ? "border-red-500" : ""}
            placeholder="********"
            disabled={loading}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </CardContent>
    <CardFooter className="flex justify-center">
      <p className="text-sm text-center text-gray-600">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline"
        >
          Register
        </Link>
      </p>
    </CardFooter>
  </Card>
);
