'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, Send, CreditCard, Smartphone, Bitcoin, QrCode, Lock } from 'lucide-react';
import Link from 'next/link';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const mockPayments = [
  { id: '1', merchant: 'ZizoMart Hyperstore', amount: '$78.50', method: 'card', date: '2023-10-28' },
  { id: '2', merchant: 'Cy-Cafe Downtown', amount: '$12.00', method: 'mobile', date: '2023-10-28' },
  { id: '3', merchant: 'Grid-Runner Taxi', amount: '$25.30', method: 'mobile', date: '2023-10-27' },
  { id: '4', merchant: 'Data-Stream Subscriptions', amount: '$15.00', method: 'card', date: '2023-10-26' },
  { id: '5', merchant: 'Accepts BTC Vendor', amount: '0.00041 BTC', method: 'crypto', date: '2023-10-25' },
];

const PaymentIcon = ({ method }: { method: string }) => {
    switch(method) {
        case 'card': return <CreditCard className="h-5 w-5 text-primary/70" />;
        case 'mobile': return <Smartphone className="h-5 w-5 text-primary/70" />;
        case 'crypto': return <Bitcoin className="h-5 w-5 text-primary/70" />;
        default: return <Wallet className="h-5 w-5 text-primary/70" />;
    }
}

export default function PayWaveGuestPage() {
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
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><Wallet className="w-10 h-10"/>PayWave</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Peer-to-peer. Fully encrypted. Beautifully intuitive. PayWave is your AI-powered wallet experience.
                </CardDescription>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Your PayWave Wallet</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col justify-center items-center bg-background/50 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground">Primary Balance</p>
                        <p className="text-4xl font-bold font-headline">$2,580.10</p>
                        <Button variant="outline" className="mt-4" disabled>Top Up Balance</Button>
                    </div>
                     <div className="flex flex-col justify-center items-center bg-background/50 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground">Linked Card</p>
                        <p className="text-2xl font-code tracking-widest mt-2">**** **** **** 8842</p>
                        <p className="text-sm text-muted-foreground">Expires 12/28</p>
                        <Button variant="outline" className="mt-4" disabled>Manage Cards</Button>
                    </div>
                     <div className="flex flex-col justify-center items-center bg-background/50 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground">P2P Username</p>
                         <p className="text-2xl font-bold font-headline mt-2">@guest_explorer</p>
                         <p className="text-sm text-muted-foreground">Send & receive instantly</p>
                        <Button variant="outline" className="mt-4" disabled>Edit Profile</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Recent Activity</CardTitle>
                    <CardDescription>A log of your simulated recent transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">{payment.merchant}</TableCell>
                                    <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <PaymentIcon method={payment.method} />
                                            <span className="capitalize">{payment.method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{payment.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock these powerful payment tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Send className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Make a Payment</h3>
                        <p className="text-sm text-muted-foreground">Send funds to any merchant or user instantly.</p>
                    </div>
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Smartphone className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Send to Contacts</h3>
                        <p className="text-sm text-muted-foreground">Sync your contacts for seamless P2P transfers.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <QrCode className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Scan QR Code</h3>
                        <p className="text-sm text-muted-foreground">Pay on the go by scanning QR codes.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Join the PayWave.</CardTitle>
                <CardDescription className="text-muted-foreground">Instant transfers with a sci-fi twist.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>
        </motion.div>
    );
}
