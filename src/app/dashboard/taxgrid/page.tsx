
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Landmark, FileDigit, Percent, Upload, Bot, Loader, BarChart, ArrowDown, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { 
    taxGridSummaryDoc, 
    taxGridAiInsightsDoc, 
    taxGridIncomeSourcesCollection,
    taxGridDeductionsCollection,
    taxGridFilingsCollection
} from '@/lib/collections';
import { onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface TaxSummary {
    netTaxable: number;
    taxBracket: 'Low' | 'Medium' | 'High';
    estimatedTax: number;
    status: 'Pending' | 'Filed' | 'Draft';
}

interface AiInsights {
    comment: string;
    savingsTips: string;
}

interface IncomeSource {
    id: string;
    source: string;
    amount: number;
    dateReceived: Timestamp;
    syncedFrom: string | null;
}

interface Deduction {
    id: string;
    type: string;
    amount: number;
    date: Timestamp;
}

interface Filing {
    id: string;
    period: string;
    filedOn: Timestamp;
    status: string;
    totalTax: number;
}


const BracketBadge = ({ bracket }: { bracket: string }) => {
    const variant = {
        'Low': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'High': 'bg-red-500/20 text-red-300 border-red-500/50',
    }[bracket] || 'default';
    return <Badge className={`capitalize ${variant}`}>{bracket}</Badge>;
}
const StatusBadge = ({ status }: { status: string }) => {
    const variant = {
        'Filed': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'Draft': 'bg-primary/20 text-primary-300 border-primary/50',
    }[status] || 'default';
    return <Badge className={`capitalize ${variant}`}>{status}</Badge>;
}

export default function TaxGridPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState<TaxSummary | null>(null);
    const [insights, setInsights] = useState<AiInsights | null>(null);
    const [income, setIncome] = useState<IncomeSource[]>([]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubs: (()=>void)[] = [];

        unsubs.push(onSnapshot(taxGridSummaryDoc(user.uid), (doc) => setSummary(doc.data() as TaxSummary)));
        unsubs.push(onSnapshot(taxGridAiInsightsDoc(user.uid), (doc) => setInsights(doc.data() as AiInsights)));
        unsubs.push(onSnapshot(taxGridIncomeSourcesCollection(user.uid), (snap) => setIncome(snap.docs.map(d => ({id: d.id, ...d.data()}) as IncomeSource))));
        unsubs.push(onSnapshot(taxGridDeductionsCollection(user.uid), (snap) => setDeductions(snap.docs.map(d => ({id: d.id, ...d.data()}) as Deduction))));
        unsubs.push(onSnapshot(taxGridFilingsCollection(user.uid), (snap) => setFilings(snap.docs.map(d => ({id: d.id, ...d.data()}) as Filing))));

        const timer = setTimeout(() => setLoading(false), 1500);
        unsubs.push(() => clearTimeout(timer));

        return () => unsubs.forEach(unsub => unsub());
    }, [user]);

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader className="w-12 h-12 animate-spin text-primary" /></div>;
    }

    if (!summary) {
        return (
            <motion.div variants={pageVariants} initial="initial" animate="in" exit="out">
                <Card className="bg-card/70 backdrop-blur-sm text-center">
                    <CardHeader><CardTitle className="font-headline text-3xl text-destructive">No TaxGrid Data Found</CardTitle></CardHeader>
                    <CardContent><p>No TaxGrid data found for your user. Please run `npm run seed:taxgrid`.</p></CardContent>
                </Card>
            </motion.div>
        );
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
                <h1 className="text-4xl font-headline tracking-wider text-foreground">TaxGrid</h1>
                <p className="text-muted-foreground font-body text-lg">Your AI-powered tax simulation and analysis hub.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Net Taxable</CardTitle><FileDigit className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-3xl font-bold font-headline">KES {summary.netTaxable.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tax Bracket</CardTitle><BarChart className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><BracketBadge bracket={summary.taxBracket} /></CardContent>
                </Card>
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Estimated Tax</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-3xl font-bold font-headline">KES {summary.estimatedTax.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Filing Status</CardTitle><Landmark className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><StatusBadge status={summary.status} /></CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader><CardTitle className="font-headline text-primary flex items-center gap-2"><ArrowUp /> Income Sources</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {income.map(i => (
                                    <TableRow key={i.id}><TableCell>{i.source}</TableCell><TableCell>KES {i.amount.toLocaleString()}</TableCell><TableCell>{format(i.dateReceived.toDate(), 'MMM d, yyyy')}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader><CardTitle className="font-headline text-primary flex items-center gap-2"><ArrowDown/> Deductions</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                 {deductions.map(d => (
                                    <TableRow key={d.id}><TableCell>{d.type}</TableCell><TableCell>KES {d.amount.toLocaleString()}</TableCell><TableCell>{format(d.date.toDate(), 'MMM d, yyyy')}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader><CardTitle className="font-headline text-primary">Historical Filings</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead>Filed On</TableHead><TableHead className="text-right">Total Tax</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filings.map(f => (
                                <TableRow key={f.id}><TableCell>{f.period}</TableCell><TableCell><StatusBadge status={f.status} /></TableCell><TableCell>{format(f.filedOn.toDate(), 'MMM d, yyyy')}</TableCell><TableCell className="text-right">KES {f.totalTax.toLocaleString()}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
                <CardHeader><CardTitle className="font-headline text-accent flex items-center gap-3"><Bot/> AI Insights</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-bold text-lg">AI Comment</h4>
                        <p className="text-sm text-muted-foreground italic">"{insights?.comment}"</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-lg">Savings Tip</h4>
                        <p className="text-sm text-muted-foreground italic">"{insights?.savingsTips}"</p>
                    </div>
                    <Button variant="outline" disabled>Simulate 'What If?' Scenario</Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

    