
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
import { Loader, FilePlus } from 'lucide-react';
import { applyForLoan } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface LoanApplicationModalProps {
  uid: string;
}

export function LoanApplicationModal({ uid }: LoanApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loanType, setLoanType] = useState('');
  const [term, setTerm] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const purpose = formData.get('purpose') as string;
    
    if (!loanType || !term) {
      toast({ title: 'Missing Information', description: 'Please select a type and term.', variant: 'destructive' });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid loan amount.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await applyForLoan({
        uid,
        amount,
        termMonths: parseInt(term),
        purpose,
        loanType
      });

      toast({
        title: `Application ${result.status}`,
        description: result.justification,
        variant: result.status === 'Rejected' ? 'destructive' : 'default',
        duration: 5000,
      });
      setIsOpen(false);
      event.currentTarget.reset();
      setLoanType('');
      setTerm('');

    } catch (error) {
      console.error('Loan application failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not complete the application.';
      toast({
        title: 'Application Failed',
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
        <Button className="w-full max-w-xs h-auto text-lg py-4"><FilePlus className="mr-2" /> New Loan Simulation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">New Loan Simulation</DialogTitle>
          <DialogDescription>
            Our AI will assess your request and provide an instant simulated decision. This will not affect your credit score.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loanType" className="text-right">
                Loan Type
              </Label>
              <Select name="loanType" onValueChange={setLoanType} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (KES)
              </Label>
              <Input id="amount" name="amount" type="number" placeholder="25000" className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term
              </Label>
              <Select name="term" onValueChange={setTerm} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose" className="text-right">
                Purpose
              </Label>
              <Textarea id="purpose" name="purpose" placeholder="Briefly describe the loan's purpose" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : 'Simulate Approval'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
