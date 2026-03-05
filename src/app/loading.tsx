export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 animate-pulse">Loading Inventra...</p>
            </div>
        </div>
    );
}
