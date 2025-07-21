import { api } from "../api";
import type { Review } from "../types";
import { BaseService } from "./base-service";

export class ReviewService extends BaseService {
	private readonly REVIEWS_KEY = "stockmaster_reviews";

	async getAll(): Promise<Review[]> {
		return this.getFromStorage<Review>(this.REVIEWS_KEY);
	}

	async getBySupplierId(supplierId: string): Promise<Review[]> {
		const reviews = this.getFromStorage<Review>(this.REVIEWS_KEY);
		return reviews.filter((r) => r.supplierId === supplierId);
	}

	async create(
		reviewData: Omit<Review, "id" | "createdAt" | "updatedAt" | "createdBy">
	): Promise<Review> {
		const reviews = this.getFromStorage<Review>(this.REVIEWS_KEY);

		const newReview: Review = {
			...reviewData,
			id: this.generateId(),
			createdAt: this.getCurrentTimestamp(),
			updatedAt: this.getCurrentTimestamp(),
			createdBy: (await api.auth.getCurrentUser())?.id || "Unknown",
		};

		reviews.push(newReview);
		this.saveToStorage(this.REVIEWS_KEY, reviews);
		return newReview;
	}

	async update(
		id: string,
		updates: Partial<
			Omit<Review, "id" | "createdAt" | "updatedAt" | "createdBy">
		>
	): Promise<Review | null> {
		const reviews = this.getFromStorage<Review>(this.REVIEWS_KEY);
		const index = reviews.findIndex((r) => r.id === id);

		if (index === -1) return null;

		// Check permissions
		if (!api.doesUserHavePermission(reviews[index].createdBy)) {
			return null; // User not authorized to update this review
		}

		reviews[index] = {
			...reviews[index],
			...updates,
			updatedAt: this.getCurrentTimestamp(),
		};
		this.saveToStorage(this.REVIEWS_KEY, reviews);
		return reviews[index];
	}

	async delete(id: string): Promise<boolean> {
		const reviews = this.getFromStorage<Review>(this.REVIEWS_KEY);
		const filteredReviews = reviews.filter((r) => r.id !== id);

		if (filteredReviews.length === reviews.length) return false;

		this.saveToStorage(this.REVIEWS_KEY, filteredReviews);
		return true;
	}
}
