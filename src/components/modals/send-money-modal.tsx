
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
import { Loader, Send } from 'lucide-react';
import { addPayWaveTransaction } from '@/lib/actions';

interface SendMoneyModalProps {
  uid: string;
  currentBalance: number;
  currency: string;
}

export function SendMoneyModal({ uid, currentBalance, currency }: SendMoneyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const recipient = formData.get('recipient') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const note = formData.get('note') as string;

    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive number.', variant: 'destructive' });
      return;
    }
    
    if (amount > currentBalance) {
        toast({ title: 'Insufficient Funds', description: 'You cannot send more than your current balance.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);

    try {
        await addPayWaveTransaction({
            uid,
            type: 'send',
            amount,
            description: note ? `Sent to ${recipient} - ${note}` : `Sent to ${recipient}`,
            status: 'Complete'
        });

      toast({
        title: 'Transaction Successful',
        description: `${currency} ${amount.toFixed(2)} sent to ${recipient}.`,
      });
      setIsOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      console.error('Send money failed:', error);
      toast({
        title: 'Transaction Failed',
        description: 'Could not complete the transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg"><Send className="mr-2"/> Send Money</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Send Money</DialogTitle>
          <DialogDescription>
            Enter recipient details and the amount to send. The amount will be deducted from your wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
              </Label>
              <Input id="recipient" name="recipient" placeholder="e.g., @alex or 0712345678" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount ({currency})
              </Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="500.00" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input id="note" name="note" placeholder="Optional" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : 'Send Money'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
