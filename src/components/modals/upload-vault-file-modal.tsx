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
import { Loader, Upload } from 'lucide-react';
import { uploadToVault } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface UploadVaultFileModalProps {
  uid: string;
}

export function UploadVaultFileModal({ uid }: UploadVaultFileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [isBiometric, setIsBiometric] = useState(false);
  const [tags, setTags] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }
    if (!category) {
      toast({ title: 'Category required', description: 'Please select a category for the document.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await uploadToVault({ 
        uid, 
        file,
        category,
        isBiometric,
        tags: tagsArray
      });
      
      toast({
        title: 'File Uploaded Successfully',
        description: `${file.name} has been securely stored in your vault.`,
      });
      setIsOpen(false);
      // Reset form state
      setFile(null);
      setCategory('');
      setIsBiometric(false);
      setTags('');
      (event.target as HTMLFormElement).reset();

    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Upload className="mr-2" /> Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Upload to SafeVault</DialogTitle>
          <DialogDescription>
            Select a file to encrypt and store securely in your vault. Add metadata to organize your documents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">File</Label>
              <Input id="file" type="file" className="col-span-3" onChange={handleFileChange} required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select name="category" onValueChange={setCategory} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Identity">Identity</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">Tags</Label>
              <Input id="tags" placeholder="tax, 2024, confidential" className="col-span-3" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
             <div className="flex items-center justify-between mt-2 pl-4 pr-1">
              <Label htmlFor="biometric-lock" className="">Require Biometric Lock</Label>
              <Switch id="biometric-lock" checked={isBiometric} onCheckedChange={setIsBiometric} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? <Loader className="animate-spin" /> : 'Upload and Encrypt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
