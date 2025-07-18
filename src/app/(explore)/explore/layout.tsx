'use client'
import { Button } from "@/components/ui/button";
import { Globe, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const guestMode = localStorage.getItem('guestMode') === 'true';
        if (!guestMode) {
            router.push('/');
        } else {
            setIsGuest(true);
        }
    }, [router]);

    if (!isGuest) {
        return <div className="flex h-screen items-center justify-center">Redirecting...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 text-primary font-headline">
                        <Globe className="h-6 w-6" />
                        <span className="text-xl">Guest Mode: Read-Only Simulation</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button asChild className="font-headline tracking-widest text-lg animate-pulse-glow">
                            <Link href="/login">
                                <Rocket className="mr-3" />
                                Create Free Account
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 aurora-bg">
                {children}
            </main>
        </div>
    );
}
