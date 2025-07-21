"use client";

import {
	Edit,
	Eye,
	Package,
	Plus,
	Search,
	ShoppingCart,
	Trash,
} from "lucide-react";
import { useEffect, useState } from "react";

import PageLoader from "@/components/layout/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import type { Order, OrderItem } from "@/lib/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useProductStore } from "@/stores/useProductStore";
import { useSupplierStore } from "@/stores/useSuplierStore";
import { useUserStore } from "@/stores/useUserStore";

export default function OrdersPage() {
	const { products } = useProductStore();
	const { orders, isLoading, updateOrder, addOrder, deleteOrder } =
		useOrderStore();
	const { suppliers } = useSupplierStore();
	const { doesUserHavePermission } = useAuthStore();
	const { getUserById } = useUserStore();

	const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingOrder, setEditingOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
	const [formData, setFormData] = useState({
		type: "purchase" as "purchase" | "sale",
		supplierId: "",
		customerName: "",
		customerEmail: "",
		status: "pending" as "pending" | "processing" | "completed" | "cancelled",
		items: [] as { productId: string; quantity: number }[],
	});

	useEffect(() => {
		const filtered = orders.filter(
			(order) =>
				order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredOrders(filtered);
	}, [orders, searchTerm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const total = formData.items.reduce((sum, item) => {
				const product = products.find((p) => p.id === item.productId);
				if (!product) return sum; // Skip if product not found
				return sum + item.quantity * (product.price || 0);
			}, 0);

			const orderData = {
				type: formData.type,
				supplierId:
					formData.type === "purchase" ? formData.supplierId : undefined,
				customerName:
					formData.type === "sale" ? formData.customerName : undefined,
				customerEmail:
					formData.type === "sale" ? formData.customerEmail : undefined,
				items: formData.items,
				status: formData.status,
				total,
			};

			if (editingOrder) {
				await updateOrder(editingOrder.id, orderData);
			} else {
				await addOrder(orderData);
			}

			setIsDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving order:", error);
		}
	};

	const handleView = (order: Order) => {
		setViewingOrder(order);
		setIsViewDialogOpen(true);
	};

	const handleEdit = (order: Order) => {
		if (!doesUserHavePermission(order.createdBy)) {
			return;
		}

		setEditingOrder(order);
		setFormData({
			type: order.type,
			supplierId: order.supplierId || "",
			customerName: order.customerName || "",
			customerEmail: order.customerEmail || "",
			status: order.status,
			items: order.items,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (order: Order) => {
		if (!doesUserHavePermission(order.createdBy)) {
			return;
		}

		if (confirm("Are you sure you want to delete this order?")) {
			deleteOrder(order.id);
		}
	};

	const resetForm = () => {
		setFormData({
			type: "purchase",
			supplierId: "",
			customerName: "",
			customerEmail: "",
			status: "pending",
			items: [],
		});
		setEditingOrder(null);
	};

	const addItem = () => {
		setFormData({
			...formData,
			items: [...formData.items, { productId: "", quantity: 1 }],
		});
	};

	const updateItem = (
		index: number,
		field: keyof OrderItem,
		value: string | number
	) => {
		const updatedItems = [...formData.items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		setFormData({ ...formData, items: updatedItems });
	};

	const removeItem = (index: number) => {
		const updatedItems = formData.items.filter((_, i) => i !== index);
		setFormData({ ...formData, items: updatedItems });
	};

	const getSupplierName = (supplierId: string) => {
		const supplier = suppliers.find((s) => s.id === supplierId);
		return supplier?.name || "Unknown Supplier";
	};

	const getProductName = (productId: string) => {
		const product = products.find((p) => p.id === productId);
		return product?.name || "Unknown Product";
	};

	if (isLoading) {
		return <PageLoader />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Orders</h1>
					<p className="text-muted-foreground">
						Manage purchase and sales orders
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				>
					<DialogTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="h-4 w-4 mr-2" />
							Create Order
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingOrder ? "Edit Order" : "Create New Order"}
							</DialogTitle>

							<DialogDescription>
								{editingOrder
									? "Update order information"
									: "Create a new purchase or sales order"}
							</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							<div className="grid gap-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="type">Order Type</Label>
										<Select
											value={formData.type}
											onValueChange={(value: "purchase" | "sale") =>
												setFormData({ ...formData, type: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="purchase">Purchase Order</SelectItem>
												<SelectItem value="sale">Sales Order</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="status">Status</Label>
										<Select
											value={formData.status}
											onValueChange={(
												value:
													| "pending"
													| "processing"
													| "completed"
													| "cancelled"
											) => setFormData({ ...formData, status: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="processing">Processing</SelectItem>
												<SelectItem value="completed">Completed</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{formData.type === "purchase" && (
									<div className="space-y-2">
										<Label htmlFor="supplier">Supplier</Label>
										<Select
											value={formData.supplierId}
											onValueChange={(value) =>
												setFormData({ ...formData, supplierId: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select supplier" />
											</SelectTrigger>
											<SelectContent>
												{suppliers.map((supplier) => (
													<SelectItem
														key={supplier.id}
														value={supplier.id}
													>
														{supplier.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{formData.type === "sale" && (
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="customerName">Customer Name</Label>
											<Input
												id="customerName"
												value={formData.customerName}
												onChange={(e) =>
													setFormData({
														...formData,
														customerName: e.target.value,
													})
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="customerEmail">Customer Email</Label>
											<Input
												id="customerEmail"
												type="email"
												value={formData.customerEmail}
												onChange={(e) =>
													setFormData({
														...formData,
														customerEmail: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
								)}

								<div className="space-y-2">
									<Label className="text-sm font-medium">Order Items</Label>
									<div className="space-y-2 max-h-60 overflow-y-auto">
										{formData.items.map((item, index) => (
											<div
												key={index}
												className="flex items-center space-x-2 p-2 border rounded"
											>
												<Select
													value={item.productId}
													onValueChange={(value) =>
														updateItem(index, "productId", value)
													}
												>
													<SelectTrigger className="flex-1">
														<SelectValue placeholder="Select product" />
													</SelectTrigger>

													<SelectContent>
														{products.map((product) => (
															<SelectItem
																key={product.id}
																value={product.id}
															>
																{product.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<Input
													type="number"
													placeholder="Qty"
													value={item.quantity}
													onChange={(e) =>
														updateItem(
															index,
															"quantity",
															Number.parseInt(e.target.value) || 0
														)
													}
													className="w-20"
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => removeItem(index)}
												>
													Remove
												</Button>
											</div>
										))}
										<Button
											type="button"
											variant="outline"
											onClick={addItem}
											className="w-full bg-transparent"
										>
											Add Item
										</Button>
									</div>
								</div>
							</div>

							<DialogFooter>
								<Button type="submit">
									{editingOrder ? "Update" : "Create"} Order
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			<div className="flex items-center space-x-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search orders..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Orders Table */}
			<Card>
				<CardHeader>
					<CardTitle>Orders ({filteredOrders.length})</CardTitle>
					<CardDescription>All purchase and sales orders</CardDescription>
				</CardHeader>

				<CardContent>
					{filteredOrders.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order ID</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Customer/Supplier</TableHead>
									<TableHead>Items</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Created By</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredOrders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-medium">
											{order.id.slice(0, 8)}...
										</TableCell>
										<TableCell>
											<Badge
												variant={
													order.type === "sale" ? "default" : "secondary"
												}
											>
												<div className="flex items-center space-x-1">
													{order.type === "sale" ? (
														<ShoppingCart className="h-3 w-3" />
													) : (
														<Package className="h-3 w-3" />
													)}
													<span>{order.type}</span>
												</div>
											</Badge>
										</TableCell>
										<TableCell>
											{order.type === "sale"
												? order.customerName
												: getSupplierName(order.supplierId || "")}
										</TableCell>
										<TableCell>{order.items.length} items</TableCell>
										<TableCell>${order.total.toLocaleString()}</TableCell>
										<TableCell>
											<Badge
												variant={
													order.status === "completed"
														? "default"
														: order.status === "processing"
														? "secondary"
														: order.status === "pending"
														? "outline"
														: "destructive"
												}
											>
												{order.status}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(order.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{getUserById(order.createdBy)?.name || "Unknown"}
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleView(order)}
												>
													<Eye className="h-4 w-4" />
												</Button>
												{doesUserHavePermission(order.createdBy) && (
													<>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(order)}
														>
															<Edit className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(order)}
														>
															<Trash className="h-4 w-4" />
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No orders found</p>
							<p className="text-sm text-muted-foreground mt-2">
								{searchTerm
									? "Try adjusting your search"
									: "Create your first order to get started"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Order Dialog */}
			<Dialog
				open={isViewDialogOpen}
				onOpenChange={setIsViewDialogOpen}
			>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Order Details</DialogTitle>

						<DialogDescription>
							View complete order information
						</DialogDescription>
					</DialogHeader>

					{viewingOrder && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium">Order ID</Label>
									<p className="text-sm text-muted-foreground">
										{viewingOrder.id}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Type</Label>
									<p className="text-sm text-muted-foreground capitalize">
										{viewingOrder.type}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Status</Label>
									<p className="text-sm text-muted-foreground capitalize">
										{viewingOrder.status}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Total</Label>
									<p className="text-sm text-muted-foreground">
										${viewingOrder.total.toLocaleString()}
									</p>
								</div>
							</div>

							{viewingOrder.type === "sale" ? (
								<div>
									<Label className="text-sm font-medium">Customer</Label>
									<p className="text-sm text-muted-foreground">
										{viewingOrder.customerName} ({viewingOrder.customerEmail})
									</p>
								</div>
							) : (
								<div>
									<Label className="text-sm font-medium">Supplier</Label>
									<p className="text-sm text-muted-foreground">
										{getSupplierName(viewingOrder.supplierId || "")}
									</p>
								</div>
							)}

							<div>
								<Label className="text-sm font-medium">Items</Label>
								<div className="mt-2 space-y-2">
									{viewingOrder.items.map((item, index) => (
										<div
											key={index}
											className="flex justify-between items-center p-2 bg-muted rounded"
										>
											<span className="text-sm">
												{getProductName(item.productId)}
											</span>
											<span className="text-sm">
												{item.quantity} × $
												{(
													products.find((p) => p.id === item.productId)
														?.price ?? 0
												).toFixed(2)}{" "}
												= $
												{(
													item.quantity *
													(products.find((p) => p.id === item.productId)
														?.price ?? 0)
												).toFixed(2)}
											</span>
										</div>
									))}
								</div>
							</div>

							<div className="text-right">
								<Label className="text-sm font-medium">Created</Label>
								<p className="text-sm text-muted-foreground">
									{new Date(viewingOrder.createdAt).toLocaleString()}
								</p>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
