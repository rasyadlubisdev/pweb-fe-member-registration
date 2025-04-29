"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import MemberList from "@/components/dashboard/MemberList";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import { membersApi } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const openDeleteConfirm = (id: string | null) => {
    if (!isAdmin) return;

    setSelectedMemberId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!isAdmin || !selectedMemberId) return;

    try {
      await membersApi.deleteMember(selectedMemberId);
      // Close modal
      setIsDeleteModalOpen(false);
      // Reset selected ID
      setSelectedMemberId(null);
      // Refresh the page to show updated member list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  // Show loading or redirect
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <MemberList
        onOpenDeleteConfirm={openDeleteConfirm}
        onDeleteMember={(id) => console.log("Delete member:", id)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleteAll={false}
      />
    </div>
  );
}
