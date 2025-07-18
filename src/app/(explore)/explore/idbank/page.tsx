'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Fingerprint, CheckCircle, Shield, Upload, Lock, GraduationCap, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export default function IDBankGuestPage() {
    return (
        <motion.div
         initial="initial"
         animate="in"
         exit="out"
         variants={pageVariants}
         transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
         className="space-y-8"
        >
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 text-center p-8">
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><Fingerprint className="w-10 h-10"/>IDBank</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Zizo_IDBank is your verified financial ID — evolving with your behavior, scores, and simulations.
                </CardDescription>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-3">
                        Digital Identity Profile Simulation
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center gap-4">
                        <div className="relative">
                            <Image 
                                src="https://placehold.co/200x200.png" 
                                alt="Guest User" 
                                width={200}
                                height={200}
                                className="rounded-full border-4 border-primary/50 shadow-lg"
                                data-ai-hint="futuristic avatar"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-background">
                                <CheckCircle className="text-white w-6 h-6"/>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold font-headline text-center">Guest_User_01</h2>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/50 text-base py-1 px-3">
                            Status: Trusted
                        </Badge>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-background/50">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">Verified Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">KYC Level</p>
                                    <p className="font-semibold">Level 2</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Verified</p>
                                    <p className="font-semibold">Mobile, Email, Vault</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Nationality</p>
                                    <p className="font-semibold">Cyberspace</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Verification Tier</p>
                                    <p className="font-semibold">Tier 3 (Biometric)</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/50">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">AI Knowledge Center</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground font-body italic">"In decentralized finance (DeFi), 'yield farming' is the practice of staking or lending crypto assets in order to generate high returns or rewards in the form of additional cryptocurrency."</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

             <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock these powerful identity and learning tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Upload className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Personal Progress</h3>
                        <p className="text-sm text-muted-foreground">Track your financial literacy and score improvements.</p>
                    </div>
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <GraduationCap className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Learn-to-Earn Modules</h3>
                        <p className="text-sm text-muted-foreground">Complete lessons to earn rewards and boost your score.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Star className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Score Upgrades</h3>
                        <p className="text-sm text-muted-foreground">Increase your KYC level and unlock better financial products.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Own your financial identity.</CardTitle>
                <CardDescription className="text-muted-foreground">Zizo_IDBank empowers you to grow it.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>

        </motion.div>
    );
}
