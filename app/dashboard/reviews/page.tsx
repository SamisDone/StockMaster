"use client";

import { Edit, Plus, Search, Star, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import type { Review } from "@/lib/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useReviewStore } from "@/stores/useReviewStore";
import { useSupplierStore } from "@/stores/useSuplierStore";
import { useUserStore } from "@/stores/useUserStore";

export default function ReviewsPage() {
	const { suppliers } = useSupplierStore();
	const { user, doesUserHavePermission } = useAuthStore();
	const { reviews, isLoading, addReview, updateReview, deleteReview } =
		useReviewStore();
	const { getUserById } = useUserStore();

	const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [editingReview, setEditingReview] = useState<Review | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		supplierId: "",
		rating: "5",
		comment: "",
	});

	useEffect(() => {
		const filtered = reviews.filter((review) => {
			const supplier = getSupplier(review.supplierId);
			return (
				review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
				supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		});
		setFilteredReviews(filtered);
	}, [reviews, searchTerm, suppliers]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) return;

		try {
			const reviewData = {
				supplierId: formData.supplierId,
				reviewerName: user.name,
				rating: Number.parseInt(formData.rating),
				comment: formData.comment,
			};

			if (editingReview) {
				updateReview(editingReview.id, reviewData);
			} else {
				addReview(reviewData);
			}
			setIsDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving review:", error);
		}
	};

	const handleEdit = (review: Review) => {
		if (!doesUserHavePermission(review.createdBy)) {
			return;
		}

		setEditingReview(review);
		setFormData({
			supplierId: review.supplierId,
			rating: review.rating.toString(),
			comment: review.comment,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this review?")) {
			try {
				deleteReview(id);
			} catch (error) {
				console.error("Error deleting review:", error);
			}
		}
	};

	const resetForm = () => {
		setFormData({
			supplierId: "",
			rating: "5",
			comment: "",
		});
	};

	const getSupplier = (supplierId: string) => {
		return suppliers.find((s) => s.id === supplierId);
	};

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				className={`h-4 w-4 ${
					i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
				}`}
			/>
		));
	};

	const getAverageRating = () => {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return (sum / reviews.length).toFixed(1);
	};

	const getRatingDistribution = () => {
		const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach((review) => {
			distribution[review.rating as keyof typeof distribution]++;
		});
		return distribution;
	};

	if (isLoading) {
		return <PageLoader />;
	}

	const ratingDistribution = getRatingDistribution();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Supplier Reviews</h1>
					<p className="text-muted-foreground">
						Rate and review your suppliers
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={(open) => {
						setIsDialogOpen(open);
						setEditingReview(null);
						resetForm();
					}}
				>
					<DialogTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="h-4 w-4 mr-2" />
							Add Review
						</Button>
					</DialogTrigger>

					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingReview ? "Update" : "Add"} Supplier Review
							</DialogTitle>

							<DialogDescription>
								{editingReview
									? "Update your review for this supplier"
									: "Rate and review a supplier's performance"}
							</DialogDescription>
						</DialogHeader>

						<form onSubmit={handleSubmit}>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="supplier"
										className="text-right"
									>
										Supplier
									</Label>

									<Select
										value={formData.supplierId}
										onValueChange={(value) =>
											setFormData({ ...formData, supplierId: value })
										}
									>
										<SelectTrigger className="col-span-3">
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

								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="rating"
										className="text-right"
									>
										Rating
									</Label>
									<Select
										value={formData.rating}
										onValueChange={(value) =>
											setFormData({ ...formData, rating: value })
										}
									>
										<SelectTrigger className="col-span-3">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="5">5 Stars - Excellent</SelectItem>
											<SelectItem value="4">4 Stars - Good</SelectItem>
											<SelectItem value="3">3 Stars - Average</SelectItem>
											<SelectItem value="2">2 Stars - Poor</SelectItem>
											<SelectItem value="1">1 Star - Terrible</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label
										htmlFor="comment"
										className="text-right"
									>
										Comment
									</Label>
									<Textarea
										id="comment"
										value={formData.comment}
										onChange={(e) =>
											setFormData({ ...formData, comment: e.target.value })
										}
										className="col-span-3"
										placeholder="Your feedback about this supplier..."
										required
									/>
								</div>
							</div>

							<DialogFooter>
								<Button type="submit">
									{editingReview ? "Update" : "Add"} Review
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Review Statistics */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{reviews.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Average Rating
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<div className="text-2xl font-bold">{getAverageRating()}</div>
							<div className="flex">
								{renderStars(
									Math.round(Number.parseFloat(getAverageRating().toString()))
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Rating Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-1">
							{Object.entries(ratingDistribution)
								.reverse()
								.map(([rating, count]) => (
									<div
										key={rating}
										className="flex items-center space-x-2 text-sm"
									>
										<span className="w-4">{rating}</span>
										<Star className="h-3 w-3 text-yellow-400 fill-current" />
										<div className="flex-1 bg-muted rounded-full h-2">
											<div
												className="bg-primary h-2 rounded-full"
												style={{
													width:
														reviews.length > 0
															? `${(count / reviews.length) * 100}%`
															: "0%",
												}}
											></div>
										</div>
										<span className="w-8 text-right">{count}</span>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<div className="flex items-center space-x-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search reviews..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{/* Reviews Table */}
			<Card>
				<CardHeader>
					<CardTitle>Supplier Reviews ({filteredReviews.length})</CardTitle>
					<CardDescription>All supplier ratings and feedback</CardDescription>
				</CardHeader>

				<CardContent>
					{filteredReviews.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Supplier</TableHead>
									<TableHead>Reviewer</TableHead>
									<TableHead>Rating</TableHead>
									<TableHead>Comment</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Created By</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredReviews.map((review) => {
									const supplier = getSupplier(review.supplierId);

									return (
										<TableRow key={review.id}>
											<TableCell className="font-medium">
												{supplier?.name || "Unknown Supplier"}
											</TableCell>
											<TableCell>{review.reviewerName}</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													<div className="flex">
														{renderStars(review.rating)}
													</div>
													<Badge variant="outline">{review.rating}/5</Badge>
												</div>
											</TableCell>
											<TableCell className="max-w-xs">
												<p
													className="truncate"
													title={review.comment}
												>
													{review.comment}
												</p>
											</TableCell>
											<TableCell>
												{new Date(review.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{getUserById(review.createdBy)?.name || "Unknown"}
											</TableCell>
											<TableCell>
												{doesUserHavePermission(review.createdBy) && (
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(review)}
														>
															<Edit className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(review.id)}
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
							<p className="text-muted-foreground">No reviews found</p>
							<p className="text-sm text-muted-foreground mt-2">
								{searchTerm
									? "Try adjusting your search"
									: "Add your first supplier review to get started"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
