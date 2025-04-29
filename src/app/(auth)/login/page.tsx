"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Only render the login form if not authenticated
  if (loading) return null;
  if (isAuthenticated) return null;

  return (
    <div className="container max-w-screen-md mx-auto px-4 py-16">
      <LoginForm />
    </div>
  );
}
