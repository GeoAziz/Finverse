'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Mic, Send, BrainCircuit, Loader as LoaderIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { aiVoiceAssistant } from '@/ai/flows/ai-voice-assistant';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getDocs, query, orderBy } from 'firebase/firestore';
import { neurobankTransactionsCollection } from '@/lib/collections';

export default function AiVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
        toast({
          title: "Playback Error",
          description: "Could not play the audio response.",
          variant: "destructive",
        });
      });
    }
  }, [audioUrl, toast]);

  const getFinancialDataSummary = async () => {
      if (!user) return "No user is logged in.";
      
      const q = query(
          neurobankTransactionsCollection(user.uid),
          orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => doc.data());

      if (transactions.length === 0) {
        return "No financial data available to summarize.";
      }

      // Create a simple text summary of the data
      const summary = transactions.slice(0, 10).map(t => 
        `${t.type} of ${t.amount} for ${t.description} on ${t.timestamp.toDate().toLocaleDateString()}`
      ).join('\n');

      return `Here are the latest transactions:\n${summary}`;
  }

  const handleFinancialSummary = async () => {
    setIsLoading(true);
    setAudioUrl(null);
    setQueryText(''); // Clear text area

    try {
        const financialData = await getFinancialDataSummary();
        const result = await aiVoiceAssistant({ query: "Summarize my finances.", financialData });
        setAudioUrl(result.media);
    } catch (error) {
        console.error('AI Financial Summary Error:', error);
        toast({
            title: 'An Error Occurred',
            description: 'Failed to get a financial summary.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setIsLoading(true);
    setAudioUrl(null);

    try {
      const result = await aiVoiceAssistant({ query: queryText });
      setAudioUrl(result.media);
    } catch (error) {
      console.error('AI Voice Assistant Error:', error);
      toast({
        title: 'An Error Occurred',
        description: 'Failed to get a response from the AI assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="icon"
              className="rounded-full w-12 h-12 shadow-lg shadow-primary/30"
              aria-label="Open AI Assistant"
            >
              <Bot className="w-6 h-6" />
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
              <Bot /> AI Voice Assistant
            </DialogTitle>
            <DialogDescription>
              Your personal financial guide. Ask a question or get a summary.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button 
                onClick={handleFinancialSummary}
                disabled={isLoading}
                className="w-full mb-4"
                variant="outline"
            >
                {isLoading && !queryText && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                <BrainCircuit className="mr-2 h-4 w-4" />
                Summarize My Finances
            </Button>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <Textarea
                placeholder="Or type a question, e.g., 'What are the current market trends?'"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                rows={3}
                className="bg-background/50"
                disabled={isLoading}
                />
                 <div className="flex justify-between items-center mt-2">
                    <Button type="button" variant="ghost" size="icon" disabled={isLoading}>
                        <Mic className="h-5 w-5" />
                    </Button>
                    <Button type="submit" disabled={isLoading || !queryText.trim()}>
                        {isLoading && queryText && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="h-5 w-5 mr-2" />
                        Send
                    </Button>
                </div>
            </form>

            {isLoading && (
              <div className="space-y-2 mt-4">
                <p className="text-sm text-center text-muted-foreground animate-pulse">Generating audio response...</p>
                <Skeleton className="h-12 w-full" />
              </div>
            )}
             {audioUrl && (
              <div className="mt-4">
                <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
