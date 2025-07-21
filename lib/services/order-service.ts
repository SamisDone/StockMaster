import { api } from "../api";
import type { Order } from "../types";
import { BaseService } from "./base-service";

export class OrderService extends BaseService {
	private readonly ORDERS_KEY = "stockmaster_orders";

	async getAll(): Promise<Order[]> {
		return this.getFromStorage<Order>(this.ORDERS_KEY);
	}

	async getById(id: string): Promise<Order | null> {
		const orders = this.getFromStorage<Order>(this.ORDERS_KEY);
		return orders.find((o) => o.id === id) || null;
	}

	async create(
		orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "createdBy">
	): Promise<Order> {
		const orders = this.getFromStorage<Order>(this.ORDERS_KEY);

		const newOrder: Order = {
			...orderData,
			id: this.generateId(),
			createdAt: this.getCurrentTimestamp(),
			updatedAt: this.getCurrentTimestamp(),
			createdBy: (await api.auth.getCurrentUser())!.id,
		};

		orders.push(newOrder);
		this.saveToStorage(this.ORDERS_KEY, orders);
		return newOrder;
	}

	async update(
		id: string,
		orderData: Partial<Omit<Order, "id" | "createdAt">>
	): Promise<Order | null> {
		const orders = this.getFromStorage<Order>(this.ORDERS_KEY);
		const index = orders.findIndex((o) => o.id === id);

		if (index === -1) return null;

		// check permissions
		if (!api.doesUserHavePermission(orders[index].createdBy)) {
			return null; // User not authorized to update this order
		}

		orders[index] = {
			...orders[index],
			...orderData,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.ORDERS_KEY, orders);
		return orders[index];
	}

	async delete(id: string): Promise<boolean> {
		const orders = this.getFromStorage<Order>(this.ORDERS_KEY);
		const order = orders.find((o) => o.id === id);
		if (!order) return false;

		// check permissions
		if (!api.doesUserHavePermission(order.createdBy)) {
			return false; // User not authorized to delete this order
		}

		const filteredOrders = orders.filter((o) => o.id !== id);
		if (filteredOrders.length === orders.length) return false;

		this.saveToStorage(this.ORDERS_KEY, filteredOrders);
		return true;
	}

	async getRecentOrders(limit = 10): Promise<Order[]> {
		const orders = this.getFromStorage<Order>(this.ORDERS_KEY);
		return orders
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
			.slice(0, limit);
	}
}
