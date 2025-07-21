"use client";

import {
	AlertTriangle,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingDown,
	TrendingUp,
} from "lucide-react";

import PageLoader from "@/components/layout/page-loader";
import MonthlyRevenueChart from "@/components/pages/analytics/MonthlyRevenueChart";
import OrderByStatus from "@/components/pages/analytics/OrderByStatus";
import RecentOrdersSummary from "@/components/pages/analytics/RecentOrdersSummary";
import TopProducts from "@/components/pages/analytics/TopProducts";
import TopReviewedSuppliers from "@/components/pages/analytics/TopReviewedSuppliers";
import TopSuppliersByOrders from "@/components/pages/analytics/TopSuppliersByOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAnalyticStore } from "@/stores/useAnalyticStore";


export default function AnalyticsPage() {
	const { analytics, isLoading } = useAnalyticStore();

	if (isLoading) {
		return <PageLoader />;
	}


	if (!analytics) {
		return <div>Error loading analytics data</div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Analytics</h1>
				<p className="text-muted-foreground">
					Insights and performance metrics for your inventory
				</p>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${(analytics.totalRevenue || 0).toLocaleString()}
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<TrendingUp className="h-3 w-3 mr-1 text-green-500" />
							<span>From completed sales</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Products
						</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.totalProducts || 0}
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<span>Active products in inventory</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.totalOrders || 0}
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							<span>Purchase & sales orders</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Low Stock Items
						</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.lowStockItems || 0}
						</div>
						<div className="flex items-center text-xs text-muted-foreground">
							{(analytics.lowStockItems || 0) > 0 ? (
								<>
									<TrendingDown className="h-3 w-3 mr-1 text-red-500" />
									<span>Requires attention</span>
								</>
							) : (
								<span>All items well stocked</span>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Monthly Revenue Chart */}
				<MonthlyRevenueChart />

				{/* Top Reviewed Suppliers */}
				<TopReviewedSuppliers />

				{/* Top Suppliers by Orders Count */}
				<TopSuppliersByOrders />
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Orders by Status */}
				<OrderByStatus />

				{/* Top Products */}
				<TopProducts />
			</div>

			{/* Recent Orders Summary */}
			<RecentOrdersSummary />
		</div>
	);
}
