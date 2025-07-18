"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Cpu, Dna, Rocket, Compass, UserPlus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const Logo = () => (
    <div className="flex items-center justify-center gap-4">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
            <Dna className="w-16 h-16 text-primary" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-purple-400">
            Zizo FinVerse
        </h1>
    </div>
);

const Particle = ({ top, left, duration, size, delay }: { top: string, left: string, duration: number, size: number, delay: number }) => (
    <motion.div
        className="absolute rounded-full bg-primary/50"
        style={{
            top,
            left,
            width: size,
            height: size,
            boxShadow: `0 0 ${size * 2}px hsl(var(--primary) / 0.8)`
        }}
        animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 20, 0, -20, 0],
            opacity: [0, 1, 0.8, 1, 0]
        }}
        transition={{
            duration,
            repeat: Infinity,
            delay,
            ease: "easeInOut"
        }}
    />
);

export default function SplashPage() {
    const [particles, setParticles] = useState<any[]>([]);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is logged in, redirect to dashboard
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const isClient = typeof window !== 'undefined';
        if (isClient) {
            const generateParticles = () => {
                return Array.from({ length: 20 }).map((_, i) => ({
                    id: i,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    duration: Math.random() * 10 + 10,
                    size: Math.random() * 3 + 1,
                    delay: Math.random() * 5,
                }));
            };
            setParticles(generateParticles());
        }
    }, []);

    const handleExploreClick = () => {
        localStorage.setItem('guestMode', 'true');
        router.push('/explore/dashboard');
    };

    // While loading auth state, or if user exists, show a blank screen to avoid flicker
    if (loading || user) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <main className="relative flex flex-col items-center justify-center w-full min-h-screen overflow-hidden aurora-bg">
            <div className="absolute inset-0 w-full h-full z-0">
                {particles.map(p => <Particle key={p.id} {...p} />)}
            </div>

            <div className="z-10 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <Logo />
                </motion.div>

                <motion.p
                    className="mt-6 max-w-2xl text-lg text-foreground/80 font-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    Enter the Vault of the Future.
                </motion.p>
                <motion.div
                    className="mt-12 flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 150 }}
                >
                    <Button asChild size="lg" className="font-headline tracking-widest text-lg animate-pulse-glow">
                        <Link href="/login">
                            <Rocket className="mr-3" />
                            Login
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="font-headline tracking-widest text-lg">
                        <Link href="/login">
                             <UserPlus className="mr-3" />
                            Register
                        </Link>
                    </Button>
                     <Button size="lg" variant="outline" className="font-headline tracking-widest text-lg" onClick={handleExploreClick}>
                        <Compass className="mr-3" />
                        Explore
                    </Button>
                </motion.div>
                
                <motion.div
                    className="mt-16 flex space-x-8 text-muted-foreground"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-2">
                        <Cpu size={16} />
                        <span>AI Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dna size={16} />
                        <span>Modular Architecture</span>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
