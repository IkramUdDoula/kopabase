"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { SupabaseClient } from "@/lib/supabase-client";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import TableList from "./table-list";
import TableViewer from "./table-viewer";
import { Button } from "./ui/button"; 
import { Database, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddRecordDialog from "./add-record-dialog";
import EditRecordDialog from "./edit-record-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer } from "./ui/chart";
import { DbSizeCard } from "./metrics/DbSizeCard";
import { OpenAITokensCard } from "./metrics/OpenAITokensCard";

type DashboardLayoutProps = {
  client: SupabaseClient;
  schema: any;
  onDisconnect: () => void;
  projectUrl: string;
  projectName?: string | null;
};

export default function DashboardLayout({ client, schema, onDisconnect, projectUrl, projectName: projectNameProp }: DashboardLayoutProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // State lifted from TableViewer
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ column: string; ascending: boolean } | null>(null);

  const { toast } = useToast();

  const tableNames = useMemo(() => {
    if (!schema.paths) return [];
    
    // Internal Supabase tables that are not meant for direct editing through this tool.
    const internalTables = new Set([
        // auth schema
        'users', 'identities', 'sessions', 'refresh_tokens', 'mfa_factors', 
        'mfa_challenges', 'saml_providers', 'saml_relay_states', 'sso_providers', 
        'sso_domains', 'key', 'audit_log_entries',
        // storage schema
        'buckets', 'objects',
        // other internal
        'migrations'
    ]);
    
    return Object.keys(schema.paths)
        .map(p => p.substring(1))
        .filter(name => !internalTables.has(name));
  }, [schema]);

  const projectName = useMemo(() => {
    if (!projectUrl) return "Project";
    try {
      const url = new URL(projectUrl);
      const hostnameParts = url.hostname.split('.');
      if (hostnameParts[0] === 'localhost' || /^\d/.test(hostnameParts[0])) {
          return "Local Project";
      }
      const name = hostnameParts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (error) {
      return "Project";
    }
  }, [projectUrl]);

  useEffect(() => {
    // Always skip the first table (index 0) for selection and default to the second table (index 1)
    if ((!selectedTable || !tableNames.includes(selectedTable)) && tableNames.length > 1) {
      setSelectedTable(tableNames[1]);
    } else if (selectedTable && !tableNames.includes(selectedTable)) {
      setSelectedTable(tableNames[1] || null);
    }
  }, [tableNames, selectedTable]);
  
  const tableSchema = selectedTable ? schema.definitions[selectedTable] : null;
  const columns = useMemo(() => tableSchema?.properties ? Object.keys(tableSchema.properties) : [], [tableSchema]);
  const primaryKey = useMemo(() => columns.find(c => c === 'id') || columns[0], [columns]);

  // Reset state when table changes
  useEffect(() => {
    setSelectedRows(new Set());
    setSortConfig(null);
  }, [selectedTable]);

  const fetchData = useCallback(async () => {
    if (!selectedTable) {
        setData([]);
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    const { data: fetchedData, error } = await client.from(selectedTable).select({
      order: sortConfig || undefined,
    });
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to fetch data: ${error.message}` });
      setData([]);
    } else {
      setData(fetchedData || []);
    }
    setIsLoading(false);
    setSelectedRows(new Set());
  }, [client, selectedTable, sortConfig, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (selectedRows.size === 0 || !selectedTable) return;
    const { error } = await client.from(selectedTable).delete().in(primaryKey, Array.from(selectedRows));
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to delete records: ${error.message}` });
    } else {
      toast({ title: "Success", description: `${selectedRows.size} record(s) deleted.` });
      fetchData();
    }
    setDeleteDialogOpen(false);
  };
  
  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setEditDialogOpen(true);
  };

  const handleSelectRow = (row: any, isSelected: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (isSelected) {
      newSelectedRows.add(row[primaryKey]);
    } else {
      newSelectedRows.delete(row[primaryKey]);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows(new Set(data.map(row => row[primaryKey])));
    } else {
      setSelectedRows(new Set());
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            <h2 className="text-lg font-semibold">{projectNameProp && projectNameProp.trim() ? projectNameProp : projectName}</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <TableList
            tables={tableNames}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
          />
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start" onClick={onDisconnect}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2"><path d="M10 2.5V7.5L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10 17.5V12.5L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.5 11.5L12.5 11.5L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2.5 11.5L7.5 11.5L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.5 8.5L12.5 8.5L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2.5 8.5L7.5 8.5L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <span>Disconnect</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 flex flex-col h-svh">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-bold tracking-tight">{selectedTable || "Dashboard"}</h1>
                </div>
                {selectedTable && (
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Record
                        </Button>
                    </div>
                )}
            </div>
            {selectedTable && tableSchema ? (
                <TableViewer
                    key={selectedTable}
                    data={data}
                    isLoading={isLoading}
                    columns={columns}
                    primaryKey={primaryKey}
                    selectedRows={selectedRows}
                    sortConfig={sortConfig}
                    onSort={setSortConfig}
                    onSelectRow={handleSelectRow}
                    onSelectAll={handleSelectAll}
                    onEditClick={handleEditClick}
                    selectedRowCount={selectedRows.size}
                    onDeleteClick={() => setDeleteDialogOpen(true)}
                />
            ) : null}
        </div>
        {selectedTable && tableSchema && (
            <>
                <AddRecordDialog
                    isOpen={isAddDialogOpen}
                    onOpenChange={setAddDialogOpen}
                    client={client}
                    tableName={selectedTable}
                    schema={tableSchema}
                    onSuccess={fetchData}
                />
                
                <EditRecordDialog
                    isOpen={isEditDialogOpen}
                    onOpenChange={(isOpen) => {
                        setEditDialogOpen(isOpen);
                        if (!isOpen) {
                            setEditingRecord(null);
                        }
                    }}
                    client={client}
                    tableName={selectedTable}
                    schema={tableSchema}
                    initialData={editingRecord}
                    primaryKey={primaryKey}
                    onSuccess={fetchData}
                />

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {selectedRows.size} record(s).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
