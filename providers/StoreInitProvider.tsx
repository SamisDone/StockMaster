"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useAnalyticStore } from "@/stores/useAnalyticStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useProductStore } from "@/stores/useProductStore";
import { useReviewStore } from "@/stores/useReviewStore";
import { useStockStore } from "@/stores/useStockStore";
import { useSupplierStore } from "@/stores/useSuplierStore";
import { useUserStore } from "@/stores/useUserStore";

export default function StoreInitProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const fetchAnalytics = useAnalyticStore((state) => state.fetchAnalytics);
	const initializeAuth = useAuthStore((state) => state.initializeAuth);
	const fetchOrders = useOrderStore((state) => state.fetchOrders);
	const fetchProducts = useProductStore((state) => state.fetchProducts);
	const fetchReviews = useReviewStore((state) => state.fetchReviews);
	const fetchStocks = useStockStore((state) => state.fetchStocks);
	const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers);
	const fetchUsers = useUserStore((state) => state.fetchUsers);

	useEffect(() => {
		const init = async () => {
			const promises = [
				fetchAnalytics(),
				initializeAuth(),
				fetchOrders(),
				fetchProducts(),
				fetchReviews(),
				fetchStocks(),
				fetchSuppliers(),
				fetchUsers(),
			];
			await Promise.all(promises);
		};

		init().catch((error) => {
			console.error("Error during store initialization:", error);
			toast.error("Initialization failed", {
				description: "An error occurred while initializing the application.",
			});
		});
	}, []);

	return children;
}
