import { Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search,
  LayoutDashboard,
  Calendar,
  BookOpen,
  DoorOpen,
  Building2,
  Tag,
  Sparkles,
  Settings,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

const routeTitles: Record<string, string> = {
  '/app': 'Home',
  '/app/schedule': 'Timetable',
  '/app/courses': 'Courses',
  '/app/rooms': 'Rooms',
  '/app/buildings': 'Buildings',
  '/app/room-types': 'Room Types',
  '/app/generate': 'Create Schedule',
  '/app/settings': 'Settings',
};

const navigationItems = [
  { title: 'Home', href: '/app', icon: LayoutDashboard },
  { title: 'Timetable', href: '/app/schedule', icon: Calendar },
  { title: 'Courses', href: '/app/courses', icon: BookOpen },
  { title: 'Rooms', href: '/app/rooms', icon: DoorOpen },
  { title: 'Buildings', href: '/app/buildings', icon: Building2 },
  { title: 'Room Types', href: '/app/room-types', icon: Tag },
  { title: 'New Schedule', href: '/app/generate', icon: Sparkles },
  { title: 'Settings', href: '/app/settings', icon: Settings },
];

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const currentTitle = routeTitles[location.pathname] || 'Dashboard';
  const [commandOpen, setCommandOpen] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/signin' });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigate = (href: string) => {
    navigate({ to: href });
    setCommandOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/signin' });
  };

  // Get user display info
  const userEmail = user?.email ?? '';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider className="h-full min-h-0!">
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {location.pathname !== '/app' && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/app">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 px-4">
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="size-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">Search...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-9 rounded-full">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/app/settings' })} className="cursor-pointer">
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/app/settings' })} className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-auto p-3 md:p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Where would you like to go?" />
        <CommandList>
          <CommandEmpty>No results found. Try a different search.</CommandEmpty>
          <CommandGroup heading="Pages">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleNavigate(item.href)}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 size-4" />
                <span>{item.title}</span>
                {location.pathname === item.href && (
                  <span className="ml-auto text-xs text-muted-foreground">Current</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleNavigate('/app/generate')} className="cursor-pointer">
              <Sparkles className="mr-2 size-4" />
              Create a new schedule
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/app/courses')} className="cursor-pointer">
              <BookOpen className="mr-2 size-4" />
              Add a course
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate('/app/rooms')} className="cursor-pointer">
              <DoorOpen className="mr-2 size-4" />
              Add a room
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}
