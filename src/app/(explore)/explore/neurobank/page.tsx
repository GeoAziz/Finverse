'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, CircleDollarSign, BrainCircuit, Lock, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const chartData = [
    { month: 'May', deposits: 5800, spending: 2345 },
    { month: 'Jun', deposits: 6050, spending: 2890 },
    { month: 'Jul', deposits: 6100, spending: 3120 },
    { month: 'Aug', deposits: 5900, spending: 2570 },
    { month: 'Sep', deposits: 6200, spending: 3490 },
    { month: 'Oct', deposits: 5800, spending: 3010 },
];

const mockTransactions = [
    { id: '1', type: 'Credit', amount: 5800.00, description: 'Salary Deposit', date: '2023-10-25' },
    { id: '2', type: 'Debit', amount: 45.50, description: 'ZizoMart Groceries', date: '2023-10-24' },
    { id: '3', type: 'Debit', amount: 1200.00, description: 'Rent Payment', date: '2023-10-23' },
    { id: '4', type: 'Debit', amount: 89.99, description: 'HyperFuel Station', date: '2023-10-22' },
    { id: '5', type: 'Credit', amount: 250.00, description: 'Client Payment', date: '2023-10-21' },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export default function NeuroBankGuestPage() {
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
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><BrainCircuit className="w-10 h-10"/>NeuroBank</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    NeuroBank is Zizo's AI-driven financial cockpit — predicting your spending, categorizing transactions, and optimizing your budget in real-time.
                </CardDescription>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Simulated Balance</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">$15,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Neural Credit Score</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.87-8.17-7-9.58M12 8v4l2 1" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">920</div>
                        <p className="text-xs text-muted-foreground">Category: Prime++</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">$3,010.55</div>
                        <p className="text-xs text-muted-foreground">-12.5% vs last month</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Deposits</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">$5,800.00</div>
                        <p className="text-xs text-muted-foreground">+5% vs last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3 bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary">Spending vs Deposits (30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background) / 0.9)",
                                        borderColor: "hsl(var(--border))",
                                        color: "hsl(var(--foreground))"
                                    }}
                                />
                                <Bar dataKey="deposits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Deposits" />
                                <Bar dataKey="spending" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Spending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="font-medium">{t.description}</div>
                                            <div className="text-sm text-muted-foreground">{t.date}</div>
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${t.type === 'Credit' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type === 'Credit' ? '+' : '-'}${t.amount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Button className="w-full mt-4" disabled>Transfer Funds</Button>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock these premium AI-powered tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Bot className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">AI Budget Coach</h3>
                        <p className="text-sm text-muted-foreground">Personalized spending advice and forecasting.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <BrainCircuit className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Personalized Alerts</h3>
                        <p className="text-sm text-muted-foreground">Real-time notifications for spending anomalies.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Want your own intelligent bank account?</CardTitle>
                <CardDescription className="text-muted-foreground">Create a free Zizo account to unlock AI money mastery.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>

        </motion.div>
    );
}
