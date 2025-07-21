"use client";

import { Eye, EyeOff, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import BackButton from "@/components/back-button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { login, user, isLoading: isAuthLoading } = useAuthStore();

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const success = await login({ email, password });
			if (success) {
				router.push("/dashboard");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (!isAuthLoading && user) {
			router.push("/dashboard");
		}
	}, [isAuthLoading, user, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
			<div className="w-full space-y-3 max-w-lg">
				<BackButton url="/" />

				<div className="w-full max-w-md mx-auto">
					<div className="flex items-center justify-center mb-8">
						<Package className="h-8 w-8 text-primary mr-2" />
						<span className="text-2xl font-bold">StockMaster</span>
					</div>

					<Card>
						<CardHeader className="text-center">
							<CardTitle>Welcome Back</CardTitle>
							<CardDescription>
								Sign in to your StockMaster account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleSubmit}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Input
											id="password"
											type={showPassword ? "text" : "password"}
											placeholder="Enter your password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Signing in..." : "Sign In"}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<p className="text-sm text-muted-foreground">
									{"Don't have an account? "}
									<Link
										href="/register"
										className="text-primary hover:underline"
									>
										Sign up
									</Link>
								</p>
							</div>

							<div className="mt-4 p-4 bg-muted rounded-lg">
								<p className="text-sm font-medium mb-2">Demo Account:</p>
								<p className="text-xs text-muted-foreground">
									Email: {api.auth.DEFAULT_ADMIN_PROFILE.email}
									<br />
									Password: {api.auth.DEFAULT_ADMIN_PROFILE.password}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
