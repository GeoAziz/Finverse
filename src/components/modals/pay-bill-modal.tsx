
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader, Receipt } from 'lucide-react';
import { addPayWaveTransaction } from '@/lib/actions';

interface PayBillModalProps {
    uid: string;
    currentBalance: number;
    currency: string;
}

export function PayBillModal({ uid, currentBalance, currency }: PayBillModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biller, setBiller] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const accountNumber = formData.get('accountNumber') as string;

    if (!biller) {
      toast({ title: 'Biller not selected', description: 'Please select a biller.', variant: 'destructive' });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }
    if (amount > currentBalance) {
        toast({ title: 'Insufficient Funds', description: 'You cannot pay more than your current balance.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);

    try {
      await addPayWaveTransaction({
        uid,
        type: 'pay-bill',
        amount,
        description: `Paid ${biller} bill for A/C ${accountNumber}`,
        status: 'Complete'
      });

      toast({
        title: 'Bill Paid Successfully',
        description: `${currency} ${amount.toFixed(2)} sent to ${biller} for account ${accountNumber}.`,
      });
      setIsOpen(false);
      event.currentTarget.reset();
      setBiller('');

    } catch (error) {
      console.error('Pay bill failed:', error);
      toast({
        title: 'Payment Failed',
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
        <Button variant="outline"><Receipt/> Pay Bill</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Pay a Bill</DialogTitle>
          <DialogDescription>
            Select a biller and enter the payment details. The amount will be deducted from your wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="biller" className="text-right">
                Biller
              </Label>
              <Select name="biller" onValueChange={setBiller} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a biller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZizoNet Internet">ZizoNet Internet</SelectItem>
                  <SelectItem value="Kenya Power">Kenya Power</SelectItem>
                  <SelectItem value="Nairobi Water">Nairobi Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountNumber" className="text-right">
                Account No.
              </Label>
              <Input id="accountNumber" name="accountNumber" placeholder="e.g., 123456-01" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount ({currency})
              </Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="1500.00" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : 'Pay Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
