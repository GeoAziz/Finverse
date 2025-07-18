'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AreaChart, ResponsiveContainer, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, ArrowUp, Lock, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const chartData = [
  { date: 'May', value: 125000 },
  { date: 'Jun', value: 132000 },
  { date: 'Jul', value: 145000 },
  { date: 'Aug', value: 140000 },
  { date: 'Sep', value: 155000 },
  { date: 'Oct', value: 168000 },
];

const mockAssets = [
  { id: '1', name: 'Cyberdyne Systems (CDS)', value: '45,231.89', change: '+2.1%', changeType: 'up', risk: 'Volatile' },
  { id: '2', name: 'Stark Industries (STI)', value: '88,102.50', change: '+5.5%', changeType: 'up', risk: 'High' },
  { id: '3', name: 'Wayne Enterprises (WNE)', value: '25,600.00', change: '-0.8%', changeType: 'down', risk: 'Medium' },
  { id: '4', name: 'S&P 500 ETF', value: '9,455.62', change: '+1.2%', changeType: 'up', risk: 'Low' },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const RiskBadge = ({ risk }: { risk: string }) => {
    const variant = {
        'Low': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'High': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
        'Volatile': 'bg-red-500/20 text-red-300 border-red-500/50',
    }[risk] || 'default';
    return <Badge className={variant}>{risk}</Badge>;
}

export default function InvestHubGuestPage() {
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
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><TrendingUp className="w-10 h-10"/>InvestHub</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Zizo InvestHub simulates stock portfolios using predictive models. The future of investing is data-driven.
                </CardDescription>
            </Card>
            
            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Portfolio Performance</CardTitle>
                    <CardDescription>Simulated growth of your investment portfolio over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="md:col-span-1 space-y-4">
                            <Card className="bg-background/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Total Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold font-headline">$168,390.01</p>
                                    <p className="text-sm text-green-400 flex items-center"><ArrowUp size={16} className="mr-1"/> +15.2% (YTD)</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-background/50">
                                <CardHeader className="pb-2">
                                     <CardTitle className="text-lg">Overall Risk</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold font-headline">High</p>
                                    <p className="text-sm text-muted-foreground">AI-Assessed Profile</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-3 h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                     <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${(value as number)/1000}k`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background) / 0.9)",
                                            borderColor: "hsl(var(--border))",
                                        }}
                                        formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Portfolio Value']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Asset Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead>Risk Level</TableHead>
                                <TableHead>24h Change</TableHead>
                                <TableHead className="text-right">Current Value (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {mockAssets.map(asset => (
                                <TableRow key={asset.id}>
                                    <TableCell className="font-medium">{asset.name}</TableCell>
                                    <TableCell><RiskBadge risk={asset.risk} /></TableCell>
                                    <TableCell className={asset.changeType === 'up' ? 'text-green-400' : 'text-red-400'}>
                                        {asset.change}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">${asset.value}</TableCell>
                                </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock these premium trading and analysis tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <div className="flex justify-center gap-2">
                           <Button size="sm" disabled>Buy</Button>
                           <Button size="sm" variant="destructive" disabled>Sell</Button>
                        </div>
                        <h3 className="font-bold mt-2">Buy/Sell Actions</h3>
                        <p className="text-sm text-muted-foreground">Execute trades based on AI insights and market data.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Bot className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Smart Risk Analyzer</h3>
                        <p className="text-sm text-muted-foreground">Get real-time recommendations to balance your portfolio.</p>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Experience data-backed investing.</CardTitle>
                <CardDescription className="text-muted-foreground">Get real results with Zizo_InvestHub.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>

        </motion.div>
    );
}
