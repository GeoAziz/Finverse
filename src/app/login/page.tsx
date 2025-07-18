
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Fingerprint, LogIn, Loader } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const BiometricScanner = () => {
    return (
        <div className="relative w-32 h-32 mx-auto my-4">
            <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
                <Fingerprint className="w-full h-full text-primary/30" />
            </motion.div>
            <motion.div
                className="absolute left-0 w-full h-0.5 bg-primary"
                style={{ boxShadow: '0 0 10px hsl(var(--primary))' }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            />
        </div>
    );
};

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });
    
    // Redirect if user is already logged in, using useEffect to prevent render-time updates
    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/dashboard');
        }
    }, [user, authLoading, router]);
    
    if (authLoading || user) {
        // Render a loading state or null while checking auth, to prevent flicker
        return (
             <div className="flex h-screen w-full items-center justify-center aurora-bg">
                <Loader className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast({
                title: 'Success!',
                description: 'Identity matched. Welcome back.',
            });
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            toast({
                title: 'Authentication Failed',
                description: error.message || 'Please check your credentials and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen p-4 aurora-bg">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl shadow-primary/10">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-4xl text-primary tracking-widest">Authenticate</CardTitle>
                        <CardDescription className="font-body text-foreground/70">Access Zizo_FinVerse Core</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <BiometricScanner />
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-headline text-primary/80">System ID (Email)</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="user@zizo.finverse" 
                                    className="bg-background/50 focus:bg-background"
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-headline text-primary/80">Passcode</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="●●●●●●●●" 
                                    className="bg-background/50 focus:bg-background"
                                    {...register('password')}
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full font-headline text-lg tracking-wider" disabled={isLoading}>
                               {isLoading ? (
                                    <>
                                        <Loader className="mr-2 animate-spin" />
                                        Authenticating...
                                    </>
                               ) : (
                                    <>
                                        <LogIn className="mr-2" />
                                        Initiate System Control
                                    </>
                               )}
                            </Button>
                            <p className="text-xs text-muted-foreground">Voice prompt: “Identity matched. Welcome back.”</p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </main>
    );
}
