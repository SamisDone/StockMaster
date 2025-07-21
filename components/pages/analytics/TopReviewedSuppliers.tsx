"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Pie,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";


import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useReviewStore } from "@/stores/useReviewStore";
import { useSupplierStore } from "@/stores/useSuplierStore";
import { Donut, PieChart } from "lucide-react";

export default function TopReviewedSuppliers() {
	const { suppliers } = useSupplierStore();
	const { reviews } = useReviewStore();

	const getSupplierName = (supplierId: string) => {
		const supplier = suppliers.find((s) => s.id === supplierId);
		return supplier?.name || "Unknown Supplier";
	};

	// Top reviewed suppliers with proper validation
	const supplierReviews = reviews.reduce((acc, review) => {
		if (!review.supplierId || !review.rating || isNaN(review.rating))
			return acc;

		const supplier = getSupplierName(review.supplierId);
		if (!acc[supplier]) {
			acc[supplier] = { total: 0, count: 0 };
		}
		acc[supplier].total += review.rating;
		acc[supplier].count += 1;
		return acc;
	}, {} as Record<string, { total: number; count: number }>);

	const topReviewedSuppliers = Object.entries(supplierReviews)
		.map(([supplier, data]) => ({
			supplier:
				supplier.length > 15 ? supplier.substring(0, 15) + "..." : supplier,
			averageRating: Math.round((data.total / data.count) * 10) / 10, // Round to 1 decimal
			reviewCount: data.count,
		}))
		.filter((item) => !isNaN(item.averageRating) && item.averageRating > 0)
		.sort((a, b) => b.averageRating - a.averageRating)
		.slice(0, 5);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Reviewed Suppliers</CardTitle>
				<CardDescription>
					Suppliers with highest average ratings
				</CardDescription>
			</CardHeader>
			<CardContent>
				{topReviewedSuppliers.length > 0 ? (
					<ResponsiveContainer
						width="100%"
						height={300}
					>
						<BarChart data={topReviewedSuppliers}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="supplier"
								angle={-45}
								textAnchor="end"
								height={80}
							/>
							<YAxis domain={[0, 5]} />
							<Tooltip formatter={(value) => [`${value}/5`, "Rating"]} />
							<Bar
								dataKey="averageRating"
								fill={`hsl(var(--chart-2))`}
							/>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						No supplier reviews available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
