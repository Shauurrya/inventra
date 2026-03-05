import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="text-center max-w-md">
                <h1 className="text-8xl font-bold text-primary-200">404</h1>
                <h2 className="text-2xl font-bold text-primary-900 mt-4 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/">
                    <Button variant="accent" size="lg">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}
