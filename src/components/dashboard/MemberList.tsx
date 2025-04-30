"use client";

import { useState, useEffect } from "react";
import { Member } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { generateId } from "@/lib/utils";

// Import shadcn components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Trash,
  Search,
  Users,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

// Use custom hook for member management
import { useMembers } from "@/hooks/useMembers";

interface MemberListProps {
  onDeleteMember?: (id: string) => void;
  onOpenDeleteConfirm?: (id: string | null) => void;
}

export default function MemberList({
  onDeleteMember,
  onOpenDeleteConfirm,
}: MemberListProps) {
  const { user } = useAuth();
  // Explicitly check for ADMIN role - user must be ADMIN to delete
  const isAdmin = user?.role === "ADMIN";

  // Use the custom hook for member management
  const { members, isLoading: loading, deleteMember } = useMembers();
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredMembers = members.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber.includes(searchTerm)
  );

  // Handle member deletion - only admin can delete
  const handleDeleteMember = (id: string) => {
    if (!isAdmin) {
      setError("Anda tidak memiliki izin untuk menghapus member");
      return;
    }

    try {
      // Call the hook's delete function
      deleteMember(id);

      // Call the parent component's delete handler if provided
      if (onDeleteMember) {
        onDeleteMember(id);
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus member");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
            <h3 className="text-lg font-medium">Memuat data member...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Users className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium">Belum ada member</h3>
            <p className="text-sm text-gray-500 mt-1">
              Member baru akan muncul di sini setelah pendaftaran
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">
              Daftar Member
              <Badge variant="outline" className="ml-2">
                {members.length}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              {isAdmin ? (
                <>
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Anda memiliki hak akses untuk mengelola member</span>
                </>
              ) : (
                "Lihat semua member terdaftar dalam sistem"
              )}
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Cari member..."
              className="pl-8 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead className="hidden md:table-cell">Gender</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Tanggal Lahir
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Tgl Registrasi
                </TableHead>
                {/* Only show action column if user is admin */}
                {isAdmin && <TableHead style={{ width: "60px" }}></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 7 : 6}
                    className="text-center h-32"
                  >
                    Tidak ada member yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.fullName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {member.email}
                    </TableCell>
                    <TableCell>{member.phoneNumber}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {member.gender === "male" ? "Laki-laki" : "Perempuan"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(member.birthDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(member.registrationDate)}
                    </TableCell>
                    {/* Only render delete option if user is admin */}
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() =>
                                onOpenDeleteConfirm &&
                                onOpenDeleteConfirm(member.id)
                              }
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between py-4">
        <span className="text-sm text-gray-500">
          Total: {members.length} member
        </span>
        {/* Only show total delete button for admin */}
        {isAdmin && members.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onOpenDeleteConfirm && onOpenDeleteConfirm(null)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Hapus Semua
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
