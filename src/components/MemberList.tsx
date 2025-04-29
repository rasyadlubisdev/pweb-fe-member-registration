import { useState } from "react";
import { Member } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash, Search, Users } from "lucide-react";

interface MemberListProps {
  members: Member[];
  onDeleteMember: (id: string) => void;
  onDeleteAllMembers: () => void;
  onOpenDeleteConfirm: (id: string | null) => void;
}

export default function MemberList({
  members,
  onDeleteMember,
  onDeleteAllMembers,
  onOpenDeleteConfirm,
}: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy", { locale: id });
  };

  if (members.length === 0) {
    return (
      <Card className="mt-8">
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
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl">
            Daftar Member
            <Badge variant="outline" className="ml-2">
              {members.length}
            </Badge>
          </CardTitle>
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
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Tabel</TabsTrigger>
            <TabsTrigger value="cards">Kartu</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="w-full">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Gender
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Tanggal Lahir
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Tgl Registrasi
                    </TableHead>
                    <TableHead style={{ width: "60px" }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
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
                                onClick={() => onOpenDeleteConfirm(member.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="cards">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada member yang ditemukan
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {member.fullName}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => onOpenDeleteConfirm(member.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Badge className="w-fit">
                        {member.gender === "male" ? "Laki-laki" : "Perempuan"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Email:</span>
                        <span className="col-span-2">{member.email}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">No. HP:</span>
                        <span className="col-span-2">{member.phoneNumber}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Tanggal Lahir:</span>
                        <span className="col-span-2">
                          {formatDate(member.birthDate)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Alamat:</span>
                        <span className="col-span-2">{member.address}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Terdaftar:</span>
                        <span className="col-span-2">
                          {formatDate(member.registrationDate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {members.length > 0 && (
        <CardFooter className="flex justify-between py-4">
          <span className="text-sm text-gray-500">
            Total: {members.length} member
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onOpenDeleteConfirm(null)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Hapus Semua
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
