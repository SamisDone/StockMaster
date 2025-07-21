"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useAnalyticStore } from "@/stores/useAnalyticStore";
import { useProductStore } from "@/stores/useProductStore";

export default function TopProducts() {
	const { analytics } = useAnalyticStore();
	const { products } = useProductStore();

	const getProductName = (productId: string) => {
		const product = products.find((p) => p.id === productId);
		return product?.name || "Unknown Product";
	};

	// Safe calculation for top products percentage
	const maxProductQuantity =
		analytics.topProducts.length > 0
			? Math.max(...analytics.topProducts.map((p) => p.quantity || 0))
			: 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Selling Products</CardTitle>
				<CardDescription>
					Best performing products by quantity sold
				</CardDescription>
			</CardHeader>
			<CardContent>
				{analytics.topProducts && analytics.topProducts.length > 0 ? (
					<div className="space-y-4">
						{analytics.topProducts.slice(0, 5).map((item, index) => (
							<div
								key={item.productId}
								className="flex items-center justify-between"
							>
								<div className="flex items-center space-x-3">
									<Badge variant={index === 0 ? "default" : "secondary"}>
										#{index + 1}
									</Badge>
									<span className="font-medium">
										{getProductName(item.productId)}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<span className="text-sm text-muted-foreground">
										{item.quantity || 0} sold
									</span>
									<div className="w-20 bg-muted rounded-full h-2">
										<div
											className="bg-primary h-2 rounded-full"
											style={{
												width: `${Math.min(
													100,
													Math.max(
														0,
														((item.quantity || 0) / maxProductQuantity) * 100
													)
												)}%`,
											}}
										></div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8">
						<p className="text-muted-foreground">No sales data available</p>
						<p className="text-sm text-muted-foreground mt-2">
							Complete some sales orders to see top products
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
