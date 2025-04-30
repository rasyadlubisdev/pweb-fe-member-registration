"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserFormData, FormErrors, User } from "@/lib/types";
import { userApi, authApi } from "@/lib/api";
import { isSuccessResponse } from "@/lib/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Edit,
  RefreshCw,
} from "lucide-react";
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
  const [isMounted, setIsMounted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
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
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState("view");

  // Mounting effect to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch profile data directly using API
  useEffect(() => {
    // Ubah kode untuk melakukan pemeriksaan respons API
    const fetchProfileData = async () => {
      setProfileLoading(true);
      try {
        const response = await authApi.getCurrentUser();

        // Ganti penggunaan isSuccessResponse
        if (response.status === "success" && "data" in response) {
          const userData = response.data;
          // Convert API response to User format
          const profileUser: User = {
            id: String(userData.account.id),
            uuid: userData.account.uuid,
            email: userData.account.email,
            isEmailVerified: userData.account.is_email_verified,
            isDetailCompleted: userData.account.is_detail_completed,
            fullName: userData.details.full_name || "",
            phoneNumber: userData.details.phone_number || "",
            gender: "male", // Default, update if API provides it
            birthDate: "", // Set default, update if API provides it
            university: userData.details.university || "",
            address: "", // Set default, update if API provides it
            birthPlace: "", // Set default, update if API provides it
            initialName: userData.details.initial_name || "",
            role: "USER", // Default role
            registrationDate: new Date().toISOString(), // Default to current time
          };

          setProfileData(profileUser);

          // Update form data
          setFormData({
            fullName: profileUser.fullName,
            email: profileUser.email,
            phoneNumber: profileUser.phoneNumber,
            gender: profileUser.gender,
            birthDate: profileUser.birthDate,
            address: profileUser.address,
          });

          // Update date if birthDate exists
          if (profileUser.birthDate) {
            try {
              setDate(new Date(profileUser.birthDate));
            } catch (e) {
              console.error("Invalid date format:", profileUser.birthDate);
            }
          }
        } else {
          console.error("Failed to fetch profile:", response.message);
          setSubmitError("Gagal memuat data profil. Silakan coba lagi.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setSubmitError(
          "Terjadi kesalahan saat memuat profil. Silakan coba lagi."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    if (isMounted) {
      fetchProfileData();
    }
  }, [isMounted]);

  // Update form data when user data changes (from auth context)
  useEffect(() => {
    if (user && !profileData) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "male",
        birthDate: user.birthDate || "",
        address: user.address || "",
      });

      if (user.birthDate) {
        try {
          setDate(new Date(user.birthDate));
        } catch (e) {
          console.error("Invalid date format:", user.birthDate);
        }
      }
    }
  }, [user, profileData]);

  // Reset to view tab after successful update
  useEffect(() => {
    if (submitSuccess) {
      setActiveTab("view");
    }
  }, [submitSuccess]);

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

  const handleRefreshProfile = async () => {
    setProfileLoading(true);
    await refreshUser();

    try {
      const response = await authApi.getCurrentUser();

      // Ganti penggunaan isSuccessResponse
      if (response.status === "success" && "data" in response) {
        const userData = response.data;
        // Convert API response to User format
        const profileUser: User = {
          id: String(userData.account.id),
          uuid: userData.account.uuid,
          email: userData.account.email,
          isEmailVerified: userData.account.is_email_verified,
          isDetailCompleted: userData.account.is_detail_completed,
          fullName: userData.details.full_name || "",
          phoneNumber: userData.details.phone_number || "",
          gender: "male", // Default
          birthDate: "", // Set default
          university: userData.details.university || "",
          address: "", // Set default
          birthPlace: "", // Set default
          initialName: userData.details.initial_name || "",
          role: "USER", // Default role
          registrationDate: new Date().toISOString(), // Default to current time
        };

        setProfileData(profileUser);

        // Update form data
        setFormData({
          fullName: profileUser.fullName,
          email: profileUser.email,
          phoneNumber: profileUser.phoneNumber,
          gender: profileUser.gender,
          birthDate: profileUser.birthDate,
          address: profileUser.address,
        });

        setSubmitSuccess("Data profil berhasil dimuat ulang");
      } else {
        setSubmitError("Gagal memuat ulang data profil");
      }
    } catch (error) {
      setSubmitError("Terjadi kesalahan saat memuat ulang profil");
    } finally {
      setProfileLoading(false);
    }
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
        // Get current user data to use for fields that don't change
        const currentUser = profileData || user;

        // Convert UserFormData to UpdateProfileRequest format
        const updateProfileData = {
          initial_name:
            currentUser?.initialName || formData.fullName.split(" ")[0],
          full_name: formData.fullName,
          university: currentUser?.university || "", // Use existing or empty string
          phone_number: formData.phoneNumber,
          // Other fields like birthDate, gender, address will be handled separately
        };

        const response = await userApi.updateProfile(updateProfileData);

        if (response.status === "success") {
          setSubmitSuccess("Profil berhasil diperbarui!");

          // Refresh profile data
          await handleRefreshProfile();
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (e) {
      return dateString;
    }
  };

  if (!isMounted) {
    return null; // Prevent hydration errors
  }

  if (profileLoading && !formData.email) {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Profil Saya</CardTitle>
            <CardDescription>
              Lihat dan update informasi profil Anda di sini
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshProfile}
            disabled={profileLoading}
            title="Muat ulang data profil"
          >
            <RefreshCw
              className={cn("h-4 w-4", profileLoading && "animate-spin")}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Lihat Profil</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Edit Profil</span>
            </TabsTrigger>
          </TabsList>

          {/* View Profile Tab */}
          <TabsContent value="view" className="space-y-6">
            <div className="p-6 border rounded-lg bg-card/50">
              {submitSuccess && (
                <Alert
                  variant="default"
                  className="mb-6 bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{submitSuccess}</AlertDescription>
                </Alert>
              )}

              {submitError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nama Lengkap
                  </p>
                  <p className="font-medium">{formData.fullName || "-"}</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="font-medium">{formData.email || "-"}</p>
                  <p className="text-xs text-muted-foreground">
                    Email tidak dapat diubah
                  </p>
                </div>

                {/* Nomor HP */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nomor HP
                  </p>
                  <p className="font-medium">{formData.phoneNumber || "-"}</p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Gender
                  </p>
                  <p className="font-medium">
                    {formData.gender === "male" ? "Laki-laki" : "Perempuan"}
                  </p>
                </div>

                {/* Tanggal Lahir */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tanggal Lahir
                  </p>
                  <p className="font-medium">
                    {formatDate(formData.birthDate)}
                  </p>
                </div>

                {/* Alamat */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Alamat
                  </p>
                  <p className="font-medium">{formData.address || "-"}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("edit")}
                  className="w-full"
                  disabled={profileLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profil
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
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
                  disabled={loading || profileLoading}
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
                  disabled={loading || profileLoading}
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
                      disabled={loading || profileLoading}
                    />
                    <Label htmlFor="profile-male">Laki-laki</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="female"
                      id="profile-female"
                      disabled={loading || profileLoading}
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
                      disabled={loading || profileLoading}
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
                  disabled={loading || profileLoading}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("view")}
                  disabled={loading || profileLoading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading || profileLoading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
