"use client";

import { useState, useEffect } from "react";
import { Member } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { membersApi } from "@/lib/api";
import { isSuccessResponse } from "@/lib/types";

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
} from "lucide-react";

interface MemberListProps {
  onDeleteMember?: (id: string) => void;
  onOpenDeleteConfirm?: (id: string | null) => void;
}

export default function MemberList({
  onDeleteMember,
  onOpenDeleteConfirm,
}: MemberListProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await membersApi.getMembers(); // ✅ Pastikan return-nya ApiResponse<Member[]>

        if (isSuccessResponse(response)) {
          setMembers(response.data); // ✅ TypeScript paham: response = SuccessResponse<Member[]>
        } else {
          setError(response.message || "Failed to fetch members.");
        }
      } catch (error) {
        setError("Something went wrong while fetching members.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber.includes(searchTerm)
  );

  const handleDeleteMember = async (id: string) => {
    if (!isAdmin || !onDeleteMember) return;

    try {
      const response = await membersApi.deleteMember(id);

      if (response.status === "success") {
        // Call the parent component's delete handler
        onDeleteMember(id);
        // Update the local state
        setMembers((prev) => prev.filter((member) => member.id !== id));
      } else {
        setError(response.message || "Failed to delete member.");
      }
    } catch (error) {
      setError("Something went wrong while deleting member.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy", { locale: id });
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
            <CardDescription>
              {isAdmin
                ? "Manage semua member terdaftar dalam sistem"
                : "Lihat semua member terdaftar dalam sistem"}
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
      </CardFooter>
    </Card>
  );
}
