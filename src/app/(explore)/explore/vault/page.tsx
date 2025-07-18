'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { KeyRound, FileText, Shield, PlusCircle, Upload, Lock, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const mockDocuments = [
  { id: '1', title: 'Quantum Wallet Seed Phrase', type: 'Private Key', date: '2023-10-15', icon: KeyRound, size: '1 KB' },
  { id: '2', title: 'Last Will & Testament.pdf', type: 'Document', date: '2023-09-02', icon: FileText, size: '256 KB' },
  { id: '3', title: 'Corporate Espionage Files (Encrypted)', type: 'Document', date: '2023-08-21', icon: FileText, size: '1.2 GB' },
  { id: '4', title: 'Digital ID - Passport Scan', type: 'ID Scan', date: '2023-05-11', icon: Shield, size: '5.3 MB' },
  { id: '5', title: 'Server Access Keys', type: 'Private Key', date: '2023-01-30', icon: KeyRound, size: '2 KB' },
];

export default function VaultGuestPage() {
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
                <CardTitle className="font-headline text-4xl tracking-wider text-primary flex items-center justify-center gap-4"><Shield className="w-10 h-10"/>SafeVault</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Encrypted. Biometrics locked. This is your personal digital vault for keys, IDs, and confidential files.
                </CardDescription>
            </Card>

             <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Encrypted Document Simulation</CardTitle>
                    <CardDescription>All documents are encrypted with multi-factor authentication. Actions are disabled in guest mode.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end gap-2 mb-4">
                        <Button variant="outline" disabled>
                            <PlusCircle className="mr-2" /> Add New
                        </Button>
                        <Button disabled>
                            <Upload className="mr-2" /> Upload File
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockDocuments.map((doc) => (
                                <TableRow key={doc.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <doc.icon className="h-5 w-5 text-primary/70" />
                                            <span className="font-medium">{doc.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                                    <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" disabled>
                                            <Lock className="h-4 w-4 text-primary" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
             <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent flex items-center gap-3"><Lock/>Locked Features</CardTitle>
                    <CardDescription>Sign in to unlock military-grade security for your digital assets.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-center">
                    <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Upload className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Secure Uploads</h3>
                        <p className="text-sm text-muted-foreground">Upload and encrypt any file type with end-to-end encryption.</p>
                    </div>
                     <div className="p-6 bg-background/50 rounded-lg opacity-50">
                        <Fingerprint className="mx-auto w-10 h-10 mb-2 text-accent"/>
                        <h3 className="font-bold">Biometric Unlock</h3>
                        <p className="text-sm text-muted-foreground">Access your files securely with fingerprint or face ID.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
                <CardTitle className="font-headline text-2xl tracking-wide">Lock down your digital life.</CardTitle>
                <CardDescription className="text-muted-foreground">Get started with Zizo’s futuristic vault tech.</CardDescription>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/login">Create Your Free Account</Link>
                </Button>
            </Card>

        </motion.div>
    );
}
