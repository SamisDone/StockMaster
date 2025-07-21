"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import PageLoader from "@/components/layout/page-loader";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, isLoading } = useAuthStore();

	useEffect(() => {
		// Redirect to login if user is not authenticated
		if (!isLoading && !user) {
			router.push("/login");
		}
	}, [isLoading, user, router]);

	if (isLoading) {
		return <PageLoader />;
	}

	if (!user) {
		return null;
	}

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1" />
						<small className="text-gray-400 text-xs font-medium">
							(Ctrl+B)
						</small>
					</div>
					<div className="ml-auto flex items-center space-x-4">
						<span className="text-sm text-muted-foreground">
							Welcome, {user.name}
						</span>
					</div>
				</header>
				<main className="flex-1 overflow-auto p-4">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
