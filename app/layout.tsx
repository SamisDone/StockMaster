import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import StoreInitProvider from "@/providers/StoreInitProvider";

import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "StockMaster",
	description: "A complete inventory management solution for your business",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="dark">
				<Toaster />
				<StoreInitProvider>{children}</StoreInitProvider>
			</body>
		</html>
	);
}
