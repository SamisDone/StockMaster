import { api } from "../api";
import type { Stock } from "../types";
import { BaseService } from "./base-service";

export class StockService extends BaseService {
	private readonly STOCKS_KEY = "stockmaster_stocks";

	async getAll(): Promise<Stock[]> {
		return this.getFromStorage<Stock>(this.STOCKS_KEY);
	}

	async getByProductId(productId: string): Promise<Stock | null> {
		const stocks = this.getFromStorage<Stock>(this.STOCKS_KEY);
		return stocks.find((s) => s.productId === productId) || null;
	}

	async create(
		stockData: Omit<Stock, "id" | "updatedAt" | "createdAt" | "createdBy">
	): Promise<Stock> {
		const stocks = this.getFromStorage<Stock>(this.STOCKS_KEY);

		const newStock: Stock = {
			...stockData,
			id: this.generateId(),
			updatedAt: this.getCurrentTimestamp(),
			createdAt: this.getCurrentTimestamp(),
			createdBy: (await api.auth.getCurrentUser())!.id,
		};

		stocks.push(newStock);
		this.saveToStorage(this.STOCKS_KEY, stocks);
		return newStock;
	}

	async update(
		id: string,
		stockData: Partial<Omit<Stock, "id">>
	): Promise<Stock | null> {
		const stocks = this.getFromStorage<Stock>(this.STOCKS_KEY);
		const index = stocks.findIndex((s) => s.id === id);

		if (index === -1) return null;

		// check permissions
		if (!api.doesUserHavePermission(stocks[index].createdBy)) {
			return null; // User not authorized to update this stock
		}

		stocks[index] = {
			...stocks[index],
			...stockData,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.STOCKS_KEY, stocks);
		return stocks[index];
	}

	async updateQuantity(
		productId: string,
		quantity: number
	): Promise<Stock | null> {
		const stocks = this.getFromStorage<Stock>(this.STOCKS_KEY);
		const index = stocks.findIndex((s) => s.productId === productId);

		if (index === -1) return null;

		// check permissions
		if (!api.doesUserHavePermission(stocks[index].createdBy)) {
			return null; // User not authorized to update this stock
		}

		stocks[index] = {
			...stocks[index],
			quantity,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.STOCKS_KEY, stocks);
		return stocks[index];
	}

	async delete(id: string): Promise<boolean> {
		let stocks = this.getFromStorage<Stock>(this.STOCKS_KEY);
		const index = stocks.findIndex((s) => s.id === id);

		if (index === -1) return false;

		// check permissions
		if (!api.doesUserHavePermission(stocks[index].createdBy)) {
			return false; // User not authorized to delete this stock
		}

		stocks = stocks.filter((s) => s.id !== id);
		this.saveToStorage(this.STOCKS_KEY, stocks);

		return true;
	}

	async getLowStockItems(): Promise<Stock[]> {
		const stocks = this.getFromStorage<Stock>(this.STOCKS_KEY);
		return stocks.filter((s) => s.quantity <= s.minQuantity);
	}
}
