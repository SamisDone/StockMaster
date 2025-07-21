import { api } from "../api";
import type { Supplier } from "../types";
import { BaseService } from "./base-service";

export class SupplierService extends BaseService {
	private readonly SUPPLIERS_KEY = "stockmaster_suppliers";

	async getAll(): Promise<Supplier[]> {
		return this.getFromStorage<Supplier>(this.SUPPLIERS_KEY);
	}

	async getById(id: string): Promise<Supplier | null> {
		const suppliers = this.getFromStorage<Supplier>(this.SUPPLIERS_KEY);
		return suppliers.find((s) => s.id === id) || null;
	}

	async create(
		supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt" | "createdBy">
	): Promise<Supplier> {
		const suppliers = this.getFromStorage<Supplier>(this.SUPPLIERS_KEY);

		const newSupplier: Supplier = {
			...supplierData,
			id: this.generateId(),
			createdAt: this.getCurrentTimestamp(),
			updatedAt: this.getCurrentTimestamp(),
			createdBy: (await api.auth.getCurrentUser())!.id,
		};

		suppliers.push(newSupplier);
		this.saveToStorage(this.SUPPLIERS_KEY, suppliers);
		return newSupplier;
	}

	async update(
		id: string,
		supplierData: Partial<Omit<Supplier, "id" | "createdAt">>
	): Promise<Supplier | null> {
		const suppliers = this.getFromStorage<Supplier>(this.SUPPLIERS_KEY);
		const index = suppliers.findIndex((s) => s.id === id);

		if (index === -1) return null;

		// check permissions
		if (!api.doesUserHavePermission(suppliers[index].createdBy)) {
			return null; // User not authorized to update this supplier
		}

		suppliers[index] = {
			...suppliers[index],
			...supplierData,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.SUPPLIERS_KEY, suppliers);
		return suppliers[index];
	}

	async delete(id: string): Promise<boolean> {
		const suppliers = this.getFromStorage<Supplier>(this.SUPPLIERS_KEY);
		const supplier = suppliers.find((s) => s.id === id);
		if (!supplier) return false;

		// check permissions
		if (!api.doesUserHavePermission(supplier.createdBy)) {
			return false; // User not authorized to delete this supplier
		}

		const filteredSuppliers = suppliers.filter((s) => s.id !== id);
		if (filteredSuppliers.length === suppliers.length) return false;

		this.saveToStorage(this.SUPPLIERS_KEY, filteredSuppliers);
		return true;
	}
}
