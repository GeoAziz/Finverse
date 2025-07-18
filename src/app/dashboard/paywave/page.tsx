
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Wallet, Loader, Receipt, Sparkles, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { paywaveWalletDoc, paywaveTransactionsCollection, paywaveAlertsCollection } from '@/lib/collections';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { SendMoneyModal } from '@/components/modals/send-money-modal';
import { PayBillModal } from '@/components/modals/pay-bill-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface WalletData {
    balance: number;
    currency: string;
    isFrozen: boolean;
}

interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'pay-bill';
    amount: number;
    to?: string;
    from?: string;
    method?: string;
    status: string;
    timestamp: Timestamp;
    description: string;
}

interface AlertData {
    id: string;
    type: string;
    description: string;
    timestamp: Timestamp;
}

export default function PayWavePage() {
    const { user, profile } = useAuth();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const unsubWallet = onSnapshot(paywaveWalletDoc(user.uid), (doc) => {
            setWallet(doc.exists() ? (doc.data() as WalletData) : null);
        });

        const q = query(paywaveTransactionsCollection(user.uid), orderBy('timestamp', 'desc'), limit(10));
        const unsubTransactions = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
        });

        const unsubAlerts = onSnapshot(paywaveAlertsCollection(user.uid), (snapshot) => {
            setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertData)));
        });

        const timer = setTimeout(() => setLoading(false), 1500);

        return () => {
            unsubWallet();
            unsubTransactions();
            unsubAlerts();
            clearTimeout(timer);
        };
    }, [user]);

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader className="w-12 h-12 animate-spin text-primary" /></div>
    }

    if (!wallet) {
        return (
             <motion.div variants={pageVariants} initial="initial" animate="in" exit="out">
                <Card className="bg-card/70 backdrop-blur-sm text-center">
                    <CardHeader><CardTitle className="font-headline text-3xl text-destructive">No PayWave Wallet Found</CardTitle></CardHeader>
                    <CardContent><p>No PayWave data found for your user. Please run `npm run seed:paywave`.</p></CardContent>
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
                <h1 className="text-4xl font-headline tracking-wider text-foreground">PayWave</h1>
                <p className="text-muted-foreground font-body text-lg">Your AI-powered peer-to-peer payment ecosystem.</p>
            </div>
            
            {wallet.isFrozen && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Wallet Frozen</AlertTitle>
                  <AlertDescription>
                    Your wallet has been temporarily frozen due to suspicious activity. Please contact support.
                  </AlertDescription>
                </Alert>
            )}

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Your Wallet</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col justify-center items-center bg-background/50 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground">Wallet Balance</p>
                        <p className="text-5xl font-bold font-headline">{wallet.currency} {wallet.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        <p className="text-xs text-muted-foreground">P2P ID: @{profile?.name?.replace(/\s+/g, '_').toLowerCase()}</p>
                    </div>
                    <div className="flex flex-col justify-center items-center bg-background/50 p-6 rounded-lg space-y-4">
                       <p className="text-sm text-muted-foreground">Quick Actions</p>
                       <div className="flex w-full justify-center gap-4">
                         {user && <SendMoneyModal uid={user.uid} currentBalance={wallet.balance} currency={wallet.currency} />}
                         {user && <PayBillModal uid={user.uid} currentBalance={wallet.balance} currency={wallet.currency} />}
                       </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => {
                                        const isDebit = tx.type !== 'receive';
                                        return (
                                            <TableRow key={tx.id}>
                                                <TableCell><Badge variant={isDebit ? "destructive" : "default"} className="capitalize">{tx.type.replace('-', ' ')}</Badge></TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">{format(tx.timestamp.toDate(), 'PPpp')}</p>
                                                </TableCell>
                                                <TableCell className={`text-right font-semibold font-code ${isDebit ? 'text-red-400' : 'text-green-400'}`}>
                                                    {isDebit ? '-' : '+'} {wallet.currency} {tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-accent flex items-center gap-3"><Sparkles/> Security Alerts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {alerts.length > 0 ? alerts.map(alert => (
                                <Alert key={alert.id} variant="destructive" className="bg-destructive/10 border-destructive/30">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle className="text-destructive font-bold">{alert.type}</AlertTitle>
                                    <AlertDescription>
                                        {alert.description}
                                    </AlertDescription>
                                </Alert>
                             )) : <p className="text-sm text-muted-foreground text-center">No security alerts.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>

        </motion.div>
    );
}
