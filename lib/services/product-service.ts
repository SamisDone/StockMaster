import { api } from "../api";
import type { Product } from "../types";
import { BaseService } from "./base-service";

export class ProductService extends BaseService {
	private readonly PRODUCTS_KEY = "stockmaster_products";

	async getAll(): Promise<Product[]> {
		return this.getFromStorage<Product>(this.PRODUCTS_KEY);
	}

	async getById(id: string): Promise<Product | null> {
		const products = this.getFromStorage<Product>(this.PRODUCTS_KEY);
		return products.find((p) => p.id === id) || null;
	}

	async create(
		productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">
	): Promise<Product> {
		const products = this.getFromStorage<Product>(this.PRODUCTS_KEY);

		const newProduct: Product = {
			...productData,
			id: this.generateId(),
			createdAt: this.getCurrentTimestamp(),
			updatedAt: this.getCurrentTimestamp(),
			createdBy: (await api.auth.getCurrentUser())!.id,
		};

		products.push(newProduct);
		this.saveToStorage(this.PRODUCTS_KEY, products);
		return newProduct;
	}

	async update(
		id: string,
		productData: Partial<Omit<Product, "id" | "createdAt">>
	): Promise<Product | null> {
		const products = this.getFromStorage<Product>(this.PRODUCTS_KEY);
		const index = products.findIndex((p) => p.id === id);

		if (index === -1) return null;

		// check permissions
		if (!api.doesUserHavePermission(products[index].createdBy)) {
			return null; // User not authorized to update this product
		}

		products[index] = {
			...products[index],
			...productData,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.PRODUCTS_KEY, products);
		return products[index];
	}

	async delete(id: string): Promise<boolean> {
		const products = this.getFromStorage<Product>(this.PRODUCTS_KEY);
		const product = products.find((p) => p.id === id);
		if (!product) return false;

		// check permissions
		if (!api.doesUserHavePermission(product.createdBy)) {
			return false; // User not authorized to delete this product
		}

		const filteredProducts = products.filter((p) => p.id !== id);
		if (filteredProducts.length === products.length) return false;

		this.saveToStorage(this.PRODUCTS_KEY, filteredProducts);
		return true;
	}
}
