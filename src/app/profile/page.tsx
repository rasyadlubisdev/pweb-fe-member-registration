"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading or redirect
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-screen-md mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profil Pengguna</h1>
      <ProfileForm />
    </div>
  );
}
