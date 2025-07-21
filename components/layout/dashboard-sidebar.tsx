"use client";

import {
	BarChart3,
	LayoutDashboard,
	LogOut,
	Package,
	Package2,
	ShoppingCart,
	Star,
	UserCog,
	Users,
	Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { useAuthStore } from "@/stores/useAuthStore";

const menuItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Products",
		url: "/dashboard/products",
		icon: Package2,
	},
	{
		title: "Suppliers",
		url: "/dashboard/suppliers",
		icon: Users,
	},
	{
		title: "Stocks",
		url: "/dashboard/stocks",
		icon: Warehouse,
	},
	{
		title: "Orders",
		url: "/dashboard/orders",
		icon: ShoppingCart,
	},
	{
		title: "Analytics",
		url: "/dashboard/analytics",
		icon: BarChart3,
	},
	{
		title: "Reviews",
		url: "/dashboard/reviews",
		icon: Star,
	},
	{
		title: "Team",
		url: "/dashboard/users",
		icon: UserCog,
	},
];

export function DashboardSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { state } = useSidebar();
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center space-x-2 px-2">
					<Package className="h-8 w-8 text-primary" />
					{state === "expanded" && (
						<span className="text-xl font-bold">StockMaster</span>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuButton
						asChild
						variant="destructive"
					>
						<Button
							variant="destructiveGhost"
							className="w-full justify-start"
							onClick={handleLogout}
						>
							<LogOut className="h-4 w-4 mr-2" />
							Logout
						</Button>
					</SidebarMenuButton>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
