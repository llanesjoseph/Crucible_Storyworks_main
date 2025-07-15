
'use client';

import type { ReactNode } from 'react';
import { BookOpen, Sparkles, Users, LayoutDashboard, School, BarChart, ChevronDown, Shield, PlusCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { UserNav } from './user-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { useViewMode } from '@/hooks/use-view-mode';

const AppSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const actualRole = user?.role;

  const isTeacherSection = pathname.startsWith('/teacher') || pathname.startsWith('/create-story');
  const isAdminSection = pathname.startsWith('/admin');

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">Crucible Storyworks</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/'} asChild>
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="AI Tools" isActive={pathname.startsWith('/ai-tools')} asChild>
               <Link href="/ai-tools/idea-sparker">
                <Sparkles />
                <span>AI Tools</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           
          {(actualRole === 'teacher' || actualRole === 'admin') && (
            <SidebarMenuItem asChild>
              <Collapsible defaultOpen={isTeacherSection} className="group w-full">
                  <CollapsibleTrigger className="w-full" asChild>
                      <SidebarMenuButton tooltip="Teacher Hub" isActive={isTeacherSection}>
                          <div className="flex flex-1 items-center gap-2">
                            <School />
                            <span>Teacher Hub</span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                      <SidebarMenuSub>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname.startsWith('/create-story')}>
                                  <Link href="/create-story">
                                      <PlusCircle />
                                      <span>Create Story</span>
                                  </Link>
                              </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname === '/teacher/student-analysis'}>
                                  <Link href="/teacher/student-analysis">
                                      <BarChart />
                                      <span>Student Analysis</span>
                                  </Link>
                              </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname === '/teacher/classroom-overview'}>
                                  <Link href="/teacher/classroom-overview">
                                      <Users />
                                      <span>Classroom Overview</span>
                                  </Link>
                              </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                      </SidebarMenuSub>
                  </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )}
          
          {actualRole === 'admin' && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Admin Panel" isActive={isAdminSection} asChild>
                <Link href="/admin">
                  <Shield />
                  <span>Admin Panel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

function ViewAsBanner() {
    const { viewMode, setViewMode, actualRole, isViewingAsDifferentRole } = useViewMode();

    if (!isViewingAsDifferentRole || !actualRole) {
        return null;
    }

    return (
        <div className="bg-accent text-accent-foreground p-2 sm:px-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">
                        You are currently viewing the platform as a <span className="font-bold capitalize">{viewMode}</span>.
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewMode(actualRole)} className="h-8">
                    <ArrowLeft className="mr-2" />
                    Return to {actualRole === 'teacher' ? 'Teacher' : 'Your'} View
                </Button>
            </div>
        </div>
    );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="ml-auto flex items-center gap-2">
              <UserNav />
            </div>
          </header>
          <ViewAsBanner />
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
