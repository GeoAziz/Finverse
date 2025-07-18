
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, CircleDollarSign, Loader, Brain, AlertTriangle } from 'lucide-react';
import FinancialInsights from '@/components/financial-insights';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, DocumentData, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { neurobankAccountDoc, neurobankTransactionsCollection, neurobankAnalyticsDoc, neurobankBudgetsCollection } from '@/lib/collections';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    category: string;
    timestamp: Timestamp;
    taggedByAI?: boolean;
}

interface Account {
    balance: number;
    currency: string;
    accountType: string;
}

interface Analytics {
    totalSpent: number;
    topCategory: string;
    burnRate: number;
    AIComment: string;
}

interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
}

export default function NeuroBankPage() {
    const { user } = useAuth();
    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const unsubs: (() => void)[] = [];

        unsubs.push(onSnapshot(neurobankAccountDoc(user.uid), (doc) => setAccount(doc.data() as Account)));
        
        const transactionsQuery = query(neurobankTransactionsCollection(user.uid), orderBy('timestamp', 'desc'));
        unsubs.push(onSnapshot(transactionsQuery, (snapshot) => {
            const allTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setAllTransactions(allTxs);
            setTransactions(allTxs.slice(0, 10)); // Keep only recent for display
        }));

        unsubs.push(onSnapshot(neurobankAnalyticsDoc(user.uid), (doc) => setAnalytics(doc.data() as Analytics)));
        
        unsubs.push(onSnapshot(neurobankBudgetsCollection(user.uid), (snapshot) => {
            setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
        }));

        // Give a moment for all snapshots to fire at least once
        const timer = setTimeout(() => setLoading(false), 2000);
        unsubs.push(() => clearTimeout(timer));

        return () => unsubs.forEach(unsub => unsub());

    }, [user]);
    
    const getBudgetStatus = () => {
        if (!budgets.length) return { text: 'No budgets set', count: 0 };
        const controlled = budgets.filter(b => b.spent <= b.limit).length;
        return { text: `${controlled}/${budgets.length} under control`, count: controlled };
    }

    return (
        <motion.div
         initial="initial"
         animate="in"
         exit="out"
         variants={pageVariants}
         transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
         className="space-y-8"
        >
            <div>
                <h1 className="text-4xl font-headline tracking-wider text-foreground">NeuroBank</h1>
                <p className="text-muted-foreground font-body text-lg">Your financial core is synced and healthy.</p>
            </div>
            
            {loading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : !account ? (
                <Card className="bg-card/70 backdrop-blur-sm text-center">
                    <CardHeader><CardTitle className="text-destructive font-headline">No NeuroBank Account Found</CardTitle></CardHeader>
                    <CardContent><p>No NeuroBank account data found. Please run `npm run seed:neurobank`.</p></CardContent>
                </Card>
            ) : (
            <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                     <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-headline">{account.currency} {account.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            <p className="text-xs text-muted-foreground">{account.accountType} Account</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent (Month)</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-headline">{account.currency} {analytics?.totalSpent.toLocaleString('en-US', {minimumFractionDigits: 2}) ?? '0.00'}</div>
                             <p className="text-xs text-muted-foreground">Top Category: {analytics?.topCategory}</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Burn Rate</CardTitle>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.87-8.17-7-9.58M12 8v4l2 1" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-headline">{account.currency} {analytics?.burnRate.toFixed(2)}/day</div>
                            <p className="text-xs text-muted-foreground">AI spending projection</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-headline">{getBudgetStatus().text}</div>
                            <Progress value={(getBudgetStatus().count / (budgets.length || 1)) * 100} className="h-2 mt-1" />
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-3 bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <div className="font-medium">{t.description}</div>
                                                <div className="text-sm text-muted-foreground">{format(t.timestamp.toDate(), 'MMM dd, yyyy')}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{t.category}</Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                               {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card className="lg:col-span-2 bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">Budget Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {budgets.map(b => {
                                const percentage = (b.spent / b.limit) * 100;
                                const isOver = percentage > 100;
                                return (
                                <div key={b.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{b.category}</span>
                                        <span className={`font-semibold ${isOver ? 'text-destructive': ''}`}>
                                            ${b.spent.toLocaleString()} / ${b.limit.toLocaleString()} {isOver && <AlertTriangle className="inline w-4 h-4 ml-1" />}
                                        </span>
                                    </div>
                                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                                </div>
                            )})}
                        </CardContent>
                    </Card>
                </div>
                 <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-accent flex items-center gap-2"><Brain/>AI Comment Panel</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground italic">"{analytics?.AIComment}"</p>
                    </CardContent>
                </Card>
                
                <FinancialInsights transactions={allTransactions} />
            </>
            )}
        </motion.div>
    );
}
