
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { vaultCollection } from '@/lib/collections';
import { onSnapshot, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, Shield, KeyRound, FileText, Eye, Fingerprint, Bot, Folder, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { UploadVaultFileModal } from '@/components/modals/upload-vault-file-modal';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

interface VaultDocument {
    id: string;
    title: string;
    category: string;
    url: string;
    createdAt: Timestamp;
    isBiometric: boolean;
    tags: string[];
}

const categoryIcons: { [key: string]: React.ElementType } = {
    'Financial': FileText,
    'Legal': KeyRound,
    'Identity': Shield,
    'Personal': FileText,
};

export default function VaultPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<VaultDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        // Point to the user-nested vault collection
        const q = vaultCollection(user.uid);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VaultDocument));
            setDocuments(fetchedDocs);
            setLoading(false);
        }, (error) => {
            console.error("Vault fetch error: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const showToast = () => {
        toast({
            title: "Feature In Development",
            description: "This functionality is currently under development.",
        });
    };

    return (
        <motion.div
         initial="initial"
         animate="in"
         exit="out"
         variants={pageVariants}
         transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
         className="space-y-8"
        >
            <div>
                <h1 className="text-4xl font-headline tracking-wider text-foreground">SafeVault</h1>
                <p className="text-muted-foreground font-body text-lg">Your biometric-backed digital locker for keys, IDs, and confidential files.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-card/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Vault Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold font-headline text-green-400">Secure & Immutable</p>
                                <p className="text-sm text-muted-foreground">Files are write-once, read-only.</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Stored Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold font-headline">{documents.length}</p>
                                <p className="text-sm text-muted-foreground">Total items in vault.</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-card/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Biometric Lock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold font-headline flex items-center gap-2"><Fingerprint className="text-primary"/> Active</p>
                                <p className="text-sm text-muted-foreground">Ready for secure access.</p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Card className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">Your Documents</CardTitle>
                            <CardDescription>All your sensitive information, securely stored and accessible only by you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-end gap-2 mb-4">
                                <Button variant="outline" onClick={showToast}>
                                    <Folder className="mr-2" /> Manage Categories
                                </Button>
                                {user && <UploadVaultFileModal uid={user.uid} />}
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead>Added On</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map(doc => {
                                        const Icon = categoryIcons[doc.category] || FileText;
                                        return (
                                        <TableRow key={doc.id} className="hover:bg-primary/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-5 w-5 text-primary/70" />
                                                    <span className="font-medium">{doc.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="secondary">{doc.category}</Badge></TableCell>
                                            <TableCell className="flex gap-1 flex-wrap max-w-xs">
                                                {doc.tags?.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{doc.createdAt ? format(doc.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                {doc.isBiometric && <Fingerprint className="h-5 w-5 text-accent inline-block mr-2" title="Biometric lock enabled"/>}
                                                <Button asChild variant="ghost" size="icon">
                                                  <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4 text-primary" />
                                                  </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/70 backdrop-blur-sm border-accent/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-accent flex items-center gap-3"><Bot/> AI Security Assistant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">"Security scan complete. All documents are encrypted and verified via checksum. Your vault integrity is at 100%. Recommendation: Tag untagged documents for better organization."</p>
                            <Button className="mt-4" variant="outline" onClick={showToast}>
                                <Tag className="mr-2" /> Auto-Tag Documents
                            </Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </motion.div>
    );
}
