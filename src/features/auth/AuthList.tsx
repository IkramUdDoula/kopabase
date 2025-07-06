"use client";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Users, Star } from "lucide-react";
import React from "react";

export type AuthListProps = {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  pinned: boolean;
  onPin: () => void;
};

export default function AuthList({ selectedUserId, onSelectUser, pinned, onPin }: AuthListProps) {
  return (
    <div className="p-2">
      <SidebarMenu>
        <SidebarMenuItem key="users">
          <SidebarMenuButton
            onClick={() => onSelectUser("users")}
            isActive={selectedUserId === "users"}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </span>
            <Star
              className={`w-4 h-4 cursor-pointer ml-2 ${pinned ? 'text-yellow-500' : 'text-muted-foreground'}`}
              onClick={e => { e.stopPropagation(); onPin(); }}
              fill={pinned ? 'currentColor' : 'none'}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
} 