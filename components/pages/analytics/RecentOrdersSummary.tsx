"use client";

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

export default function RecentOrdersSummary() {
	const { analytics } = useAnalyticStore();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Orders Summary</CardTitle>
				<CardDescription>Latest order activity in your system</CardDescription>
			</CardHeader>
			<CardContent>
				{analytics.recentOrders && analytics.recentOrders.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Items</TableHead>
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
											variant={order.type === "sale" ? "default" : "secondary"}
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
									<TableCell>{order.items?.length || 0} items</TableCell>
									<TableCell>${(order.total || 0).toLocaleString()}</TableCell>
									<TableCell>
										{new Date(order.createdAt).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="text-center py-8">
						<p className="text-muted-foreground">No recent orders</p>
						<p className="text-sm text-muted-foreground mt-2">
							Create some orders to see activity here
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
