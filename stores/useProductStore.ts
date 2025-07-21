import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { Product } from "@/lib/types";

interface ProductStore {
	products: Product[];
	isLoading: boolean;
	fetchProducts: () => Promise<void>;
	addProduct: (
		product: Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">
	) => Promise<void>;
	updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
	deleteProduct: (id: string) => Promise<void>;
	getProductById: (id: string) => Promise<Product | undefined>;
}

export const useProductStore = create<ProductStore>()(
	persist(
		(set) => ({
			products: [],
			isLoading: true,

			fetchProducts: async () => {
				try {
					const productsData = await api.products.getAll();
					set({ products: productsData, isLoading: false });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch products";
					toast.error(message);
					console.error("Error fetching products:", message);
				}
			},

			addProduct: async (productData) => {
				try {
					const newProduct = await api.products.create(productData);
					set((state) => ({ products: [...state.products, newProduct] }));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add product";
					toast.error(message);
					console.error("Error adding product:", message);
				}
			},

			updateProduct: async (id, updates) => {
				try {
					const updatedProduct = await api.products.update(id, updates);
					if (updatedProduct) {
						set((state) => ({
							products: state.products.map((p) =>
								p.id === id ? updatedProduct : p
							),
						}));
					} else {
						const message = "Product not found or unauthorized";
						toast.error(message);
						console.error("Error updating product:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to update product";
					toast.error(message);
					console.error("Error updating product:", message);
				}
			},

			deleteProduct: async (id) => {
				try {
					const success = await api.products.delete(id);
					if (success) {
						set((state) => ({
							products: state.products.filter((p) => p.id !== id),
						}));
					} else {
						throw new Error("Product not found or unauthorized");
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to delete product";
					toast.error(message);
					console.error("Error deleting product:", message);
				}
			},

			getProductById: async (id) => {
				return (await api.products.getById(id)) || undefined;
			},
		}),
		{
			name: "product-storage", // localStorage key
		}
	)
);
