import { useState, useEffect } from "react";
import { Member, MemberFormData } from "@/lib/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "member-registration-data";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load members from localStorage on component mount
  useEffect(() => {
    const loadMembers = () => {
      try {
        const storedMembers = localStorage.getItem(STORAGE_KEY);
        if (storedMembers) {
          setMembers(JSON.parse(storedMembers));
        }
      } catch (error) {
        console.error("Error loading member data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Save members to localStorage whenever members change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }
  }, [members, isLoading]);

  // Add a new member
  const addMember = (memberData: MemberFormData) => {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
      registrationDate: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  // Delete a specific member
  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  // Delete all members
  const deleteAllMembers = () => {
    setMembers([]);
  };

  return {
    members,
    isLoading,
    addMember,
    deleteMember,
    deleteAllMembers,
  };
}
