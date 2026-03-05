import { Skeleton } from "./skeleton";

export function DataTableSkeleton({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
    return (
        <div className="rounded-lg border">
            <div className="border-b bg-muted/30 p-4">
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-24" />
                    ))}
                </div>
            </div>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-4 border-b p-4 last:border-0">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton key={colIdx} className="h-4 w-20" />
                    ))}
                </div>
            ))}
        </div>
    );
}
