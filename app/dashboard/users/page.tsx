"use client";

import {
	Edit,
	Eye,
	EyeOff,
	Plus,
	Search,
	Shield,
	Trash2,
	User,
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import type { User as UserType } from "@/lib/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";

export default function UsersPage() {
	const {
		users,
		isLoading,
		addUser,
		updateUser,
		deleteUser,
		updateUserWithPassword,
	} = useUserStore();
	const { user: currentUser } = useAuthStore();

	const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserType | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [createFormData, setCreateFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	useEffect(() => {
		const filtered = users.filter(
			(user) =>
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase())
		);

		// Sort to put admin first, then current user, then others
		const sorted = filtered.sort((a, b) => {
			if (a.role === "admin" && b.role !== "admin") return -1;
			if (b.role === "admin" && a.role !== "admin") return 1;
			if (currentUser && a.id === currentUser.id && b.id !== currentUser.id)
				return -1;
			if (currentUser && b.id === currentUser.id && a.id !== currentUser.id)
				return 1;
			return a.name.localeCompare(b.name);
		});

		setFilteredUsers(sorted);
	}, [users, searchTerm, currentUser]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (editingUser) {
				if (
					editingUser.role === "admin" &&
					currentUser?.role === "admin" &&
					editingUser.id === currentUser.id
				) {
					// Admin editing their own info - only name
					await updateUser(editingUser.id, { name: formData.name });
				} else {
					// Admin editing other users - all fields including password
					const updateData: any = {
						name: formData.name,
						email: formData.email,
					};
					if (formData.password) {
						updateData.password = formData.password;
					}
					await updateUserWithPassword(editingUser.id, updateData);
				}
			}

			setIsDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving user:", error);
		}
	};

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await addUser({
				name: createFormData.name,
				email: createFormData.email,
				password: createFormData.password,
				role: "user",
			});

			setIsCreateDialogOpen(false);
			resetCreateForm();
		} catch (error) {
			console.error("Error creating user:", error);
			alert(error instanceof Error ? error.message : "Error creating user");
		}
	};

	const handleEdit = (user: UserType) => {
		setEditingUser(user);
		setFormData({
			name: user.name,
			email: user.email,
			password: "",
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		const userToDelete = users.find((u) => u.id === id);

		if (userToDelete?.role === "admin") {
			alert("Cannot delete admin account");
			return;
		}

		if (!currentUser) {
			alert("You must be logged in to delete a user");
			return;
		}

		if (currentUser.id === id) {
			alert("You cannot delete your own account");
			return;
		}

		if (currentUser.role !== "admin") {
			alert("You do not have permission to delete users");
			return;
		}

		if (confirm("Are you sure you want to delete this user?")) {
			try {
				await deleteUser(id);
			} catch (error) {
				console.error("Error deleting user:", error);
			}
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			password: "",
		});
		setEditingUser(null);
	};

	const resetCreateForm = () => {
		setCreateFormData({
			name: "",
			email: "",
			password: "",
		});
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return <Shield className="h-4 w-4" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "admin":
				return "default" as const;
			default:
				return "outline" as const;
		}
	};

	const canEditUser = () => {
		if (!currentUser || currentUser.role !== "admin") return false;
		return true;
	};

	const canDeleteUser = (user: UserType) => {
		if (!currentUser || currentUser.role !== "admin") return false;
		if (currentUser.id === user.id) return false;
		if (user.role === "admin") return false;
		return true;
	};

	const isAdminEditingSelf = (user: UserType) => {
		return currentUser?.role === "admin" && currentUser.id === user.id;
	};

	if (isLoading) {
		return <PageLoader />;
	}

	const roleStats = users.reduce((acc, user) => {
		acc[user.role] = (acc[user.role] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">User Management</h1>
					<p className="text-muted-foreground">
						Manage user accounts and permissions
					</p>
				</div>
				{currentUser?.role === "admin" && (
					<Dialog
						open={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
					>
						<DialogTrigger asChild>
							<Button onClick={resetCreateForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add User
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Add New User</DialogTitle>
								<DialogDescription>Create a new user account</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleCreateSubmit}>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-4 items-center gap-4">
										<Label
											htmlFor="createName"
											className="text-right"
										>
											Name
										</Label>
										<Input
											id="createName"
											value={createFormData.name}
											onChange={(e) =>
												setCreateFormData({
													...createFormData,
													name: e.target.value,
												})
											}
											className="col-span-3"
											required
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label
											htmlFor="createEmail"
											className="text-right"
										>
											Email
										</Label>
										<Input
											id="createEmail"
											type="email"
											value={createFormData.email}
											onChange={(e) =>
												setCreateFormData({
													...createFormData,
													email: e.target.value,
												})
											}
											className="col-span-3"
											required
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label
											htmlFor="createPassword"
											className="text-right"
										>
											Password
										</Label>
										<div className="col-span-3 relative">
											<Input
												id="createPassword"
												type={showPassword ? "text" : "password"}
												value={createFormData.password}
												onChange={(e) =>
													setCreateFormData({
														...createFormData,
														password: e.target.value,
													})
												}
												required
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button type="submit">Create User</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				)}
			</div>

			{/* Edit User Dialog */}
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							{editingUser && isAdminEditingSelf(editingUser)
								? "Update your profile information"
								: "Update user information and credentials"}
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
							{editingUser && !isAdminEditingSelf(editingUser) && (
								<>
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
											htmlFor="password"
											className="text-right"
										>
											New Password
										</Label>
										<div className="col-span-3 relative">
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												value={formData.password}
												onChange={(e) =>
													setFormData({ ...formData, password: e.target.value })
												}
												placeholder="Leave blank to keep current password"
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
								</>
							)}
						</div>
						<DialogFooter>
							<Button type="submit">Update User</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* User Statistics */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{users.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Administrators
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<Shield className="h-5 w-5 text-primary" />
							<div className="text-2xl font-bold">{roleStats.admin || 0}</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<User className="h-5 w-5 text-primary" />
							<div className="text-2xl font-bold">{roleStats.user || 0}</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<div className="flex items-center space-x-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search users..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>System Users ({filteredUsers.length})</CardTitle>
					<CardDescription>
						Manage user accounts and their access levels
					</CardDescription>
				</CardHeader>
				<CardContent>
					{filteredUsers.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											<div className="flex items-center space-x-2">
												{getRoleIcon(user.role)}
												<span>{user.name}</span>
												{currentUser?.id === user.id && (
													<Badge
														variant="outline"
														className="text-xs"
													>
														You
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge variant={getRoleBadgeVariant(user.role)}>
												{user.role === "admin" ? "Administrator" : "User"}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{new Date(user.updatedAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												{canEditUser() && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(user)}
													>
														<Edit className="h-4 w-4" />
													</Button>
												)}
												{canDeleteUser(user) && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(user.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No users found</p>
							<p className="text-sm text-muted-foreground mt-2">
								{searchTerm
									? "Try adjusting your search"
									: "No users in the system"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
