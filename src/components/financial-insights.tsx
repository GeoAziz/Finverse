
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { getFinancialInsights } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, PiggyBank, BarChartHorizontal } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Timestamp } from 'firebase/firestore';

interface Transaction {
    id: string;
    type: 'Credit' | 'Debit';
    amount: number;
    description: string;
    category: string;
    timestamp: Timestamp;
}

type FinancialInsightsResult = {
  savingsSuggestions: string;
  investmentSuggestions: string;
};

export default function FinancialInsights({ transactions }: { transactions: Transaction[] }) {
  const [result, setResult] = useState<FinancialInsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (transactions.length === 0) {
      setIsLoading(false);
      return;
    };

    const analyzeData = async () => {
      setIsLoading(true);
      setResult(null);

      // Create a summary of transactions for the AI
      const financialDataSummary = transactions.slice(0, 20).map(t => 
        `${t.timestamp.toDate().toLocaleDateString()}: ${t.type} of $${t.amount} (${t.category}) for "${t.description}"`
      ).join('\n');
      
      const fullSummary = `
        Here is a summary of recent financial transactions. Please analyze this and provide savings and investment suggestions.
        Total transactions: ${transactions.length}
        
        Recent transactions:
        ${financialDataSummary}
      `;

      try {
        const insights = await getFinancialInsights({
          financialData: fullSummary,
          investmentPreferences: 'Moderate risk, long-term growth in tech and renewable energy.'
        });
        setResult(insights);
      } catch (error) {
        console.error('Failed to get financial insights:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch AI financial insights. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    analyzeData();
  }, [transactions, toast]);

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2"><BrainCircuit /> AI Financial Insights</CardTitle>
        <CardDescription>Automated savings and investment suggestions based on your recent financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        )}
        {!isLoading && !result && (
            <div className="text-center text-muted-foreground py-8">
                <p>No financial data available to analyze.</p>
            </div>
        )}
        {result && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-8"
            >
            <Card className="bg-background/50">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-headline text-green-400"><PiggyBank size={20} /> Savings Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-foreground/90 whitespace-pre-line">{result.savingsSuggestions}</p>
                </CardContent>
            </Card>
            <Card className="bg-background/50">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-headline text-cyan-400"><BarChartHorizontal size={20} /> Investment Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-foreground/90 whitespace-pre-line">{result.investmentSuggestions}</p>
                </CardContent>
            </Card>
            </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
