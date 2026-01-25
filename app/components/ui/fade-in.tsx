"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({
    children,
    className,
    delay = 0,
    direction = "up"
}: FadeInProps) {
    // triggerOnce: false assure que l'animation rejoue à chaque passage
    const { ref, isInView } = useInView({ threshold: 0.05, triggerOnce: false });

    const translateStyles = {
        up: "translate-y-8",
        down: "-translate-y-8",
        left: "translate-x-8",
        right: "-translate-x-8",
        none: ""
    };

    return (
        <div
            ref={ref}
            className={cn(
                // Durée de 700ms avec une courbe "ease-out" pour la douceur
                "transition-all duration-700 ease-out will-change-[transform,opacity,filter]",
                isInView
                    ? "opacity-100 translate-y-0 translate-x-0 blur-0"
                    : `opacity-0 blur-sm ${translateStyles[direction]}`, // Effet de flou au départ
                className
            )}
            style={{ transitionDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
}