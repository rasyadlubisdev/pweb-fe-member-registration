"use client";

import { useState } from "react";
import { MemberFormData, FormErrors, Member } from "@/lib/types";
import { validateMemberForm, isFormValid } from "@/lib/utils";
import { membersApi } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import SuccessModal from "@/components/shared/SuccessModal";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const initialFormData: MemberFormData = {
  fullName: "",
  email: "",
  phoneNumber: "",
  gender: "male",
  birthDate: "",
  address: "",
};

export default function RegistrationForm() {
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [addedMember, setAddedMember] = useState<Member | null>(null);

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

  const handleBlur = (fieldName: keyof MemberFormData) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate the field
    const fieldErrors = validateMemberForm(formData);
    setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Reset error
    setError(null);

    // Submit if valid
    if (isFormValid(formErrors)) {
      setLoading(true);

      try {
        const response = await membersApi.addMember(formData);

        // Check if response has successful status and is a SuccessResponse type (has data property)
        if (response.status === "success" && "data" in response) {
          // Map API member to component member format
          const rawGender = response.data.gender?.toLowerCase();

          const memberData: Member = {
            id: String(response.data.id),
            fullName: response.data.full_name,
            email: response.data.email,
            phoneNumber: response.data.phone_number,
            gender: rawGender === "male" ? "male" : "female", // ✅ Normalisasi dan validasi
            birthDate: response.data.birth_date,
            address: response.data.address,
            registrationDate: response.data.created_at,
          };

          setAddedMember(memberData);
          setIsSuccessModalOpen(true);

          // Reset form
          setFormData(initialFormData);
          setDate(undefined);
          setTouchedFields({});
          setErrors({});
        } else {
          setError(response.message || "Pendaftaran gagal. Silakan coba lagi.");
        }
      } catch (error) {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Pendaftaran Member Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
                  <RadioGroupItem
                    value="female"
                    id="female"
                    disabled={loading}
                  />
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
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        member={addedMember}
      />
    </>
  );
}
