import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { Stock } from "@/lib/types";

interface StockStore {
	stocks: Stock[];
	isLoading: boolean;
	fetchStocks: () => Promise<void>;
	addStock: (
		stock: Omit<Stock, "id" | "createdAt" | "updatedAt" | "createdBy">
	) => Promise<void>;
	updateStock: (id: string, updates: Partial<Stock>) => Promise<void>;
	deleteStock: (id: string) => Promise<void>;
	getStockById: (id: string) => Promise<Stock | undefined>;
}

export const useStockStore = create<StockStore>()(
	persist(
		(set) => ({
			stocks: [],
			isLoading: true,

			fetchStocks: async () => {
				try {
					const stocksData = await api.stocks.getAll();
					set({ stocks: stocksData, isLoading: false });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch stocks";
					toast.error(message);
					console.error("Error fetching stocks:", message);
				}
			},

			addStock: async (stockData) => {
				try {
					const newStock = await api.stocks.create(stockData);
					set((state) => ({ stocks: [...state.stocks, newStock] }));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add stock";
					toast.error(message);
					console.error("Error adding stock:", message);
				}
			},

			updateStock: async (id, updates) => {
				try {
					const updatedStock = await api.stocks.update(id, updates);
					if (updatedStock) {
						set((state) => ({
							stocks: state.stocks.map((p) => (p.id === id ? updatedStock : p)),
						}));
					} else {
						const message = "Stock not found or unauthorized";
						toast.error(message);
						console.error("Error updating stock:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to update stock";
					toast.error(message);
					console.error("Error updating stock:", message);
				}
			},

			deleteStock: async (id) => {
				try {
					const success = await api.stocks.delete(id);
					if (success) {
						set((state) => ({
							stocks: state.stocks.filter((p) => p.id !== id),
						}));
					} else {
						throw new Error("Stock not found or unauthorized");
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to delete stock";
					toast.error(message);
					console.error("Error deleting stock:", message);
				}
			},

			getStockById: async (id) => {
				return (await api.stocks.getByProductId(id)) || undefined;
			},
		}),
		{
			name: "stock-storage", // localStorage key
		}
	)
);
