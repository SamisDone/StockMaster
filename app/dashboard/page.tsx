"use client";

import {
	AlertTriangle,
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	Calendar,
	User,
} from "lucide-react";

import PageLoader from "@/components/layout/page-loader";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useAnalyticStore } from "@/stores/useAnalyticStore";
import { useProductStore } from "@/stores/useProductStore";

export default function DashboardPage() {
	const { products } = useProductStore();
	const { analytics, isLoading } = useAnalyticStore();

	if (isLoading) {
		return <PageLoader />;
	}

	if (!analytics) {
		return <div>Error loading dashboard data</div>;
	}

	const STATS = [
		{
			id: "totalProducts",
			label: "Total Products",
			icon: Package,
			value: analytics.totalProducts,
		}, {
			id: "totalSuppliers",
			label: "Total Suppliers",
			icon: Users,
			value: analytics.totalSuppliers,
		}, {
			id: "totalOrders",
			label: "Total Orders",
			icon: ShoppingCart,
			value: analytics.totalOrders,
		}, {
			id: "totalRevenue",
			label: "Total Revenue",
			icon: DollarSign,
			value: `$${analytics.totalRevenue.toLocaleString()}`,
		}
	]

	const getProductName = (productId: string) => {
		const product = products.find((p) => p.id === productId);
		return product?.name || "Unknown Product";
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome to your StockMaster dashboard
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{STATS.map((stat) =>
				<Card key={stat.id}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{stat.label}
						</CardTitle>

						<stat.icon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					
					<CardContent>
						<div className="text-2xl font-bold">{stat.value}</div>
					</CardContent>
				</Card>
			)}
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Low Stock Alert */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-orange-500" />
							Low Stock Alert
						</CardTitle>
						<CardDescription>
							{analytics.lowStockItems} items are running low on stock
						</CardDescription>
					</CardHeader>
					<CardContent>
						{analytics.lowStockItems > 0 ? (
							<Badge variant="destructive">Action Required</Badge>
						) : (
							<Badge variant="secondary">All Good</Badge>
						)}
					</CardContent>
				</Card>

				{/* Top Products */}
				<Card>
					<CardHeader>
							<CardTitle>Top Selling Products</CardTitle>
							<CardDescription>
								Best performing products by quantity sold
							</CardDescription>
						
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{analytics.topProducts.slice(0, 3).map((item, index) => (
								<div
									key={item.productId}
									className="flex items-center justify-between"
								>
									<span className="text-sm">
										{index + 1}. {getProductName(item.productId)}
									</span>
									<Badge variant="secondary">{item.quantity} sold</Badge>
								</div>
							))}
							{analytics.topProducts.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No sales data available
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Orders</CardTitle>
					<CardDescription>Latest orders in your system</CardDescription>
				</CardHeader>
				<CardContent>
					{analytics.recentOrders.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order ID</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Date</TableHead>

								</TableRow>
							</TableHeader>
							<TableBody>
								{analytics.recentOrders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-medium">
											{order.id.slice(0, 8)}...
										</TableCell>
										<TableCell>
											<Badge
												variant={
													order.type === "sale" ? "default" : "secondary"
												}
											>
												{order.type}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													order.status === "completed"
														? "default"
														: order.status === "processing"
															? "secondary"
															: order.status === "pending"
																? "outline"
																: "destructive"
												}
											>
												{order.status}
											</Badge>
										</TableCell>
										<TableCell>${order.total.toLocaleString()}</TableCell>
										<TableCell>
											{new Date(order.createdAt).toLocaleDateString()}
										</TableCell>

									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-center text-muted-foreground py-4">
							No orders found
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
