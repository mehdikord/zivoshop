"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
};

type AuthState = {
  user: User | null;
  login: (mobile: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, mobile: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: async (mobile, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile, password }),
          });
          const data = await res.json();
          if (data.success && data.data?.user) {
            set({ user: data.data.user });
          }
          return { success: data.success, message: data.message || "خطا در ورود" };
        } catch {
          return { success: false, message: "خطای شبکه" };
        }
      },

      register: async (name, mobile, password) => {
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, mobile, password }),
          });
          const data = await res.json();
          if (data.success && data.data?.user) {
            set({ user: data.data.user });
          }
          return { success: data.success, message: data.message || "خطا در ثبت‌نام" };
        } catch {
          return { success: false, message: "خطای شبکه" };
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // ignore
        }
        set({ user: null });
      },

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        try {
          const res = await fetch("/api/auth/me");
          const data = await res.json();
          if (data.success && data.data?.user) {
            set({ user: data.data.user });
          } else {
            set({ user: null });
          }
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "zivo-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const isAuthenticated = (): boolean =>
  useAuthStore.getState().user !== null;
