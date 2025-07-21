"use client";

import {
	AlertTriangle,
	Edit,
	Package,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import PageLoader from "@/components/layout/page-loader";
import type { Stock } from "@/lib/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductStore";
import { useStockStore } from "@/stores/useStockStore";
import { useUserStore } from "@/stores/useUserStore";

export default function StocksPage() {
	const { products } = useProductStore();
	const { stocks, isLoading, updateStock, addStock, deleteStock } =
		useStockStore();
	const { doesUserHavePermission } = useAuthStore();
	const { getUserById } = useUserStore();

	const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingStock, setEditingStock] = useState<Stock | null>(null);
	const [formData, setFormData] = useState({
		productId: "",
		quantity: "",
		minQuantity: "",
		maxQuantity: "",
	});

	useEffect(() => {
		const filtered = stocks.filter((stock) => {
			const product = getProduct(stock.productId);
			return product?.name.toLowerCase().includes(searchTerm.toLowerCase());
		});
		setFilteredStocks(filtered);
	}, [stocks, searchTerm, products]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const stockData = {
				productId: formData.productId,
				quantity: Number.parseInt(formData.quantity),
				minQuantity: Number.parseInt(formData.minQuantity),
				maxQuantity: Number.parseInt(formData.maxQuantity),
			};

			if (editingStock) {
				await updateStock(editingStock.id, stockData);
			} else {
				await addStock(stockData);
			}

			setIsDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving stock:", error);
		}
	};

	const handleEdit = (stock: Stock) => {
		setEditingStock(stock);
		setFormData({
			productId: stock.productId,
			quantity: stock.quantity.toString(),
			minQuantity: stock.minQuantity.toString(),
			maxQuantity: stock.maxQuantity.toString(),
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this stock?")) {
			deleteStock(id);
		}
	};

	const resetForm = () => {
		setFormData({
			productId: "",
			quantity: "",
			minQuantity: "",
			maxQuantity: "",
		});
		setEditingStock(null);
	};

	const getProduct = (productId: string) => {
		return products.find((p) => p.id === productId);
	};

	const getStockStatus = (stock: Stock) => {
		if (stock.quantity <= stock.minQuantity) {
			return { status: "Low Stock", variant: "destructive" as const };
		} else if (stock.quantity >= stock.maxQuantity) {
			return { status: "Overstock", variant: "secondary" as const };
		} else {
			return { status: "Normal", variant: "default" as const };
		}
	};

	const availableProducts = products.filter(
		(product) =>
			!stocks.some((stock) => stock.productId === product.id) ||
			(editingStock && editingStock.productId === product.id)
	);

	if (isLoading) {
		return <PageLoader />;
	}

	const lowStockCount = stocks.filter(
		(s) => s.quantity <= s.minQuantity
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Stock Management</h1>
					<p className="text-muted-foreground">
						Monitor and manage your inventory levels
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				>
					<DialogTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="h-4 w-4 mr-2" />
							Add Stock Entry
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingStock ? "Edit Stock" : "Add New Stock Entry"}
							</DialogTitle>
							<DialogDescription>
								{editingStock
									? "Update stock information"
									: "Add stock tracking for a product"}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="product"
										className="text-right"
									>
										Product
									</Label>
									<select
										id="product"
										value={formData.productId}
										onChange={(e) =>
											setFormData({ ...formData, productId: e.target.value })
										}
										className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										required
									>
										<option value="">Select a product</option>
										{availableProducts.map((product) => (
											<option
												key={product.id}
												value={product.id}
											>
												{product.name}
											</option>
										))}
									</select>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="quantity"
										className="text-right"
									>
										Quantity
									</Label>
									<Input
										id="quantity"
										type="number"
										value={formData.quantity}
										onChange={(e) =>
											setFormData({ ...formData, quantity: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="minQuantity"
										className="text-right"
									>
										Min Quantity
									</Label>
									<Input
										id="minQuantity"
										type="number"
										value={formData.minQuantity}
										onChange={(e) =>
											setFormData({ ...formData, minQuantity: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="maxQuantity"
										className="text-right"
									>
										Max Quantity
									</Label>
									<Input
										id="maxQuantity"
										type="number"
										value={formData.maxQuantity}
										onChange={(e) =>
											setFormData({ ...formData, maxQuantity: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">
									{editingStock ? "Update" : "Create"} Stock Entry
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stock Alert */}
			{lowStockCount > 0 && (
				<Card className="border-orange-200 bg-orange-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-orange-800">
							<AlertTriangle className="h-5 w-5" />
							Low Stock Alert
						</CardTitle>
						<CardDescription className="text-orange-700">
							{lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on
							stock
						</CardDescription>
					</CardHeader>
				</Card>
			)}

			{/* Search */}
			<div className="flex items-center space-x-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search stocks..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Stocks Table */}
			<Card>
				<CardHeader>
					<CardTitle>Stock Levels ({filteredStocks.length})</CardTitle>
					<CardDescription>
						Current inventory levels for all products
					</CardDescription>
				</CardHeader>

				<CardContent>
					{filteredStocks.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product</TableHead>
									<TableHead>Current Stock</TableHead>
									<TableHead>Min/Max</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead>Created By</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredStocks.map((stock) => {
									const product = getProduct(stock.productId);
									const stockStatus = getStockStatus(stock);

									return (
										<TableRow key={stock.id}>
											<TableCell className="font-medium">
												<div className="flex items-center space-x-2">
													<Package className="h-4 w-4 text-muted-foreground" />
													<span>{product?.name || "Unknown Product"}</span>
												</div>
											</TableCell>
											<TableCell>
												<span className="font-semibold">{stock.quantity}</span>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{stock.minQuantity} / {stock.maxQuantity}
												</span>
											</TableCell>
											<TableCell>
												<Badge variant={stockStatus.variant}>
													{stockStatus.status}
												</Badge>
											</TableCell>
											<TableCell>
												{new Date(stock.updatedAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{getUserById(stock.createdBy)?.name || "Unknown"}
											</TableCell>
											<TableCell>
												{doesUserHavePermission(stock.createdBy) && (
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(stock)}
														>
															<Edit className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(stock.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No stock entries found</p>
							<p className="text-sm text-muted-foreground mt-2">
								{searchTerm
									? "Try adjusting your search"
									: "Add your first stock entry to get started"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
