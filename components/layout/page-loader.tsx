import { cn } from "@/lib/utils";

export default function PageLoader({ className }: { className?: string }) {
	return (
		<div
			className={cn("flex items-center justify-center min-h-screen", className)}
		>
			<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
		</div>
	);
}
