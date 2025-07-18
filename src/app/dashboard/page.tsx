
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
  Loader,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { moduleConfigDoc } from '@/lib/collections';
import { getDoc } from 'firebase/firestore';

const moduleIcons: { [key: string]: React.ElementType } = {
  neurobank: BrainCircuit,
  loansync: AreaChart,
  safevault: ShieldCheck,
  cryptocore: Bitcoin,
  econosim: Calculator,
  investhub: TrendingUp,
  taxgrid: Landmark,
  paywave: Wallet,
  idbank: Fingerprint,
};

const moduleData: { [key: string]: { name: string; description: string; href: string } } = {
  neurobank: { name: 'NeuroBank', description: 'Smart banking with AI analytics.', href: '/dashboard/neurobank' },
  cryptocore: { name: 'CryptoCore', description: 'Wallet, trading & NFT viewer.', href: '/dashboard/cryptocore' },
  investhub: { name: 'InvestHub', description: 'AI-guided stock investments.', href: '/dashboard/investhub' },
  safevault: { name: 'SafeVault', description: 'Biometric-protected data vault.', href: '/dashboard/vault' },
  idbank: { name: 'IDBank', description: 'Digital identity verification.', href: '/dashboard/idbank' },
  paywave: { name: 'PayWave', description: 'P2P payment ecosystem.', href: '/dashboard/paywave' },
  loansync: { name: 'LoanSync', description: 'AI-based loan simulations.', href: '/dashboard/loansync' },
  taxgrid: { name: 'TaxGrid', description: 'Automated tax calculations.', href: '/dashboard/taxgrid' },
  econosim: { name: 'EconoSim', description: 'Financial learning simulator.', href: '/dashboard/econosim' },
};

type Module = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  status: 'Online' | 'Offline' | 'Maintenance';
};

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
  const isOnline = module.status === 'Online';
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
        <Card className={`h-full flex flex-col bg-card/70 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20 ${!isOnline ? 'opacity-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-headline text-primary">{module.name}</CardTitle>
                <module.icon className="h-8 w-8 text-primary/50" />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                    <CardDescription className="mb-4">{module.description}</CardDescription>
                    <Badge variant={isOnline ? 'default' : 'destructive'} className={`${isOnline ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>{module.status}</Badge>
                </div>
                <Link href={isOnline ? module.href : '#'} passHref>
                    <Button variant="ghost" className={`w-full mt-4 justify-start p-0 h-auto text-sm text-muted-foreground hover:text-primary flex items-center ${!isOnline ? 'pointer-events-none' : ''}`}>
                        Launch Module <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    </motion.div>
  );
};


export default function DashboardPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModuleConfig = async () => {
      try {
        const docSnap = await getDoc(moduleConfigDoc());
        if (docSnap.exists()) {
          const config = docSnap.data();
          const enabledModules = Object.entries(config)
            .filter(([_, isEnabled]) => isEnabled)
            .map(([key]) => {
              const data = moduleData[key as keyof typeof moduleData];
              const icon = moduleIcons[key as keyof typeof moduleIcons];
              // Ensure we don't try to render a module that doesn't have data
              if (!data) return null;
              return {
                id: key,
                ...data,
                icon: icon || BrainCircuit,
                status: 'Online', // You could expand this logic
              };
            }).filter(Boolean) as Module[]; // filter out any nulls
          setModules(enabledModules);
        }
      } catch (error) {
        console.error("Error fetching module config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModuleConfig();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline tracking-wider text-foreground">Module Galaxy</h1>
        <p className="text-muted-foreground font-body">Your personal financial universe. Click a module to begin.</p>
      </div>

       <motion.div
         variants={itemVariants}
       >
         <Card className="bg-card/70 backdrop-blur-sm border-primary/20">
           <CardHeader>
             <CardTitle className="font-headline text-primary">Quick Stats</CardTitle>
             <CardDescription>Real-time overview of your FinVerse.</CardDescription>
           </CardHeader>
           <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
               <p className="text-3xl font-bold font-headline">$1,2M</p>
               <p className="text-xs text-green-400">+2.1% from last month</p>
             </div>
             <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Crypto Portfolio</p>
               <p className="text-3xl font-bold font-headline">$350K</p>
                <p className="text-xs text-red-400">-5.4% from last week</p>
             </div>
             <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
               <p className="text-3xl font-bold font-headline">850</p>
               <Progress value={85} className="h-2"/>
             </div>
              <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
               <p className="text-3xl font-bold font-headline">2</p>
                <p className="text-xs text-muted-foreground">Next payment in 15 days</p>
             </div>
           </CardContent>
         </Card>
       </motion.div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
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
      )}

    </div>
  );
}
