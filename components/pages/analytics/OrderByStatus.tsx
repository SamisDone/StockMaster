import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAnalyticStore } from "@/stores/useAnalyticStore";

export default function OrderByStatus() {
	const { analytics } = useAnalyticStore();

	// Prepare data for charts with proper null checks
	const orderStatusData = analytics.recentOrders.reduce((acc, order) => {
		acc[order.status] = (acc[order.status] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const orderStatusChartData = Object.entries(orderStatusData).map(
		([status, count]) => ({
			status: status.charAt(0).toUpperCase() + status.slice(1),
			count: count || 0,
		})
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Orders by Status</CardTitle>
				<CardDescription>
					Distribution of orders by current status
				</CardDescription>
			</CardHeader>
			<CardContent>
				{orderStatusChartData.length > 0 ? (
					<ResponsiveContainer
						width="100%"
						height={300}
					>
						<PieChart>
							<Pie
								data={orderStatusChartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ status, count }) => `${status}: ${count}`}
								outerRadius={80}
								fill="#8884d8"
								dataKey="count"
							>
								{orderStatusChartData.slice(0, 5).map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={`hsl(var(--chart-${Math.min(index + 1, 5)}))`}
									/>
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						No order data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
