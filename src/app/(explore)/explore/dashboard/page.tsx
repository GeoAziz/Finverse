'use client';

import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Wallet,
  AreaChart,
  ShieldCheck,
  Bitcoin,
  Calculator,
  TrendingUp,
  Landmark,
  ArrowRight,
  Bot,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const moduleIcons: { [key: string]: React.ElementType } = {
  neurobank: BrainCircuit,
  cryptocore: Bitcoin,
  vault: ShieldCheck,
  loansync: AreaChart,
  investhub: TrendingUp,
  taxgrid: Landmark,
  paywave: Wallet,
  idbank: Fingerprint,
};

const moduleData = {
  neurobank: { name: 'NeuroBank', description: 'Smart banking with AI analytics.', href: '/explore/neurobank', enabled: true },
  cryptocore: { name: 'CryptoCore', description: 'Wallet, trading & NFT viewer.', href: '/explore/cryptocore', enabled: true },
  vault: { name: 'SafeVault', description: 'Biometric-protected data vault.', href: '/explore/vault', enabled: true },
  loansync: { name: 'LoanSync', description: 'AI-based loan simulations.', href: '#', enabled: false },
  investhub: { name: 'InvestHub', description: 'AI-guided stock investments.', href: '/explore/investhub', enabled: true },
  taxgrid: { name: 'TaxGrid', description: 'Automated tax calculations.', href: '/explore/taxgrid', enabled: true },
  paywave: { name: 'PayWave', description: 'Mobile wallet & P2P payments.', href: '/explore/paywave', enabled: true },
  idbank: { name: 'IDBank', description: 'Digital identity verification.', href: '/explore/idbank', enabled: true },
};

type Module = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  enabled: boolean;
};

const modules: Module[] = Object.entries(moduleData).map(([key, value]) => ({
    id: key,
    ...value,
    icon: moduleIcons[key]
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const ModuleCard = ({ module }: { module: Module }) => {
  const CardContentWrapper = module.enabled ? Link : 'div';
  const cardProps = module.enabled ? { href: module.href } : {};

  const cardInner = (
    <Card className={`h-full flex flex-col bg-card/70 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20 ${!module.enabled ? 'opacity-50 border-destructive/50 hover:border-destructive/80' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-headline text-primary">{module.name}</CardTitle>
            <module.icon className="h-8 w-8 text-primary/50" />
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
            <div>
                <CardDescription className="mb-4">{module.description}</CardDescription>
                <Badge variant={module.enabled ? 'default' : 'destructive'} className={`${module.enabled ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>{module.enabled ? "Active" : "Account Required"}</Badge>
            </div>
            <div className="w-full mt-4 justify-start p-0 h-auto text-sm text-muted-foreground hover:text-primary flex items-center">
                Explore Module <ArrowRight className="ml-2 h-4 w-4" />
            </div>
        </CardContent>
    </Card>
  );

  if (!module.enabled) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2 } }} className="cursor-pointer h-full">
                    {cardInner}
                </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-2xl text-accent flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8"/> Module Locked: {module.name}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This module contains advanced features that require a verified account. Sign up to unlock personalized rates, instant approval simulations, and real-time financial modeling.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Link href="/login">Create Free Account</Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2 } }} className="h-full">
        <Link href={module.href} passHref className="h-full block">
            {cardInner}
        </Link>
    </motion.div>
  );
};


export default function GuestDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline tracking-wider text-foreground">FinVerse Simulation</h1>
        <p className="text-muted-foreground font-body">Explore the capabilities of Zizo_FinVerse. All data is for demonstration purposes.</p>
      </div>

       <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} />
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
         <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
            <CardHeader>
                <CardTitle className="font-headline text-accent flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-muted-foreground font-body">"Welcome to the Zizo_FinVerse simulation environment. Feel free to explore the active modules to see their core features. For full functionality, including data persistence and advanced AI tools, please create an account."</p>
               <Button asChild className="w-full md:w-auto flex-shrink-0">
                    <Link href="/login">Create Free Account</Link>
               </Button>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

    