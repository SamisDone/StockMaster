"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useOrderStore } from "@/stores/useOrderStore";
import { useSupplierStore } from "@/stores/useSuplierStore";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function TopSuppliersByOrders() {
	const { suppliers } = useSupplierStore();
	const { orders } = useOrderStore();

	// Top suppliers by order count
	const topSuppliersByOrders = suppliers
		.map((supplier) => {
			const orderCount = orders.filter(
				(p) => p.supplierId === supplier.id
			).length;
			return {
				supplier:
					supplier.name.length > 15
						? supplier.name.substring(0, 15)
						: supplier.name,
				count: orderCount,
			};
		})
		.filter((item) => item.count > 0)
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Suppliers by Orders</CardTitle>
				<CardDescription>Suppliers with most orders</CardDescription>
			</CardHeader>

			<CardContent>
				{topSuppliersByOrders.length > 0 ? (
					<ResponsiveContainer
						width="100%"
						height={300}
					>
						<PieChart>
							<Pie
								data={topSuppliersByOrders}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ supplier, count }) => `${supplier}: ${count}`}
								outerRadius={80}
								fill="#8884d8"
								dataKey="count"
							>
								{topSuppliersByOrders.map((_, index) => (
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
						No supplier data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
