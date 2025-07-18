'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bitcoin, Send, QrCode, Lock, AreaChart, Bot } from 'lucide-react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const mockWallets = [
  { id: '1', coin: 'Bitcoin', symbol: 'BTC', balance: '1.25', value: '75,123.45', icon: 'https://placehold.co/40x40/F7931A/000000?text=B' },
  { id: '2', coin: 'Ethereum', symbol: 'ETH', balance: '15.80', value: '47,400.60', icon: 'https://placehold.co/40x40/627EEA/FFFFFF?text=E' },
  { id: '3', coin: 'Solana', symbol: 'SOL', balance: '250.33', value: '42,556.10', icon: 'https://placehold.co/40x40/9945FF/FFFFFF?text=S' },
  { id: '4', coin: 'Cyber-Token', symbol: 'CYT', balance: '10,000', value: '1,250.00', icon: 'https://placehold.co/40x40/00FFFF/000000?text=C' },
];

const mockNfts = [
    { id: 1, name: 'CryptoPunk #420', image: 'https://placehold.co/200x200', hint: 'pixelated avatar' },
    { id: 2, name: 'Bored Ape #1337', image: 'https://placehold.co/200x200', hint: 'cartoon ape' },
    { id: 3, name: 'Mecha-Kaiju #001', image: 'https://placehold.co/200x200', hint: 'robot monster' },
    { id: 4, name: 'Ether Rock #69', image: 'https://placehold.co/200x200', hint: 'cartoon rock' },
    { id: 5, name: 'Art Block #789', image: 'https://placehold.co/200x200', hint: 'abstract art' },
];

export default function CryptoCoreGuestPage() {
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
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><Bitcoin className="w-10 h-10"/>CryptoCore</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    A unified vault for all your digital assets – powered by Zizo_CryptoCore. From NFTs to DeFi, it's your blockchain cockpit.
                </CardDescription>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary">Asset Wallets</CardTitle>
                        <CardDescription>A summary of your simulated digital assets.</CardDescription>
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
                                {mockWallets.map(wallet => (
                                    <TableRow key={wallet.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Image src={wallet.icon} alt={wallet.coin} width={40} height={40} className="rounded-full" data-ai-hint={`${wallet.coin} logo`}/>
                                                <div>
                                                    <div className="font-medium">{wallet.coin}</div>
                                                    <div className="text-sm text-muted-foreground">{wallet.symbol}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{wallet.balance}</TableCell>
                                        <TableCell className="text-right font-semibold">${wallet.value}</TableCell>
                                    </TableRow>
                                ))}
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
                            <p className="text-5xl font-bold font-headline">$166,330.15</p>
                            <p className="text-lg text-green-400">+5.2% (last 24h)</p>
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            <Button disabled><Send /> Send / Withdraw</Button>
                            <Button variant="outline" disabled><QrCode /> Receive</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

             <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">NFT Viewer</CardTitle>
                    <CardDescription>A preview of your simulated NFT collection. Full details require an account.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                        <CarouselContent>
                            {mockNfts.map((nft) => (
                                <CarouselItem key={nft.id} className="md:basis-1/3 lg:basis-1/4">
                                <div className="p-1">
                                    <Card className="bg-background/50 overflow-hidden group">
                                    <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                                        <Image src={nft.image} alt={nft.name} width={200} height={200} data-ai-hint={nft.hint} />
                                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-100 group-hover:opacity-100">
                                            <div className="text-center text-white p-2">
                                                <Lock className="w-8 h-8 mx-auto mb-2"/>
                                                <p className="font-bold">{nft.name}</p>
                                                <p className="text-xs">Sign in to view</p>
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

            <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock these premium trading and analysis tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Bot className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Live Trading Panel</h3>
                        <p className="text-sm text-muted-foreground">Execute trades across multiple chains instantly.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <AreaChart className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Portfolio Heat Map</h3>
                        <p className="text-sm text-muted-foreground">Visualize your asset performance in real-time.</p>
                    </div>
                </CardContent>
            </Card>

             <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Own crypto?</CardTitle>
                <CardDescription className="text-muted-foreground">Let Zizo_CryptoCore track it all — securely and intelligently.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>
        </motion.div>
    );
}
