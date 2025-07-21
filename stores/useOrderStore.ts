import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { Order } from "@/lib/types";

interface OrderStore {
	orders: Order[];
	isLoading: boolean;
	fetchOrders: () => Promise<void>;
	addOrder: (
		order: Omit<Order, "id" | "createdAt" | "updatedAt" | "createdBy">
	) => Promise<void>;
	updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
	deleteOrder: (id: string) => Promise<void>;
	getOrderById: (id: string) => Promise<Order | undefined>;
}

export const useOrderStore = create<OrderStore>()(
	persist(
		(set) => ({
			orders: [],
			isLoading: true,

			fetchOrders: async () => {
				try {
					const ordersData = await api.orders.getAll();
					set({ orders: ordersData, isLoading: false });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch orders";
					toast.error(message);
					console.error("Error fetching orders:", message);
				}
			},

			addOrder: async (orderData) => {
				try {
					const newOrder = await api.orders.create(orderData);
					set((state) => ({
						orders: [...state.orders, newOrder],
					}));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add order";
					toast.error(message);
					console.error("Error adding order:", message);
				}
			},

			updateOrder: async (id, updates) => {
				try {
					const updatedOrder = await api.orders.update(id, updates);
					if (updatedOrder) {
						set((state) => ({
							orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
						}));
					} else {
						const message = "Order not found or unauthorized";
						toast.error(message);
						console.error("Error updating order:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to update order";
					toast.error(message);
					console.error("Error updating order:", message);
				}
			},

			deleteOrder: async (id) => {
				try {
					const success = await api.orders.delete(id);
					if (success) {
						set((state) => ({
							orders: state.orders.filter((o) => o.id !== id),
						}));
					} else {
						throw new Error("Order not found or unauthorized");
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to delete order";
					toast.error(message);
					console.error("Error deleting order:", message);
				}
			},

			getOrderById: async (id) => {
				return (await api.orders.getById(id)) || undefined;
			},
		}),
		{
			name: "order-storage", // localStorage key
		}
	)
);
