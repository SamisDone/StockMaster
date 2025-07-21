"use client";

import {
	ArrowRight,
	BarChart3,
	CheckCircle,
	Package,
	Shield,
	ShoppingCart,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import AnimatedSection from "@/components/animated-section";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useAnalyticStore } from "@/stores/useAnalyticStore";
import { useAuthStore } from "@/stores/useAuthStore";

const FEATURES = [
	{
		icon: Package,
		title: "Product Management",
		description:
			"Easily add, edit, and organize your products with detailed information and categorization.",
	},
	{
		icon: Users,
		title: "Supplier Management",
		description:
			"Maintain comprehensive supplier records and manage relationships effectively.",
	},
	{
		icon: BarChart3,
		title: "Stock Tracking",
		description:
			"Real-time stock level monitoring with low stock alerts and automated reordering.",
	},
	{
		icon: Zap,
		title: "Order Management",
		description:
			"Streamline purchase and sales orders with automated workflows and tracking.",
	},
	{
		icon: BarChart3,
		title: "Analytics & Reports",
		description:
			"Gain insights with comprehensive analytics and customizable reporting tools.",
	},
	{
		icon: Shield,
		title: "User Management",
		description:
			"Role-based access control to ensure security and proper workflow management.",
	},
];

const BENEFITS = [
	{
		title: "Easy to Use",
		description:
			"Intuitive interface designed for users of all technical levels, making inventory management simple and efficient.",
	},
	{
		title: "Real-time Updates",
		description:
			"Get instant updates on stock levels, orders, and inventory changes to make informed decisions quickly.",
	},
	{
		title: "Comprehensive Analytics",
		description:
			"Make data-driven decisions with detailed reports and insights into your inventory performance.",
	},
	{
		title: "Scalable Solution",
		description:
			"Grows with your business from small operations to enterprise level, adapting to your needs.",
	},
];

export default function LandingPage() {
	const { user, isLoading } = useAuthStore();
	const {
		analytics: { totalProducts, totalOrders, totalSuppliers },
	} = useAnalyticStore();

	const isAuthenticated = !!user && !isLoading;

	const loginLink = isAuthenticated ? "/dashboard" : "/login";
	const registerLink = isAuthenticated ? "/dashboard" : "/register";

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Package className="h-8 w-8 text-primary" />
						<span className="text-2xl font-bold">StockMaster</span>
					</div>

					<div className="flex items-center space-x-4">
						<Link href={loginLink}>
							<Button variant="ghost">
								{isAuthenticated ? "Dashboard" : "Login"}
							</Button>
						</Link>
						{!isAuthenticated && (
							<Link href={registerLink}>
								<Button>Get Started</Button>
							</Link>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 px-4">
				<div className="container mx-auto text-center">
					<Badge
						variant="secondary"
						className="mb-4"
					>
						Complete Inventory Solution
					</Badge>
					<h1 className="text-4xl md:text-6xl font-bold mb-6">
						<TextGenerateEffect words="Manage Your Company's Inventory with" />{" "}
						<span className="text-primary">StockMaster</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						A comprehensive inventory management system designed for your
						business. Track products, manage suppliers, monitor stock levels,
						and oversee your team all in one centralized platform.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href={registerLink}>
							<Button
								size="lg"
								className="w-full sm:w-auto"
							>
								Get Started
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
						<Link href={loginLink}>
							<Button
								size="lg"
								variant="outline"
								className="w-full sm:w-auto bg-transparent"
							>
								{isAuthenticated ? "Dashboard" : "Sign In"}
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-4 bg-muted/50">
				<div className="container mx-auto space-y-16">
					<div className="text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Everything You Need to Manage Inventory
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Powerful features designed to help you take control of your
							inventory management
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{FEATURES.map((feature, index) => (
							<AnimatedSection
								key={index}
								delay={index * 0.1}
							>
								<Card>
									<CardHeader>
										<feature.icon className="h-12 w-12 text-primary mb-4" />
										<CardTitle>{feature.title}</CardTitle>
										<CardDescription>{feature.description}</CardDescription>
									</CardHeader>
								</Card>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Quick Overview Section */}
			<section className="py-20 px-4">
				<div className="container mx-auto space-y-16">
					<div className="text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Quick Overview of Your Inventory
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Track your products, suppliers, and orders with real-time
							analytics and insights
						</p>
					</div>

					<AnimatedSection>
						<div className="grid grid-cols-3 gap-8">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Products
									</CardTitle>
									<Package className="h-4 w-4 text-muted-foreground" />
								</CardHeader>

								<CardContent>
									<div className="text-2xl font-bold">{totalProducts}</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Suppliers
									</CardTitle>
									<Users className="h-4 w-4 text-muted-foreground" />
								</CardHeader>

								<CardContent>
									<div className="text-2xl font-bold">{totalSuppliers}</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Orders
									</CardTitle>
									<ShoppingCart className="h-4 w-4 text-muted-foreground" />
								</CardHeader>

								<CardContent>
									<div className="text-2xl font-bold">{totalOrders}</div>
								</CardContent>
							</Card>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-20 px-4 bg-muted/50">
				<div className="container mx-auto">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl md:text-4xl font-bold mb-6">
								Perfect for Your Business
							</h2>

							<div className="space-y-4">
								{BENEFITS.map((benefit, index) => (
									<AnimatedSection
										key={index}
										delay={index * 0.1}
										variant="slideInLeft"
									>
										<div className="flex items-start space-x-3">
											<CheckCircle className="h-6 w-6 text-primary mt-0.5" />

											<div>
												<h3 className="font-semibold">{benefit.title}</h3>
												<p className="text-muted-foreground">
													{benefit.description}
												</p>
											</div>
										</div>
									</AnimatedSection>
								))}
							</div>
						</div>

						<div className="bg-muted/50 rounded-lg p-8">
							<Card>
								<CardHeader>
									<CardTitle>Ready to Get Started?</CardTitle>
									<CardDescription>
										Set up your company's inventory management system and start
										organizing your business operations
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<Link href={registerLink}>
											<Button
												className="w-full"
												size="lg"
											>
												{isAuthenticated
													? "Go to Dashboard"
													: "Set Up Your System"}
												<ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										</Link>
										<p className="text-sm text-muted-foreground text-center">
											Quick setup • Manage your team • Track everything
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-12 px-4">
				<div className="container mx-auto text-center">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<Package className="h-6 w-6 text-primary" />
						<span className="text-xl font-bold">StockMaster</span>
					</div>
					<p className="text-muted-foreground">
						© 2024 StockMaster. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
