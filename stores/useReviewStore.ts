import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import { Review } from "@/lib/types";

interface ReviewStore {
	reviews: Review[];
	isLoading: boolean;
	fetchReviews: () => Promise<void>;
	addReview: (
		review: Omit<Review, "id" | "createdAt" | "updatedAt" | "createdBy">
	) => Promise<void>;
	updateReview: (id: string, updates: Partial<Review>) => Promise<void>;
	deleteReview: (id: string) => Promise<void>;
}

export const useReviewStore = create<ReviewStore>()(
	persist(
		(set) => ({
			reviews: [],
			isLoading: true,

			fetchReviews: async () => {
				try {
					const reviewsData = await api.reviews.getAll();
					set({ reviews: reviewsData, isLoading: false });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch reviews";
					toast.error(message);
					console.error("Error fetching reviews:", message);
				}
			},

			addReview: async (reviewData) => {
				try {
					const newReview = await api.reviews.create(reviewData);
					set((state) => ({
						reviews: [...state.reviews, newReview],
					}));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add review";
					toast.error(message);
					console.error("Error adding review:", message);
				}
			},

			updateReview: async (id, updates) => {
				try {
					const updatedReview = await api.reviews.update(id, updates);
					if (updatedReview) {
						set((state) => ({
							reviews: state.reviews.map((o) =>
								o.id === id ? updatedReview : o
							),
						}));
					} else {
						const message = "Review not found or unauthorized";
						toast.error(message);
						console.error("Error updating review:", message);
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to update review";
					toast.error(message);
					console.error("Error updating review:", message);
				}
			},

			deleteReview: async (id) => {
				try {
					const success = await api.reviews.delete(id);
					if (success) {
						set((state) => ({
							reviews: state.reviews.filter((o) => o.id !== id),
						}));
					} else {
						throw new Error("Review not found or unauthorized");
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to delete review";
					toast.error(message);
					console.error("Error deleting review:", message);
				}
			},
		}),
		{
			name: "review-storage", // localStorage key
		}
	)
);
