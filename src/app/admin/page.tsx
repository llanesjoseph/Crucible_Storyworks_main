
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, Users, BookOpen, School, ShieldCheck, Trash2, User, Library, UserCog, Contact, BookUser } from 'lucide-react';
import { mockAdminUsers, mockAdminStories, mockAdminClassrooms, mockAdminInvitations, type AdminUser } from '@/lib/mock-admin-data';
import { InvitationManager } from './invitation-manager';
import Link from 'next/link';
import type { AppUser } from '@/hooks/use-auth';

// A client component would be needed for interactive role changes, but for a view, this is fine.
function UserActions({ user }: { user: AdminUser }) {
    // In a real app, these actions would trigger server actions to update Firestore and custom claims.
    // The onClick handlers would call those server actions. For now, they are just for display.
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role !== 'admin' && (
                    <DropdownMenuItem>
                        <ShieldCheck className="mr-2" />
                        Make Admin
                    </DropdownMenuItem>
                )}
                {user.role !== 'teacher' && (
                    <DropdownMenuItem>
                        <School className="mr-2" />
                        Make Teacher
                    </DropdownMenuItem>
                )}
                {user.role !== 'student' && (
                     <DropdownMenuItem>
                        <User className="mr-2" />
                        Make Student
                    </DropdownMenuItem>
                )}
                {user.role !== 'parent' && (
                     <DropdownMenuItem>
                        <BookUser className="mr-2" />
                        Make Parent
                    </DropdownMenuItem>
                )}
                 {user.role !== 'librarian' && (
                     <DropdownMenuItem>
                        <Library className="mr-2" />
                        Make Librarian
                    </DropdownMenuItem>
                )}
                 {user.role !== 'coordinator' && (
                     <DropdownMenuItem>
                        <UserCog className="mr-2" />
                        Make Coordinator
                    </DropdownMenuItem>
                )}
                {user.role !== 'guest' && (
                     <DropdownMenuItem>
                        <Contact className="mr-2" />
                        Make Guest
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2" />
                    Remove User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function AdminPage() {
    // In a real app, these would come from Firestore queries.
    const totalUsers = mockAdminUsers.length;
    const totalStories = mockAdminStories.length;
    const totalClassrooms = mockAdminClassrooms.length;

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
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Oversee users, content, and classrooms across the platform.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalStories}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalClassrooms}</div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <InvitationManager invitations={mockAdminInvitations} />
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAdminUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleVariant[user.role]} className="capitalize">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{user.joined}</TableCell>
                                    <TableCell className="text-right">
                                        <UserActions user={user} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Classroom Management</CardTitle>
                    <CardDescription>View all classrooms on the platform. Click a classroom name to see its overview.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Classroom Name</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead className="text-center">Students</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAdminClassrooms.map((classroom) => (
                                <TableRow key={classroom.id}>
                                    <TableCell className="font-medium">
                                        <Link href="/teacher/classroom-overview?view=admin" className="hover:underline text-primary">
                                            {classroom.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{classroom.teacher}</TableCell>
                                    <TableCell className="text-center">{classroom.students}</TableCell>
                                    <TableCell>{classroom.createdAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
