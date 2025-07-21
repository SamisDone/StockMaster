"use client";

import { motion, useInView } from "motion/react";
import { ReactNode, useRef } from "react";

// Define animation variants based on the animationType
const animationVariants = {
	slideInUp: {
		initial: { opacity: 0, y: 25 },
		animate: { opacity: 1, y: 0 },
	},
	slideInDown: {
		initial: { opacity: 0, y: -25 },
		animate: { opacity: 1, y: 0 },
	},
	slideInLeft: {
		initial: { opacity: 0, x: -25 },
		animate: { opacity: 1, x: 0 },
	},
	slideInRight: {
		initial: { opacity: 0, x: 25 },
		animate: { opacity: 1, x: 0 },
	},
	scaleIn: {
		initial: { opacity: 0, scale: 0.8 },
		animate: { opacity: 1, scale: 1 },
	},
};

export interface AnimatedSectionProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	variant?: keyof typeof animationVariants;
}

export default function AnimatedSection({
	children,
	delay = 0,
	variant = "slideInUp",
	className = "",
}: AnimatedSectionProps) {
	const ref = useRef(null);
	const isInView = useInView(ref, { margin: "-40px", once: true });

	const selectedAnimation = animationVariants[variant];

	return (
		<motion.div
			ref={ref}
			initial={selectedAnimation.initial}
			animate={isInView ? selectedAnimation.animate : {}}
			transition={{ duration: 0.5, delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
