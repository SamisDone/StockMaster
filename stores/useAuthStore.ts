import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { User } from "@/lib/types";

type AuthStore = {
	user: User | null;
	isLoading: boolean;
	login: (user: Pick<User, "email"> & { password: string }) => Promise<boolean>;
	register: (
		data: Pick<User, "email" | "name"> & { password: string }
	) => Promise<boolean>;
	logout: () => Promise<boolean>;
	doesUserHavePermission: (id: string) => boolean;
	initializeAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			user: null,
			isLoading: true,

			login: async ({ email, password }) => {
				try {
					const user = await api.auth.login(email, password);
					set({ user });
					return true;
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Login failed. Please try again.";
					console.error("Login failed:", error);
					toast.error("Failure", {
						description: message,
					});
					return false;
				}
			},

			register: async ({ email, password, name }) => {
				try {
					const user = await api.auth.register(email, password, name);
					set({ user });
					return true;
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Registration failed. Please try again.";
					console.error("Registration failed:", error);
					toast.error("Failure", {
						description: message,
					});
					return false;
				}
			},

			logout: async () => {
				try {
					await api.auth.logout();
					set({ user: null });
					return true;
				} catch (error) {
					console.error("Logout failed:", error);
					toast.error("Failure", {
						description: "Logout failed. Please try again.",
					});
					return false;
				}
			},

			doesUserHavePermission: (id: string) => {
				const currentUser = get().user;
				if (!currentUser) return false;
				return currentUser.id === id || currentUser.role === "admin";
			},

			initializeAuth: async () => {
				try {
					const user = await api.auth.getCurrentUser();
					if (user) {
						set({ user });
					} else {
						set({ user: null });
					}
				} catch (err) {
					console.error("Failed to initialize auth:", err);
					toast.error("Failure", {
						description:
							"Failed to initialize authentication. Please try again.",
					});
					set({ user: null });
				} finally {
					set({ isLoading: false });
				}
			},
		}),
		{
			name: "auth-storage", // localStorage key
		}
	)
);
