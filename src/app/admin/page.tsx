'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, ResponsiveContainer, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, DocumentData, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { moduleConfigDoc, usersCollection } from "@/lib/collections";
import { useToast } from "@/hooks/use-toast";

const healthData = [
  { time: '10:00', cpu: 25, memory: 45 },
  { time: '10:05', cpu: 30, memory: 48 },
  { time: '10:10', cpu: 28, memory: 52 },
  { time: '10:15', cpu: 45, memory: 60 },
  { time: '10:20', cpu: 40, memory: 55 },
  { time: '10:25', cpu: 50, memory: 65 },
  { time: '10:30', cpu: 35, memory: 58 },
];

const logs = [
    `[INFO] ${new Date().toLocaleTimeString()}: User devmahn@zizo.finverse logged in from 127.0.0.1`,
    `[INFO] ${new Date().toLocaleTimeString()}: System health check: OK`,
    `[WARN] ${new Date().toLocaleTimeString()}: High CPU usage detected on CryptoCore module.`,
    `[INFO] ${new Date().toLocaleTimeString()}: User alice@example.com completed transaction T005.`,
    `[ERROR] ${new Date().toLocaleTimeString()}: Failed to connect to external payment gateway PayWave.`,
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

type UserData = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Banned';
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [modules, setModules] = useState<DocumentData>({});
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const rolesSnapshot = await getDocs(collection(db, 'roles'));
            const rolesMap = new Map(rolesSnapshot.docs.map(d => [d.id, d.data().role]));
            const usersData = usersSnapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                role: rolesMap.get(d.id) || 'user',
                status: 'Active' // Assuming a status field exists or default it
            })) as UserData[];
            setUsers(usersData);
        };
        fetchUsers();

        const unsub = onSnapshot(moduleConfigDoc(), (doc) => {
            if (doc.exists()) {
                setModules(doc.data());
            }
        });
        
        return () => unsub();
    }, []);

    const handleModuleToggle = async (moduleName: string, isChecked: boolean) => {
        const newModulesState = { ...modules, [moduleName.toLowerCase()]: isChecked };
        setModules(newModulesState);
        try {
            await setDoc(moduleConfigDoc(), { [moduleName.toLowerCase()]: isChecked }, { merge: true });
            toast({
                title: 'Success',
                description: `${moduleName} has been ${isChecked ? 'activated' : 'deactivated'}.`,
            });
        } catch (error) {
            console.error("Error updating module:", error);
            toast({
                title: 'Error',
                description: `Failed to update ${moduleName}.`,
                variant: 'destructive',
            });
            // Revert UI change on failure
            setModules(modules);
        }
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
                <h1 className="text-4xl font-headline tracking-wider text-foreground">System Overview</h1>
                <p className="text-muted-foreground font-body">Manage and monitor the Zizo_FinVerse ecosystem.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-accent">System Health</CardTitle>
                        <CardDescription>Real-time CPU and Memory usage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={healthData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value}%`} />
                                <Tooltip contentStyle={{ background: "hsl(var(--background) / 0.9)", borderColor: "hsl(var(--border))" }}/>
                                <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCpu)" />
                                <Area type="monotone" dataKey="memory" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorMemory)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-accent">Module Toggles</CardTitle>
                        <CardDescription>Activate or deactivate modules globally.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {Object.keys(modules).map(modKey => (
                            <div key={modKey} className="flex items-center justify-between space-x-2 p-2 rounded-md bg-background/50">
                                <Label htmlFor={`toggle-${modKey}`} className="font-semibold capitalize">{modKey}</Label>
                                <Switch 
                                    id={`toggle-${modKey}`} 
                                    checked={modules[modKey]}
                                    onCheckedChange={(isChecked) => handleModuleToggle(modKey, isChecked)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 bg-card/70 backdrop-blur-sm">
                     <CardHeader>
                        <CardTitle className="font-headline text-accent">User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                             <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-accent">Live Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-black/50 rounded-md p-4 h-64 overflow-y-auto">
                            <pre className="text-xs font-code text-green-400 whitespace-pre-wrap">
                                {logs.map((log, i) => (
                                    <p key={i} className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARN]') ? 'text-yellow-400' : 'text-green-400'}>
                                        {log}
                                    </p>
                                ))}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
