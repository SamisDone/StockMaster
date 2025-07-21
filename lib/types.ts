export interface User {
	id: string;
	email: string;
	name: string;
	role: "admin" | "user";
	createdAt: string;
	updatedAt: string;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	category: string;
	price: number;
	cost: number;
	createdAt: string;
	updatedAt: string;
	createdBy: User["id"];
}

export interface Supplier {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	createdAt: string;
	updatedAt: string;
	createdBy: User["id"];
}

export interface Stock {
	id: string;
	productId: string;
	quantity: number;
	minQuantity: number;
	maxQuantity: number;
	updatedAt: string;
	createdAt: string;
	createdBy: User["id"];
}

export interface Order {
	id: string;
	type: "purchase" | "sale";
	supplierId?: string;
	customerName?: string;
	customerEmail?: string;
	items: OrderItem[];
	status: "pending" | "processing" | "completed" | "cancelled";
	total: number;
	createdAt: string;
	updatedAt: string;
	createdBy: User["id"];
}

export interface OrderItem {
	productId: string;
	quantity: number;
}

export interface Review {
	id: string;
	supplierId: string;
	reviewerName: string;
	rating: number;
	comment: string;
	createdAt: string;
	updatedAt: string;
	createdBy: User["id"];
}

export interface AnalyticsData {
	totalProducts: number;
	totalSuppliers: number;
	totalOrders: number;
	totalRevenue: number;
	lowStockItems: number;
	recentOrders: Order[];
	topProducts: { productId: string; quantity: number }[];
	monthlyRevenue: { month: string; revenue: number }[];
}
