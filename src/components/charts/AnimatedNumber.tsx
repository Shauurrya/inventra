"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    formatFn?: (n: number) => string;
    className?: string;
}

export function AnimatedNumber({ value, duration = 1000, formatFn, className }: AnimatedNumberProps) {
    const motionVal = useMotionValue(0);
    const [display, setDisplay] = useState("0");

    useEffect(() => {
        const controls = animate(motionVal, value, {
            duration: duration / 1000,
            ease: "easeOut",
            onUpdate: (v) => {
                setDisplay(formatFn ? formatFn(v) : Math.round(v).toLocaleString("en-IN"));
            },
        });
        return controls.stop;
    }, [value, duration, formatFn, motionVal]);

    return <span className={className}>{display}</span>;
}
