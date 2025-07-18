'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Landmark, FileDigit, Percent, PlusCircle, Upload, Bot, Lock } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const taxData = [
  { year: 2021, income: 85000, taxPaid: 12750 },
  { year: 2022, income: 92000, taxPaid: 14500 },
  { year: 2023, income: 105000, taxPaid: 18375 },
];

const mockRecords = [
    { id: '1', year: 2023, income: '$105,000', tax: '$18,375', status: 'Filed' },
    { id: '2', year: 2022, income: '$92,000', tax: '$14,500', status: 'Filed' },
    { id: '3', year: 2021, income: '$85,000', tax: '$12,750', status: 'Filed' },
    { id: '4', year: '2024 (Est.)', income: '$110,000', tax: '$19,800', status: 'Pending' },
]

const StatusBadge = ({ status }: { status: string }) => {
    const variant = {
        'Filed': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'Overdue': 'bg-red-500/20 text-red-300 border-red-500/50',
    }[status] || 'default';
    return <Badge className={variant}>{status}</Badge>;
}

export default function TaxGridGuestPage() {
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
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><Landmark className="w-10 h-10"/>TaxGrid</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Your futuristic tax assistant. Calculates, tracks, and files taxes with machine precision.
                </CardDescription>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated 2024 Tax</CardTitle>
                        <FileDigit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">$19,800</div>
                        <p className="text-xs text-muted-foreground">Based on current income trajectory</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Effective Tax Rate (2023)</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">17.5%</div>
                        <p className="text-xs text-muted-foreground">+0.8% from 2022</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Tax History Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={taxData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${(value as number)/1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background) / 0.9)",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="income" fill="hsl(var(--primary) / 0.5)" name="Taxable Income" />
                            <Bar dataKey="taxPaid" fill="hsl(var(--accent))" name="Tax Paid" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Tax Records</CardTitle>
                    <CardDescription>A summary of your simulated tax filings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Year</TableHead>
                                <TableHead>Taxable Income</TableHead>
                                <TableHead>Tax Paid</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.year}</TableCell>
                                    <TableCell>{record.income}</TableCell>
                                    <TableCell>{record.tax}</TableCell>
                                    <TableCell className="text-right">
                                        <StatusBadge status={record.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock these powerful tax automation tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Upload className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Upload Docs</h3>
                        <p className="text-sm text-muted-foreground">Securely upload tax documents for analysis.</p>
                    </div>
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <FileDigit className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Auto-File Submission</h3>
                        <p className="text-sm text-muted-foreground">Submit your tax returns with one click.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Bot className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Live AI Audit Scan</h3>
                        <p className="text-sm text-muted-foreground">Let our AI find deductions and audit risks.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Skip the spreadsheets.</CardTitle>
                <CardDescription className="text-muted-foreground">Let Zizo_TaxGrid optimize your taxes.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>
        </motion.div>
    );
}
