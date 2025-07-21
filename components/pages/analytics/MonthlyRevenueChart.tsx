"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
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

import { useAnalyticStore } from "@/stores/useAnalyticStore";

export default function MonthlyRevenueChart() {
	const { analytics, isLoading: isAnalyticsLoading } = useAnalyticStore();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Monthly Revenue Trend</CardTitle>
				<CardDescription>
					Revenue performance over the last 6 months
				</CardDescription>
			</CardHeader>
			<CardContent>
				{analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 ? (
					<ResponsiveContainer
						width="100%"
						height={300}
					>
						<LineChart data={analytics.monthlyRevenue}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip formatter={(value) => [`$${value || 0}`, "Revenue"]} />
							<Line
								type="monotone"
								dataKey="revenue"
								stroke="hsl(var(--chart-2))"
								strokeWidth={2}
								dot={{ fill: "hsl(var(--chart-2))" }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						No revenue data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
