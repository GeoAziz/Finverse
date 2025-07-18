'use client';

import { Home, Settings, User, LogOut, BrainCircuit, Wallet, AreaChart, ShieldCheck, Bitcoin, Calculator, TrendingUp, Landmark, Bot, Bell, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AiVoiceAssistant from '@/components/ai-voice-assistant';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDoc } from 'firebase/firestore';
import { moduleConfigDoc } from '@/lib/collections';

const allModules = [
  { name: 'NeuroBank', icon: BrainCircuit, href: '/dashboard/neurobank', key: 'neurobank' },
  { name: 'PayWave', icon: Wallet, href: '/dashboard/paywave', key: 'paywave' },
  { name: 'CryptoCore', icon: Bitcoin, href: '/dashboard/cryptocore', key: 'cryptocore' },
  { name: 'InvestHub', icon: TrendingUp, href: '/dashboard/investhub', key: 'investhub' },
  { name: 'SafeVault', icon: ShieldCheck, href: '/dashboard/vault', key: 'safevault' },
  { name: 'IDBank', icon: Fingerprint, href: '/dashboard/idbank', key: 'idbank' },
  { name: 'LoanSync', icon: AreaChart, href: '/dashboard/loansync', key: 'loansync' },
  { name: 'TaxGrid', icon: Landmark, href: '/dashboard/taxgrid', key: 'taxgrid' },
  { name: 'EconoSim', icon: Calculator, href: '/dashboard/econosim', key: 'econosim' },
];

const UserNav = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src={user?.photoURL ?? 'https://placehold.co/100x100'} alt="User" data-ai-hint="futuristic avatar" />
            <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const [enabledModules, setEnabledModules] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchModuleConfig = async () => {
      const docSnap = await getDoc(moduleConfigDoc());
      if (docSnap.exists()) {
        const config = docSnap.data();
        const activeModules = allModules.filter(m => config[m.key]);
        setEnabledModules(activeModules);
      }
    };
    if (user) {
      fetchModuleConfig();
    }
  }, [user]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading FinVerse Core...</div>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://placehold.co/100x100" data-ai-hint="futuristic logo" />
            </Avatar>
            <h1 className="text-2xl font-headline text-primary tracking-wider group-data-[collapsible=icon]:hidden">
              Zizo_FinVerse
            </h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard" className="w-full">
                    <SidebarMenuButton tooltip="Dashboard">
                        <Home />
                        <span>Dashboard</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            {enabledModules.map((mod) => (
              <SidebarMenuItem key={mod.name}>
                 <Link href={mod.href} className="w-full">
                    <SidebarMenuButton tooltip={mod.name}>
                        <mod.icon />
                        <span>{mod.name}</span>
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             {role === 'admin' && (
              <SidebarMenuItem>
                  <Link href="/admin" className="w-full">
                      <SidebarMenuButton tooltip="Admin Panel">
                          <Settings />
                          <span>Admin Panel</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
             )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-xl font-headline text-foreground">Welcome, {user.displayName || 'User'}</h1>
            </div>
            <div className="flex items-center gap-4">
              <AiVoiceAssistant />
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5 text-primary" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <UserNav />
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 aurora-bg">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
