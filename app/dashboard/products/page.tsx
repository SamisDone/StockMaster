"use client";

import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import PageLoader from "@/components/layout/page-loader";
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
import { Textarea } from "@/components/ui/textarea";

import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProductStore } from "@/stores/useProductStore";

export default function ProductsPage() {
	const doesUserHavePermission = useAuthStore(
		(state) => state.doesUserHavePermission
	);
	const { products, addProduct, deleteProduct, updateProduct, isLoading } =
		useProductStore();

	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		price: "",
		cost: "",
	});

	useEffect(() => {
		const filtered = products.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.category.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredProducts(filtered);
	}, [products, searchTerm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const productData = {
				name: formData.name,
				description: formData.description,
				category: formData.category,
				price: Number.parseFloat(formData.price),
				cost: Number.parseFloat(formData.cost),
			};

			if (editingProduct) {
				await updateProduct(editingProduct.id, productData);
			} else {
				addProduct(productData);
			}

			setIsDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving product:", error);
		}
	};

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			description: product.description,
			category: product.category,
			price: product.price.toString(),
			cost: product.cost.toString(),
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this product?")) {
			deleteProduct(id);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			category: "",
			price: "",
			cost: "",
		});
		setEditingProduct(null);
	};

	if (isLoading) {
		return <PageLoader />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Products</h1>
					<p className="text-muted-foreground">Manage your product inventory</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				>
					<DialogTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="h-4 w-4 mr-2" />
							Add Product
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingProduct ? "Edit Product" : "Add New Product"}
							</DialogTitle>
							<DialogDescription>
								{editingProduct
									? "Update product information"
									: "Add a new product to your inventory"}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="name"
										className="text-right"
									>
										Name
									</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="category"
										className="text-right"
									>
										Category
									</Label>
									<Input
										id="category"
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="price"
										className="text-right"
									>
										Price
									</Label>
									<Input
										id="price"
										type="number"
										step="0.01"
										value={formData.price}
										onChange={(e) =>
											setFormData({ ...formData, price: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="cost"
										className="text-right"
									>
										Cost
									</Label>
									<Input
										id="cost"
										type="number"
										step="0.01"
										value={formData.cost}
										onChange={(e) =>
											setFormData({ ...formData, cost: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="description"
										className="text-right"
									>
										Description
									</Label>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className="col-span-3"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">
									{editingProduct ? "Update" : "Create"} Product
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
					placeholder="Search products..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Products Table */}
			<Card>
				<CardHeader>
					<CardTitle>Products ({filteredProducts.length})</CardTitle>
					<CardDescription>
						A list of all products in your inventory
					</CardDescription>
				</CardHeader>

				<CardContent>
					{filteredProducts.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Created By</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Cost</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredProducts.map((product) => (
									<TableRow key={product.id}>
										<TableCell className="font-medium">
											{product.name}
										</TableCell>
										<TableCell>{product.category}</TableCell>
										<TableCell>
											{api.users.getById(product.createdBy)?.name || "Unknown"}
										</TableCell>
										<TableCell>${product.price.toFixed(2)}</TableCell>
										<TableCell>${product.cost.toFixed(2)}</TableCell>
										<TableCell>
											{doesUserHavePermission(product.createdBy) && (
												<div className="flex items-center space-x-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(product)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(product.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No products found</p>
							<p className="text-sm text-muted-foreground mt-2">
								{searchTerm
									? "Try adjusting your search"
									: "Add your first product to get started"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
