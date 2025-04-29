"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserFormData, FormErrors } from "@/lib/types";
import { userApi } from "@/lib/api";
import { validateMemberForm, isFormValid } from "@/lib/utils";
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
import { CalendarIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileForm() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState<UserFormData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "male",
    birthDate: user?.birthDate || "",
    address: user?.address || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  // Set date when user data loads
  useEffect(() => {
    if (user?.birthDate) {
      setDate(new Date(user.birthDate));
    }
  }, [user]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        birthDate: user.birthDate,
        address: user.address,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate the field if it's been touched
    if (touchedFields[name]) {
      const fieldErrors = validateMemberForm({ ...formData, [name]: value });
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
      const fieldErrors = validateMemberForm({ ...formData, gender: value });
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
        const fieldErrors = validateMemberForm({ ...formData, birthDate });
        setErrors((prev) => ({ ...prev, birthDate: fieldErrors.birthDate }));
      }
    }
  };

  const handleBlur = (fieldName: keyof UserFormData) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate the field
    const fieldErrors = validateMemberForm(formData);
    setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateMemberForm(formData);
    setErrors(formErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouchedFields(allTouched);

    // Reset messages
    setSubmitError(null);
    setSubmitSuccess(null);

    // Submit if valid
    if (isFormValid(formErrors)) {
      setLoading(true);

      try {
        const response = await userApi.updateProfile(formData);

        if (response.status === "success") {
          setSubmitSuccess("Profil berhasil diperbarui!");
          // Refresh user data
          await refreshUser();
        } else {
          setSubmitError(
            response.message || "Gagal memperbarui profil. Silakan coba lagi."
          );
        }
      } catch (error) {
        setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
            <h3 className="text-lg font-medium">Memuat data profil...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Profil Saya</CardTitle>
        <CardDescription>Update informasi profil Anda di sini</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert
              variant="default"
              className="mb-4 bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Form fields */}
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
              disabled={true}
            />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
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
                <RadioGroupItem
                  value="male"
                  id="profile-male"
                  disabled={loading}
                />
                <Label htmlFor="profile-male">Laki-laki</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="female"
                  id="profile-female"
                  disabled={loading}
                />
                <Label htmlFor="profile-female">Perempuan</Label>
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
