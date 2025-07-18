import Link from 'next/link';
import {
  Users,
  Terminal,
  BarChart2,
  ToggleRight,
  Shield,
  LogOut,
  Home,
  Bot
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';


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
          <Avatar className="h-10 w-10 border-2 border-accent/50">
            <AvatarImage src={user?.photoURL ?? `https://placehold.co/100x100`} alt="Admin" data-ai-hint="futuristic avatar" />
            <AvatarFallback>{user?.displayName?.charAt(0) ?? 'A'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName ?? 'Admin'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
         <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, role, router]);

  if (loading || !user || role !== 'admin') {
    return <div className="flex h-screen items-center justify-center">Loading Admin Deck...</div>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-10 h-10 text-accent" />
            <h1 className="text-2xl font-headline text-accent tracking-wider group-data-[collapsible=icon]:hidden">
              Admin Deck
            </h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" className="w-full">
                <SidebarMenuButton tooltip="System Health"><BarChart2 /><span>System Health</span></SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="User Management"><Users /><span>User Management</span></SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Live Logs"><Terminal /><span>Live Logs</span></SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Module Toggles"><ToggleRight /><span>Module Toggles</span></SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/dashboard" className="w-full">
                        <SidebarMenuButton tooltip="Exit Admin"><Home /><span>Exit Admin</span></SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-xl font-headline text-foreground">Admin Control Deck</h1>
            </div>
             <div className="flex items-center gap-4">
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
