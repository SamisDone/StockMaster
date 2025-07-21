"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export default function BackButton({ url }: { url?: string }) {
	const router = useRouter();
	const Slot = url ? Link : Button;

	return (
		<Slot
			href={url || "#"}
			onClick={url ? undefined : () => router.back()}
			className={cn(
				buttonVariants({ variant: "link", size: "sm" }),
				"flex items-center text-primary-foreground justify-start w-fit"
			)}
			variant="link"
			size="sm"
		>
			<ArrowLeft className="size-3" />
			<span>Back</span>
		</Slot>
	);
}
