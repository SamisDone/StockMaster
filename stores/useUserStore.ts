import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { User } from "@/lib/types";

interface UserStore {
	users: User[];
	isLoading: boolean;
	fetchUsers: () => Promise<void>;
	addUser: (
		user: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }
	) => Promise<void>;
	updateUser: (
		id: string,
		updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
	) => Promise<void>;
	updateUserWithPassword: (
		id: string,
		updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & {
			password?: string;
		}
	) => Promise<void>;
	deleteUser: (id: string) => Promise<void>;
	getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			users: [],
			isLoading: true,

			fetchUsers: async () => {
				try {
					const usersData = await api.users.getAll();
					set({ users: usersData, isLoading: false });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch users";
					toast.error(message);
					console.error("Error fetching users:", message);
				}
			},

			addUser: async (userData) => {
				try {
					const newUser = await api.users.create(userData);
					set((state) => ({
						users: [...state.users, newUser],
					}));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add user";
					toast.error(message);
					console.error("Error adding user:", message);
				}
			},

			updateUser: async (id, updates) => {
				try {
					const updatedUser = await api.users.update(id, updates);
					if (updatedUser) {
						set((state) => ({
							users: state.users.map((o) => (o.id === id ? updatedUser : o)),
						}));
					} else {
						const message = "User not found or unauthorized";
						toast.error(message);
						console.error("Error updating user:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to update user";
					toast.error(message);
					console.error("Error updating user:", message);
				}
			},

			updateUserWithPassword: async (id, updates) => {
				try {
					const updatedUser = await api.users.updateWithPassword(id, updates);
					if (updatedUser) {
						set((state) => ({
							users: state.users.map((o) => (o.id === id ? updatedUser : o)),
						}));
					} else {
						const message = "User not found or unauthorized";
						toast.error(message);
						console.error("Error updating user:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to update user";
					toast.error(message);
					console.error("Error updating user:", message);
				}
			},

			deleteUser: async (id) => {
				try {
					const success = await api.users.delete(id);
					if (success) {
						set((state) => ({
							users: state.users.filter((o) => o.id !== id),
						}));
					} else {
						throw new Error("User not found or unauthorized");
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to delete user";
					toast.error(message);
					console.error("Error deleting user:", message);
				}
			},

			getUserById: (id) => {
				return api.users.getById(id) || undefined;
			},
		}),
		{
			name: "user-storage", // localStorage key
		}
	)
);
