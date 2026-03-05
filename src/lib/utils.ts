import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format number in Indian currency format
export function formatINR(amount: number | string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
}

// Format number with Indian number system
export function formatNumber(num: number | string): string {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(n)) return "0";
    return new Intl.NumberFormat("en-IN").format(n);
}

// Get relative time string
export function getRelativeTime(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Generate CSV from data
export function generateCSV(headers: string[], rows: string[][]): string {
    const csvHeaders = headers.join(",");
    const csvRows = rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    );
    return [csvHeaders, ...csvRows].join("\n");
}

// Download CSV
export function downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Stock status helper
export function getStockStatus(
    currentStock: number,
    minimumLevel: number
): { label: string; color: string; variant: "ok" | "low" | "critical" } {
    if (currentStock <= 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50", variant: "critical" };
    if (currentStock < minimumLevel * 0.5) return { label: "Critical", color: "text-red-600 bg-red-50", variant: "critical" };
    if (currentStock < minimumLevel) return { label: "Low", color: "text-amber-600 bg-amber-50", variant: "low" };
    return { label: "OK", color: "text-green-600 bg-green-50", variant: "ok" };
}

// Generate SKU suggestion
export function suggestSKU(name: string): string {
    return name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase())
        .join("")
        .substring(0, 4)
        + "-"
        + Math.random().toString(36).substring(2, 6).toUpperCase();
}
