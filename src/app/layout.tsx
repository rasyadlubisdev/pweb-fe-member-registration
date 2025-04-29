import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/shared/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Member Registration Portal",
  description:
    "Portal pendaftaran member dengan Next.js, TypeScript, Tailwind CSS, dan ShadcnUI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-[calc(100vh-64px-56px)]">{children}</main>
          <footer className="border-t py-6 md:py-8">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Member Registration Portal. All
              rights reserved.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
