"use client";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar";
import { Table, Star, StarOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearch } from "@/hooks/use-search";

export type TableListProps = {
  tables: string[];
  selectedTable: string | null;
  onSelectTable: (table: string | null) => void;
  pinned: string[];
  onPin: (table: string) => void;
};

export default function TableList({ tables, selectedTable, onSelectTable, pinned, onPin }: TableListProps) {
  return (
    <div className="p-2">
      <SidebarMenu>
        {tables.map((table) => (
          <SidebarMenuItem key={table}>
            <SidebarMenuButton
              onClick={() => onSelectTable(table)}
              isActive={!!selectedTable && table === selectedTable}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4" />
                <span>{table}</span>
              </span>
              <Star
                className={`w-4 h-4 cursor-pointer ml-2 ${pinned.includes(table) ? 'text-yellow-500' : 'text-muted-foreground'}`}
                onClick={e => { e.stopPropagation(); onPin(table); }}
                fill={pinned.includes(table) ? 'currentColor' : 'none'}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
