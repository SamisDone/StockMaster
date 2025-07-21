"use client";

import { Edit, Mail, Phone, Plus, Search, Trash2 } from "lucide-react";
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

import { api } from "@/lib/api";
import type { Supplier } from "@/lib/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSupplierStore } from "@/stores/useSuplierStore";

export default function SuppliersPage() {
	const doesUserHavePermission = useAuthStore(
		(state) => state.doesUserHavePermission
	);
	const { suppliers, addSupplier, updateSupplier, deleteSupplier, isLoading } =
		useSupplierStore();

	const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
	});

	useEffect(() => {
		const filtered = suppliers.filter(
			(supplier) =>
				supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredSuppliers(filtered);
	}, [suppliers, searchTerm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (editingSupplier) {
				updateSupplier(editingSupplier.id, formData);
			} else {
				addSupplier(formData);
			}

			setIsDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving supplier:", error);
		}
	};

	const handleEdit = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setFormData({
			name: supplier.name,
			email: supplier.email,
			phone: supplier.phone,
			address: supplier.address,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this supplier?")) {
			try {
				deleteSupplier(id);
			} catch (error) {
				console.error("Error deleting supplier:", error);
			}
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			phone: "",
			address: "",
		});
		setEditingSupplier(null);
	};

	if (isLoading) {
		return <PageLoader />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Suppliers</h1>
					<p className="text-muted-foreground">
						Manage your supplier relationships
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				>
					<DialogTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="h-4 w-4 mr-2" />
							Add Supplier
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingSupplier ? "Edit Supplier" : "Add New Supplier"}
							</DialogTitle>
							<DialogDescription>
								{editingSupplier
									? "Update supplier information"
									: "Add a new supplier to your network"}
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
										htmlFor="email"
										className="text-right"
									>
										Email
									</Label>
									<Input
										id="email"
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="phone"
										className="text-right"
									>
										Phone
									</Label>
									<Input
										id="phone"
										value={formData.phone}
										onChange={(e) =>
											setFormData({ ...formData, phone: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="address"
										className="text-right"
									>
										Address
									</Label>
									<Input
										id="address"
										value={formData.address}
										onChange={(e) =>
											setFormData({ ...formData, address: e.target.value })
										}
										className="col-span-3"
										required
									/>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">
									{editingSupplier ? "Update" : "Create"} Supplier
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
					placeholder="Search suppliers..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Suppliers Table */}
			<Card>
				<CardHeader>
					<CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
					<CardDescription>A list of all your suppliers</CardDescription>
				</CardHeader>

				<CardContent>
					{filteredSuppliers.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Address</TableHead>
									<TableHead>Created By</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredSuppliers.map((supplier) => (
									<TableRow key={supplier.id}>
										<TableCell className="font-medium">
											{supplier.name}
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span>{supplier.email}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<Phone className="h-4 w-4 text-muted-foreground" />
												<span>{supplier.phone}</span>
											</div>
										</TableCell>
										<TableCell>{supplier.address}</TableCell>
										<TableCell>
											{api.users.getById(supplier.createdBy)?.name || "Unknown"}
										</TableCell>
										<TableCell>
											{doesUserHavePermission(supplier.createdBy) && (
												<div className="flex items-center space-x-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(supplier)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(supplier.id)}
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
							<p className="text-muted-foreground">No suppliers found</p>
							<p className="text-sm text-muted-foreground mt-2">
								{searchTerm
									? "Try adjusting your search"
									: "Add your first supplier to get started"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
