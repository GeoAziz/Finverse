
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { cryptocoreCollection, cryptocoreTokensCollection, cryptocoreNftsCollection, cryptocoreInsightsDoc } from '@/lib/collections';
import { onSnapshot, DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, QrCode, Bot } from 'lucide-react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { CryptoActionModal } from '@/components/modals/crypto-action-modal';
import { toast } from '@/hooks/use-toast';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface Token {
    id: string;
    name: string;
    symbol: string;
    balance: number;
    valueUSD: number;
    pricePerToken: number;
}

interface Nft {
    id: string;
    name: string;
    imageURL: string;
    chain: string;
    estValueUSD: number;
}

interface Wallet extends DocumentData {
    id: string;
    walletName: string;
    totalValue: number;
    defaultCurrency: string;
}

interface Insights {
    volatility: string;
    growth7d: string;
    riskLevel: string;
    aiComment: string;
}

const coinMetadata: { [key: string]: { icon: string, hint: string } } = {
    'BTC': { icon: 'https://placehold.co/40x40/F7931A/000000?text=B', hint: 'Bitcoin logo' },
    'ETH': { icon: 'https://placehold.co/40x40/627EEA/FFFFFF?text=E', hint: 'Ethereum logo' },
    'SOL': { icon: 'https://placehold.co/40x40/9945FF/FFFFFF?text=S', hint: 'Solana logo' },
    'CYT': { icon: 'https://placehold.co/40x40/00FFFF/000000?text=C', hint: 'Cyber-Token logo' },
};


export default function CryptoCorePage() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        // Listen to the user's wallets collection
        const walletsUnsub = onSnapshot(cryptocoreCollection(user.uid), (walletSnapshot) => {
            if (walletSnapshot.empty) {
                setLoading(false);
                setWallet(null);
                setTokens([]);
                setNfts([]);
                setInsights(null);
                return;
            }

            // Assume one wallet per user for this app
            const walletDoc = walletSnapshot.docs[0];
            const walletData = { id: walletDoc.id, ...walletDoc.data() } as Wallet;
            setWallet(walletData);

            // Create an array of unsubscribers for sub-collections
            const subUnsubs: (()=>void)[] = [];
            
            // Fetch subcollections for the found wallet
            subUnsubs.push(onSnapshot(cryptocoreTokensCollection(user.uid, walletDoc.id), (snapshot) => {
                setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Token)));
            }));

            subUnsubs.push(onSnapshot(cryptocoreNftsCollection(user.uid, walletDoc.id), (snapshot) => {
                setNfts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Nft)));
            }));

            subUnsubs.push(onSnapshot(cryptocoreInsightsDoc(user.uid, walletDoc.id), (doc) => {
                setInsights(doc.data() as Insights);
            }));
            
            setLoading(false);

            // Return a function to unsubscribe from all sub-collection listeners when the wallet changes
            return () => {
                subUnsubs.forEach(unsub => unsub());
            };
        }, (error) => {
            console.error("Error fetching CryptoCore wallet: ", error);
            setLoading(false);
        });

        return () => {
            walletsUnsub();
        };
        
    }, [user]);
    
    const showToast = () => {
        toast({
            title: "Feature Coming Soon",
            description: "This functionality is currently under development.",
        });
    };

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
                <h1 className="text-4xl font-headline tracking-wider text-foreground">CryptoCore</h1>
                <p className="text-muted-foreground font-body text-lg">{wallet?.walletName ?? 'Your digital asset vault.'}</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : !wallet ? (
                 <Card className="bg-card/70 backdrop-blur-sm text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-destructive">No Crypto Wallet Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No CryptoCore wallet data found for your user. Please contact an administrator or run the `seed` script.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 bg-card/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline text-primary">Asset Wallets</CardTitle>
                                <CardDescription>A summary of your digital assets.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Balance</TableHead>
                                            <TableHead className="text-right">Value (USD)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tokens.map(token => {
                                            const meta = coinMetadata[token.symbol];
                                            return (
                                            <TableRow key={token.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        {meta && <Image src={meta.icon} alt={token.name} width={40} height={40} className="rounded-full" data-ai-hint={meta.hint}/>}
                                                        <div>
                                                            <div className="font-medium">{token.name}</div>
                                                            <div className="text-sm text-muted-foreground">{token.symbol}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{Number(token.balance).toFixed(4)}</TableCell>
                                                <TableCell className="text-right font-semibold">${Number(token.valueUSD).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline text-primary">Portfolio Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col justify-between h-full">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                                    <p className="text-4xl font-bold font-headline break-words">${(wallet.totalValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                    <p className={`text-lg ${insights?.growth7d?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{insights?.growth7d ?? '0.00%'} (last 7d)</p>
                                </div>
                                <div className="flex flex-col gap-2 mt-6">
                                    <CryptoActionModal action="Send" wallets={tokens.map(t => ({id: t.id, coin: t.name, balance: t.balance}))} />
                                    <Button variant="outline" onClick={showToast}><QrCode /> Receive</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">NFT Collection</CardTitle>
                            <CardDescription>A preview of your NFT collection.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                                <CarouselContent>
                                    {nfts.map((nft) => (
                                        <CarouselItem key={nft.id} className="md:basis-1/3 lg:basis-1/4">
                                        <div className="p-1">
                                            <Card className="bg-background/50 overflow-hidden group">
                                            <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                                                <Image src={nft.imageURL} alt={nft.name} width={200} height={200} data-ai-hint="futuristic art" />
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-center text-white p-2">
                                                        <p className="font-bold">{nft.name}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            </Card>
                                        </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-accent flex items-center gap-3"><Bot/> AI Trading Tools</CardTitle>
                            <CardDescription>Premium tools to enhance your trading strategy.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4 text-center">
                            <div className="p-6 bg-background/50 rounded-lg">
                                <h3 className="font-bold">Live Trading Panel</h3>
                                <p className="text-sm text-muted-foreground">Execute trades across multiple chains instantly.</p>
                                 <Button className="mt-2" onClick={showToast}>Launch Trader</Button>
                            </div>
                            <div className="p-6 bg-background/50 rounded-lg">
                                <h3 className="font-bold">AI Insights</h3>
                                <p className="text-sm text-muted-foreground italic">"{insights?.aiComment ?? 'No insights available.'}"</p>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </motion.div>
    );
}
