
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AreaChart, Bot, FilePlus, Loader, TrendingUp, Wallet, Activity, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, DocumentData, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { loanSyncActiveLoanDoc, loanSyncHistoryCollection, loanSyncInsightsDoc, loanSyncRepaymentsCollection } from '@/lib/collections';
import { format } from 'date-fns';
import { LoanApplicationModal } from '@/components/modals/loan-application-modal';
import { Tooltip, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { DonutChart } from '@/components/ui/donut-chart';


const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface ActiveLoan {
    loanId: string;
    amount: number;
    type: string;
    interestRate: number;
    termMonths: number;
    status: string;
    remainingBalance: number;
}
interface LoanHistory {
    id: string;
    amount: number;
    status: string;
    feedback: string;
    loanType: string;
    submittedAt: Timestamp;
}
interface Insights {
    creditScore: number;
    repaymentBehavior: string;
    AIComment: string;
}

const StatusBadge = ({ status }: { status: string }) => {
    const variant = {
        'Approved': 'bg-green-500/20 text-green-300 border-green-500/50',
        'active': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'Rejected': 'bg-red-500/20 text-red-300 border-red-500/50',
        'Declined': 'bg-red-500/20 text-red-300 border-red-500/50',
        'Completed': 'bg-primary/20 text-primary-300 border-primary/50',
    }[status];
    return <Badge className={`capitalize ${variant}`}>{status}</Badge>;
}

export default function LoanSyncPage() {
    const { user } = useAuth();
    const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
    const [loanHistory, setLoanHistory] = useState<LoanHistory[]>([]);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const unsubActive = onSnapshot(loanSyncActiveLoanDoc(user.uid), (doc) => setActiveLoan(doc.exists() ? doc.data() as ActiveLoan : null));
        const unsubHistory = onSnapshot(loanSyncHistoryCollection(user.uid), (snapshot) => {
            setLoanHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanHistory)));
        });
        const unsubInsights = onSnapshot(loanSyncInsightsDoc(user.uid), (doc) => setInsights(doc.exists() ? doc.data() as Insights : null));

        const timer = setTimeout(() => setLoading(false), 1500);
        return () => {
            unsubActive();
            unsubHistory();
            unsubInsights();
            clearTimeout(timer);
        };
    }, [user]);

    const chartData = activeLoan ? [
        { name: 'Amount Repaid', value: activeLoan.amount - activeLoan.remainingBalance, fill: 'hsl(var(--primary))' },
        { name: 'Remaining Balance', value: activeLoan.remainingBalance, fill: 'hsl(var(--muted))' }
    ] : [];

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
                <h1 className="text-4xl font-headline tracking-wider text-foreground">LoanSync</h1>
                <p className="text-muted-foreground font-body text-lg">Your AI-powered credit and loan simulation center.</p>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64"><Loader className="w-12 h-12 animate-spin text-primary" /></div>
            ) : (
            <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="md:col-span-2 lg:col-span-2 bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">Active Loan Dashboard</CardTitle>
                            <CardDescription>Your current active simulated loan.</CardDescription>
                        </CardHeader>
                        {activeLoan ? (
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 h-48 flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <DonutChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="hsl(var(--border))">
                                        </Pie>
                                        <Tooltip contentStyle={{ background: "hsl(var(--background) / 0.9)", borderColor: "hsl(var(--border))" }} />
                                    </DonutChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Type</p><p className="font-bold text-lg">{activeLoan.type}</p></div>
                                <div><p className="text-muted-foreground">Status</p><StatusBadge status={activeLoan.status} /></div>
                                <div><p className="text-muted-foreground">Loan Amount</p><p className="font-bold text-lg">${activeLoan.amount.toLocaleString()}</p></div>
                                <div><p className="text-muted-foreground">Interest Rate</p><p className="font-bold text-lg">{activeLoan.interestRate}%</p></div>
                                <div><p className="text-muted-foreground">Remaining</p><p className="font-bold text-lg">${activeLoan.remainingBalance.toLocaleString()}</p></div>
                                <div><p className="text-muted-foreground">Term</p><p className="font-bold text-lg">{activeLoan.termMonths} months</p></div>
                            </div>
                        </CardContent>
                        ) : (
                            <CardContent className="text-center py-10">
                                <p className="text-muted-foreground">No active loan. Apply for a simulation to get started!</p>
                                {user && <div className="mt-4"><LoanApplicationModal uid={user.uid} /></div>}
                            </CardContent>
                        )}
                    </Card>
                     <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-accent flex items-center gap-2"><Trophy/> Credit Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">AI Credit Score</p>
                                <p className="text-3xl font-bold font-headline">{insights?.creditScore ?? 'N/A'}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Repayment Behavior</p>
                                <p className="text-lg font-semibold">{insights?.repaymentBehavior ?? 'N/A'}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">AI Comment</p>
                                <p className="text-sm italic">"{insights?.AIComment ?? 'No comments available.'}"</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary flex items-center gap-2"><Activity/> Loan Application History</CardTitle>
                        <CardDescription>A log of your past simulated loan applications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>AI Feedback</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loanHistory.map(loan => (
                                    <TableRow key={loan.id}>
                                        <TableCell>{format(loan.submittedAt.toDate(), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="font-medium">{loan.loanType}</TableCell>
                                        <TableCell>${loan.amount.toLocaleString()}</TableCell>
                                        <TableCell><StatusBadge status={loan.status} /></TableCell>
                                        <TableCell className="text-xs italic text-muted-foreground">{loan.feedback}</TableCell>
                                    </TableRow>
                                ))}
                                {loanHistory.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No application history found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardContent>
                        {user && !activeLoan && <div className="mt-4 flex justify-center"><LoanApplicationModal uid={user.uid} /></div>}
                     </CardContent>
                </Card>
            </>
            )}
        </motion.div>
    );
}
