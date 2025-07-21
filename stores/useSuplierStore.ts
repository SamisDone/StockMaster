import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { Supplier } from "@/lib/types";

interface SupplierStore {
	suppliers: Supplier[];
	isLoading: boolean;
	fetchSuppliers: () => Promise<void>;
	addSupplier: (
		supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt" | "createdBy">
	) => Promise<void>;
	updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
	deleteSupplier: (id: string) => Promise<void>;
	getSupplierById: (id: string) => Promise<Supplier | undefined>;
}

export const useSupplierStore = create<SupplierStore>()(
	persist(
		(set) => ({
			suppliers: [],
			isLoading: true,

			fetchSuppliers: async () => {
				try {
					const suppliersData = await api.suppliers.getAll();
					set({ suppliers: suppliersData, isLoading: false });
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to fetch suppliers";
					toast.error(message);
					console.error("Error fetching suppliers:", message);
				}
			},

			addSupplier: async (supplierData) => {
				try {
					const newSupplier = await api.suppliers.create(supplierData);
					set((state) => ({
						suppliers: [...state.suppliers, newSupplier],
					}));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add supplier";
					toast.error(message);
					console.error("Error adding supplier:", message);
				}
			},

			updateSupplier: async (id, updates) => {
				try {
					const updatedSupplier = await api.suppliers.update(id, updates);
					if (updatedSupplier) {
						set((state) => ({
							suppliers: state.suppliers.map((o) =>
								o.id === id ? updatedSupplier : o
							),
						}));
					} else {
						const message = "Supplier not found or unauthorized";
						toast.error(message);
						console.error("Error updating supplier:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to update supplier";
					toast.error(message);
					console.error("Error updating supplier:", message);
				}
			},

			deleteSupplier: async (id) => {
				try {
					const success = await api.suppliers.delete(id);
					if (success) {
						set((state) => ({
							suppliers: state.suppliers.filter((o) => o.id !== id),
						}));
					} else {
						throw new Error("Supplier not found or unauthorized");
					}
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to delete supplier";
					toast.error(message);
					console.error("Error deleting supplier:", message);
				}
			},

			getSupplierById: async (id) => {
				return (await api.suppliers.getById(id)) || undefined;
			},
		}),
		{
			name: "supplier-storage", // localStorage key
		}
	)
);
