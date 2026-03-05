"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparkLineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

export function SparkLine({ data, color = "#3b82f6", width = 80, height = 28 }: SparkLineProps) {
    const chartData = data.map((v, i) => ({ v, i }));
    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="v"
                        stroke={color}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
