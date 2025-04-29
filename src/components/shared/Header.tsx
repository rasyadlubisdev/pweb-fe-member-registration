"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "./UserNav";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  // Don't show header on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Member Portal</span>
          </Link>
          {isAuthenticated && (
            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/dashboard"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/profile"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Profil
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
