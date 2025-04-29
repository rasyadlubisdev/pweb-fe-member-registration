"use client";

import { Member } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export default function SuccessModal({
  isOpen,
  onClose,
  member,
}: SuccessModalProps) {
  if (!member) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Pendaftaran Berhasil!
          </DialogTitle>
          <DialogDescription className="text-center">
            Data member baru telah berhasil disimpan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 text-sm">
          <div className="grid grid-cols-3 gap-1">
            <span className="text-gray-500">Nama:</span>
            <span className="col-span-2 font-medium">{member.fullName}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-gray-500">Email:</span>
            <span className="col-span-2">{member.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-gray-500">No. HP:</span>
            <span className="col-span-2">{member.phoneNumber}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-gray-500">Gender:</span>
            <span className="col-span-2">
              {member.gender === "male" ? "Laki-laki" : "Perempuan"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-gray-500">Tanggal Lahir:</span>
            <span className="col-span-2">{formatDate(member.birthDate)}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-gray-500">Alamat:</span>
            <span className="col-span-2">{member.address}</span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Kembali ke Halaman Utama
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
