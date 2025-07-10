"use client";

import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Pencil, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";

export type AuthViewerProps = {
  users: any[];
  isLoading: boolean;
  onAddUser: () => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
  onResetPassword: (user: any) => void;
  selectedUserIds: Set<string>;
  onSelectUserId: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBulkDelete: (users: any[]) => void;
};

export default function AuthViewer({ users, isLoading, onAddUser, onEditUser, onDeleteUser, onResetPassword, selectedUserIds, onSelectUserId, onSelectAll, onBulkDelete }: AuthViewerProps) {
  const [searchTerm, setSearchTerm] = useSearch("");
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(u => (u.email || u.id).toLowerCase().includes(lower));
  }, [users, searchTerm]);

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.id));
  const someSelected = filteredUsers.some(u => selectedUserIds.has(u.id));

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex-1 min-h-0 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          {selectedUserIds.size > 0 && (
            <Button variant="destructive" onClick={() => onBulkDelete(users.filter(u => selectedUserIds.has(u.id)))}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedUserIds.size})
            </Button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={checked => onSelectAll(!!checked)}
                      disabled={filteredUsers.length === 0}
                    />
                  </TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Display name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>Provider type</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead>Last sign in at</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id} data-state={selectedUserIds.has(user.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={checked => onSelectUserId(user.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.user_metadata?.full_name || '-'}</TableCell>
                      <TableCell>{user.email || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {user.identities && user.identities.length > 0 ? (
                          user.identities.map((id, idx) => (
                            <span key={id.provider} className="inline-flex items-center gap-1 mr-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="2" /><path d="M8 12h8" stroke="#888" strokeWidth="2" strokeLinecap="round" /></svg>
                              {id.provider.charAt(0).toUpperCase() + id.provider.slice(1)}
                            </span>
                          ))
                        ) : '—'}
                      </TableCell>
                      <TableCell>{user.identities && user.identities.length > 0 ? user.identities[0].provider_type || '-' : '-'}</TableCell>
                      <TableCell>{user.created_at ? format(new Date(user.created_at), 'EEE dd MMM yyyy HH:mm:ss O') : '-'}</TableCell>
                      <TableCell>{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'EEE dd MMM yyyy HH:mm:ss O') : (user.email_confirmed_at ? 'Waiting for verification' : '-')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEditUser(user)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteUser(user)}>
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onResetPassword(user)}>
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
} 