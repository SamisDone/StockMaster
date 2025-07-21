import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { AnalyticsData } from "@/lib/types";

interface AnalyticStore {
	analytics: AnalyticsData;
	isLoading: boolean;
	fetchAnalytics: () => Promise<void>;
}

export const useAnalyticStore = create<AnalyticStore>()(
	persist(
		(set) => ({
			analytics: {
				totalProducts: 0,
				lowStockItems: 0,
				totalSuppliers: 0,
				totalOrders: 0,
				totalRevenue: 0,
				recentOrders: [],
				topProducts: [],
				monthlyRevenue: [],
			},
			isLoading: true,
			fetchAnalytics: async () => {
				try {
					const analyticsData = await api.analytics.getAnalyticsData();
					set({
						analytics: analyticsData,
						isLoading: false,
					});
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch orders";
					toast.error(message);
					console.error("Error fetching orders:", message);
				}
			},
		}),
		{
			name: "analytic-storage", // localStorage key
		}
	)
);
