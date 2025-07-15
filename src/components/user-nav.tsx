
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, type AppUser } from "@/hooks/use-auth";
import { LogOut, Download, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useViewMode } from "@/hooks/use-view-mode";

export function UserNav() {
  const { user, isLoading, signOut } = useAuth();
  const { setViewMode, actualRole, isViewingAsDifferentRole } = useViewMode();

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  // AuthGuard handles redirection, so if we're here, user should exist.
  if (!user) {
    return null;
  }
  
  const userDisplayName = user.displayName || "User";
  const userEmail = user.email;
  const userFallback = (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase();
  const userRole = user.role;

  const handleToggleViewMode = () => {
    if (isViewingAsDifferentRole) {
      setViewMode(actualRole!);
    } else {
      setViewMode('student');
    }
  };

  const roleVariant: Record<AppUser['role'], 'default' | 'secondary' | 'outline' | 'destructive' | null | undefined> = {
    admin: 'default',
    teacher: 'secondary',
    student: 'outline',
    parent: 'outline',
    librarian: 'outline',
    coordinator: 'outline',
    guest: 'outline',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={userDisplayName} />}
            <AvatarFallback>{userFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div>
              <p className="text-sm font-medium leading-none">{userDisplayName}</p>
              {userEmail && 
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                  {userEmail}
                  </p>
              }
            </div>
            {userRole && (
                <Badge variant={roleVariant[userRole]} className="capitalize w-fit">
                    {userRole}
                </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(actualRole === 'teacher' || actualRole === 'admin') && (
            <DropdownMenuItem onClick={handleToggleViewMode}>
                <Eye className="mr-2" />
                <span>{isViewingAsDifferentRole ? `Return to ${actualRole}` : 'View as Student'}</span>
            </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled>
          <Download className="mr-2" />
          <span>Export My Data</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
