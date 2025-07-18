
'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { updateInvestment } from '@/lib/actions';

interface Asset {
    id: string;
    symbol: string;
    name: string;
    totalValue: number;
}

interface InvestmentActionModalProps {
  action: 'Buy' | 'Sell';
  asset: Asset;
  uid: string;
}

export function InvestmentActionModal({ action, asset, uid }: InvestmentActionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive number.', variant: 'destructive' });
      return;
    }
    
    if (action === 'Sell' && numericAmount > asset.totalValue) {
      toast({ title: 'Insufficient Holdings', description: 'You cannot sell more than you own.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      await updateInvestment({
        uid,
        assetId: asset.id,
        amount: numericAmount,
        type: action
      });
      
      toast({
        title: 'Transaction Successful',
        description: `Successfully ${action.toLowerCase() === 'buy' ? 'bought' : 'sold'} ${numericAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} of ${asset.name}.`,
      });
      setIsOpen(false);
      setAmount('');
    } catch (error) {
      console.error('Investment update failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not complete the transaction. Please try again.';
      toast({
        title: 'Transaction Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={action === 'Buy' ? 'default' : 'destructive'} className="w-16">
          {action}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">{action} {asset.name} ({asset.symbol})</DialogTitle>
          <DialogDescription>
            Enter the amount in USD to {action.toLowerCase()}. Your portfolio will be updated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (USD)
              </Label>
              <Input 
                id="amount" 
                name="amount"
                type="number" 
                step="0.01" 
                placeholder="100.00" 
                className="col-span-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)} 
                required />
            </div>
            <p className="text-sm text-muted-foreground text-center">Current holding value: ${asset.totalValue.toLocaleString()}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : `Confirm ${action}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
