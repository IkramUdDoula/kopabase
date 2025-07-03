"use client";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar";
import { Table, Star, StarOff } from "lucide-react";
import { useEffect, useState } from "react";

export type TableListProps = {
  tables: string[];
  selectedTable: string | null;
  onSelectTable: (table: string | null) => void;
};

export default function TableList({ tables, selectedTable, onSelectTable }: TableListProps) {
  // Get config key for localStorage
  const [configKey, setConfigKey] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("supabaseConnection");
    if (saved) {
      try {
        const { projectUrl, anonKey } = JSON.parse(saved);
        if (projectUrl && anonKey) {
          setConfigKey(`${projectUrl}:${anonKey}`);
        }
      } catch {}
    }
  }, []);

  // Pin state
  const [pinned, setPinned] = useState<string[]>([]);
  useEffect(() => {
    if (!configKey) return;
    const pins = localStorage.getItem(`pinnedTables:${configKey}`);
    if (pins) setPinned(JSON.parse(pins));
  }, [configKey]);

  const setPinnedTables = (newPins: string[]) => {
    setPinned(newPins);
    if (configKey) {
      localStorage.setItem(`pinnedTables:${configKey}`, JSON.stringify(newPins));
    }
  };

  const handlePin = (table: string) => {
    if (pinned.includes(table)) {
      setPinnedTables(pinned.filter((t) => t !== table));
    } else {
      setPinnedTables([...pinned, table]);
    }
  };

  // Only show tables from index 1 onward
  const visibleTables = tables.slice(1);
  const pinnedTables = visibleTables.filter((t) => pinned.includes(t));
  const unpinnedTables = visibleTables.filter((t) => !pinned.includes(t));

  return (
    <div className="p-2">
      {pinnedTables.length > 0 && (
        <>
          <SidebarMenu>
            {pinnedTables.map((table) => (
              <SidebarMenuItem key={table}>
                <SidebarMenuButton
                  onClick={() => onSelectTable(table)}
                  isActive={table === selectedTable}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    <span>{table}</span>
                  </span>
                  <Star
                    className="w-4 h-4 text-yellow-500 cursor-pointer ml-2"
                    onClick={e => { e.stopPropagation(); handlePin(table); }}
                    fill="currentColor"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarSeparator className="my-2" />
        </>
      )}
      <SidebarMenu>
        {unpinnedTables.map((table) => (
          <SidebarMenuItem key={table}>
            <SidebarMenuButton
              onClick={() => onSelectTable(table)}
              isActive={table === selectedTable}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4" />
                <span>{table}</span>
              </span>
              <Star
                className="w-4 h-4 text-muted-foreground cursor-pointer ml-2"
                onClick={e => { e.stopPropagation(); handlePin(table); }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
