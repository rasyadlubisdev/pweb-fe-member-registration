"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Only render the register form if not authenticated
  if (loading) return null;
  if (isAuthenticated) return null;

  return (
    <div className="container max-w-screen-md mx-auto px-4 py-16">
      <RegisterForm />
    </div>
  );
}
