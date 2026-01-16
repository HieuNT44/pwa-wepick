"use client";

import { useState, useEffect } from "react";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addMatch,
} from "@/lib/firebase/users";
import type { User, CreateUserInput } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const create = async (userData: CreateUserInput) => {
    try {
      const id = await createUser(userData);
      await loadUsers();
      toast({
        title: "Thành công",
        description: "Đã tạo user mới",
      });
      return id;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo user",
        variant: "destructive",
      });
      throw err;
    }
  };

  const update = async (userData: { id: string; [key: string]: unknown }) => {
    try {
      await updateUser(userData as Parameters<typeof updateUser>[0]);
      await loadUsers();
      toast({
        title: "Thành công",
        description: "Đã cập nhật user",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật user",
        variant: "destructive",
      });
      throw err;
    }
  };

  const remove = async (userId: string) => {
    try {
      await deleteUser(userId);
      await loadUsers();
      toast({
        title: "Thành công",
        description: "Đã xóa user",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa user",
        variant: "destructive",
      });
      throw err;
    }
  };

  const addMatchToUser = async (
    userId: string,
    result: "thắng" | "thua",
    opponent: string
  ) => {
    try {
      await addMatch(userId, result, opponent);
      await loadUsers();
      toast({
        title: "Thành công",
        description: "Đã thêm match vào lịch sử",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm match",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    loading,
    error,
    create,
    update,
    remove,
    addMatchToUser,
    refresh: loadUsers,
  };
}

