"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-4">
        Selamat Datang di Member Portal
      </h1>
      <p className="text-xl text-center mb-12 max-w-2xl">
        Platform untuk pendaftaran dan manajemen anggota. Silakan login atau
        register untuk melanjutkan.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button asChild size="lg" className="px-8">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="px-8">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </main>
  );
}
