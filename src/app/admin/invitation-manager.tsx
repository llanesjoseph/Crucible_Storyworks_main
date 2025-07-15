
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Ticket } from 'lucide-react';
import type { AdminInvitation } from '@/lib/mock-admin-data';
import type { AppUser } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface InvitationManagerProps {
  invitations: AdminInvitation[];
}

function generateInviteCode(role: AppUser['role']): string {
    const prefixMap: Record<AppUser['role'], string> = {
        admin: 'ADMIN', // Should not be user-creatable, but included for completeness
        teacher: 'TCHR',
        student: 'STUD',
        parent: 'PARENT',
        librarian: 'LIBR',
        coordinator: 'COORD',
        guest: 'GUEST',
    };
    const prefix = prefixMap[role] || 'USER';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
}

export function InvitationManager({ invitations }: InvitationManagerProps) {
  const [roleToInvite, setRoleToInvite] = useState<AppUser['role']>('teacher');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateCode = () => {
    const newCode = generateInviteCode(roleToInvite);
    setGeneratedCode(newCode);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: 'Copied!', description: 'Invite code copied to clipboard.' });
    setTimeout(() => setCopiedCode(null), 2000);
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generate New Invitation</CardTitle>
          <CardDescription>Create a single-use code to invite a new user with a specific role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-select">Role to Invite</Label>
            <Select value={roleToInvite} onValueChange={(value) => setRoleToInvite(value as AppUser['role'])}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent/Guardian</SelectItem>
                <SelectItem value="librarian">Librarian</SelectItem>
                <SelectItem value="coordinator">Curriculum Coordinator</SelectItem>
                <SelectItem value="guest">Guest Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {generatedCode && (
            <div className="space-y-2 rounded-lg border bg-secondary p-4">
                <Label>Your New Invite Code</Label>
                <div className="flex items-center gap-2">
                    <Input readOnly value={generatedCode} className="font-mono bg-background" />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(generatedCode)}>
                        {copiedCode === generatedCode ? <Check className="text-success" /> : <Copy />}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this code with the user. They will be prompted to enter it upon signing up.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleGenerateCode} className="w-full">
                <Ticket className="mr-2" />
                Generate Code
            </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Invitations</CardTitle>
          <CardDescription>These are unused invitation codes that are waiting to be redeemed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invite) => (
                <TableRow key={invite.code}>
                  <TableCell className="font-mono">{invite.code}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[invite.role]} className="capitalize">{invite.role}</Badge>
                  </TableCell>
                  <TableCell>{invite.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(invite.code)}>
                        {copiedCode === invite.code ? <Check className="text-success" /> : <Copy />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
