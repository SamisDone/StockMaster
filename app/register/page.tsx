"use client";

import { Eye, EyeOff, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { useAuthStore } from "@/stores/useAuthStore";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const router = useRouter();

	const { register, user, isLoading: isAuthLoading } = useAuthStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		try {
			setIsSubmitting(true);
			const success = await register({ email, password, name });
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

				<div className="w-full max-w-md">
					<div className="flex items-center justify-center mb-8">
						<Package className="h-8 w-8 text-primary mr-2" />
						<span className="text-2xl font-bold">StockMaster</span>
					</div>

					<Card>
						<CardHeader className="text-center">
							<CardTitle>Create Account</CardTitle>
							<CardDescription>
								Get started with StockMaster today
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleSubmit}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										id="name"
										type="text"
										placeholder="Enter your full name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
									/>
								</div>

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
											placeholder="Create a password"
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

								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										placeholder="Confirm your password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Creating account..." : "Create Account"}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<p className="text-sm text-muted-foreground">
									Already have an account?{" "}
									<Link
										href="/login"
										className="text-primary hover:underline"
									>
										Sign in
									</Link>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
