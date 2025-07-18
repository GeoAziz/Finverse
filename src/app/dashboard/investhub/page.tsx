
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Bot, Loader, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { investhubPortfolioDoc, investhubAssetsCollection, investhubHistoryCollection, investhubInsightsDoc } from '@/lib/collections';
import { onSnapshot, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { InvestmentActionModal } from '@/components/modals/investment-action-modal';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface Portfolio {
    totalValue: number;
    investedAmount: number;
    growth: number;
    riskLevel: string;
    strategy: string;
}
interface Asset {
    id: string;
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
    totalValue: number;
}
interface History {
    id: string;
    type: 'buy' | 'sell';
    symbol: string;
    quantity: number;
    price: number;
    timestamp: Timestamp;
}
interface Insights {
    trendingAssets: string[];
    performance24h: string;
    suggestion: string;
    AIComment: string;
}

const RiskBadge = ({ risk }: { risk: string }) => {
    const variant = {
        'Low': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'High': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    }[risk] || 'default';
    return <Badge className={variant}>{risk}</Badge>;
}

export default function InvestHubPage() {
    const { user, profile } = useAuth();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [history, setHistory] = useState<History[]>([]);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        
        const unsubPortfolio = onSnapshot(investhubPortfolioDoc(user.uid), (doc) => setPortfolio(doc.data() as Portfolio));
        const unsubAssets = onSnapshot(investhubAssetsCollection(user.uid), (snapshot) => {
            setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset)))
        });
        const unsubHistory = onSnapshot(investhubHistoryCollection(user.uid), (snapshot) => {
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as History)))
        });
        const unsubInsights = onSnapshot(investhubInsightsDoc(user.uid), (doc) => setInsights(doc.data() as Insights));

        // Let's assume loading is done after a short moment, as data streams in.
        const timer = setTimeout(() => setLoading(false), 1500);

        return () => {
            unsubPortfolio();
            unsubAssets();
            unsubHistory();
            unsubInsights();
            clearTimeout(timer);
        };
    }, [user]);

    const growthIsPositive = (portfolio?.growth ?? 0) >= 0;

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
                <h1 className="text-4xl font-headline tracking-wider text-foreground">Welcome to InvestHub, {profile?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground font-body text-lg">Your AI-guided command center for the markets.</p>
            </div>
            
             {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : !portfolio ? (
                <Card className="bg-card/70 backdrop-blur-sm text-center">
                    <CardHeader><CardTitle className="text-destructive font-headline">No Investment Portfolio Found</CardTitle></CardHeader>
                    <CardContent><p>No InvestHub portfolio data found. Please run `npm run seed` to generate it.</p></CardContent>
                </Card>
            ) : (
                <>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-card/70 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium">Total Invested</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold font-headline">${(portfolio.investedAmount || 0).toLocaleString()}</p></CardContent></Card>
                        <Card className="bg-card/70 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium">Current Value</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold font-headline">${(portfolio.totalValue || 0).toLocaleString()}</p></CardContent></Card>
                        <Card className="bg-card/70 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium">Growth</CardTitle></CardHeader><CardContent><p className={`text-3xl font-bold font-headline ${growthIsPositive ? 'text-green-400' : 'text-red-400'}`}>{growthIsPositive ? '+' : ''}{(portfolio.growth || 0).toFixed(2)}%</p></CardContent></Card>
                        <Card className="bg-card/70 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm font-medium">Strategy</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold font-headline text-primary">{portfolio.strategy}</p></CardContent></Card>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                             <Card className="bg-card/70 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="font-headline text-primary">Active Assets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Symbol</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead className="text-right">Value (USD)</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {assets.map(asset => (
                                            <TableRow key={asset.id}>
                                                <TableCell className="font-medium font-code">{asset.symbol}</TableCell>
                                                <TableCell>{asset.name}</TableCell>
                                                <TableCell>{asset.quantity}</TableCell>
                                                <TableCell className="text-right font-semibold">${(asset.totalValue || 0).toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {user && <InvestmentActionModal action="Buy" asset={asset} uid={user.uid} />}
                                                        {user && <InvestmentActionModal action="Sell" asset={asset} uid={user.uid} />}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                             <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
                                <CardHeader>
                                    <CardTitle className="font-headline text-accent flex items-center gap-3"><Bot/> Zizo AI Insights</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <h4 className="font-bold">24h Performance</h4>
                                        <p className={`text-lg font-semibold ${(insights?.performance24h || '').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{insights?.performance24h}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">AI Suggestion</h4>
                                        <p className="text-sm text-muted-foreground italic">"{insights?.suggestion}"</p>
                                    </div>
                                     <div>
                                        <h4 className="font-bold">AI Comment</h4>
                                        <p className="text-sm text-muted-foreground italic">"{insights?.AIComment}"</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                   </div>

                    <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Symbol</TableHead><TableHead>Quantity</TableHead><TableHead>Price</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {history.slice(0, 5).map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell><Badge variant={tx.type === 'buy' ? 'default' : 'destructive'} className="capitalize">{tx.type}</Badge></TableCell>
                                            <TableCell className="font-code">{tx.symbol}</TableCell>
                                            <TableCell>{tx.quantity}</TableCell>
                                            <TableCell>${tx.price.toFixed(2)}</TableCell>
                                            <TableCell>{format(tx.timestamp.toDate(), 'MMM d, yyyy')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </motion.div>
    );
}
