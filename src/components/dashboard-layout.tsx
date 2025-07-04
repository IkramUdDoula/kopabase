"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { SupabaseClient } from "@/lib/supabase-client";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import TableList from "./table-list";
import TableViewer from "./table-viewer";
import { Button } from "./ui/button"; 
import { Database, Plus, RefreshCw, Table, Archive, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddRecordDialog from "./add-record-dialog";
import EditRecordDialog from "./edit-record-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer } from "./ui/chart";
import { DbSizeCard } from "@/features/metrics/DbSizeCard";
import { OpenAITokensCard } from "@/features/metrics/OpenAITokensCard";
import { MetricCard } from "@/features/metrics/MetricCard";
import StorageBucketViewer from "@/features/storage/StorageBucketViewer";
import StorageList from "@/features/storage/StorageList";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useLoading } from "@/hooks/use-loading";
import { useDialog } from "@/hooks/use-dialog";
import type { Bucket } from "@/features/storage/StorageList";

type DashboardLayoutProps = {
  client: SupabaseClient;
  schema: any;
  onDisconnect: () => void;
  projectUrl: string;
  projectName?: string | null;
  anonKey: string;
  serviceRoleKey?: string;
};

export default function DashboardLayout({ client, schema, onDisconnect, projectUrl, projectName: projectNameProp, anonKey, serviceRoleKey }: DashboardLayoutProps) {
  // tableNames must be defined first
  const tableNames = useMemo(() => {
    if (!schema.paths) return [];
    const internalTables = new Set([
        'users', 'identities', 'sessions', 'refresh_tokens', 'mfa_factors', 
        'mfa_challenges', 'saml_providers', 'saml_relay_states', 'sso_providers', 
        'sso_domains', 'key', 'audit_log_entries',
        'buckets', 'objects',
        'migrations'
    ]);
    return Object.keys(schema.paths)
        .map(p => p.substring(1))
        .filter(name => !internalTables.has(name));
  }, [schema]);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);

  // State lifted from TableViewer
  const [data, setData] = useState<any[]>([]);
  const [isLoading, startLoading, stopLoading] = useLoading(true);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [isAddDialogOpen, openAddDialog, closeAddDialog, setAddDialogOpen] = useDialog(false);
  const [isEditDialogOpen, openEditDialog, closeEditDialog, setEditDialogOpen] = useDialog(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, setDeleteDialogOpen] = useDialog(false);
  const [sortConfig, setSortConfig] = useState<{ column: string; ascending: boolean } | null>(null);

  const { toast } = useToast();

  const [dbOpen, setDbOpen] = useState(true);
  const [storageOpen, setStorageOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [maxVisibility, setMaxVisibility] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maxVisibilitySeconds');
      return stored ? Number(stored) : 60;
    }
    return 60;
  });
  const [editedVisibility, setEditedVisibility] = useState(maxVisibility);
  const [isDirty, setIsDirty] = useState(false);

  // Keep editedVisibility in sync if maxVisibility changes (e.g. on mount)
  useEffect(() => {
    setEditedVisibility(maxVisibility);
  }, [maxVisibility]);

  const [bucketReloadKey, setBucketReloadKey] = useState(0);

  // Pin state for tables and buckets
  const [tablePins, setTablePins] = useState<string[]>([]);
  const [bucketPins, setBucketPins] = useState<string[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // Load pins from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("supabaseConnection");
    let configKey = null;
    if (saved) {
      try {
        const { projectUrl, anonKey } = JSON.parse(saved);
        if (projectUrl && anonKey) {
          configKey = `${projectUrl}:${anonKey}`;
        }
      } catch {}
    }
    if (configKey) {
      const tablePins = localStorage.getItem(`pinnedTables:${configKey}`);
      setTablePins(tablePins ? JSON.parse(tablePins) : []);
      const bucketPins = localStorage.getItem(`pinnedBuckets:${configKey}`);
      setBucketPins(bucketPins ? JSON.parse(bucketPins) : []);
    }
  }, [projectUrl, anonKey]);

  // Pin/unpin handlers
  const handlePinTable = (table: string) => {
    let newPins;
    if (tablePins.includes(table)) {
      newPins = tablePins.filter(t => t !== table);
    } else {
      newPins = [...tablePins, table];
    }
    setTablePins(newPins);
    const saved = localStorage.getItem("supabaseConnection");
    if (saved) {
      try {
        const { projectUrl, anonKey } = JSON.parse(saved);
        if (projectUrl && anonKey) {
          localStorage.setItem(`pinnedTables:${projectUrl}:${anonKey}`, JSON.stringify(newPins));
        }
      } catch {}
    }
  };
  const handlePinBucket = (bucketName: string) => {
    let newPins;
    if (bucketPins.includes(bucketName)) {
      newPins = bucketPins.filter(b => b !== bucketName);
    } else {
      newPins = [...bucketPins, bucketName];
    }
    setBucketPins(newPins);
    const saved = localStorage.getItem("supabaseConnection");
    if (saved) {
      try {
        const { projectUrl, anonKey } = JSON.parse(saved);
        if (projectUrl && anonKey) {
          localStorage.setItem(`pinnedBuckets:${projectUrl}:${anonKey}`, JSON.stringify(newPins));
        }
      } catch {}
    }
  };

  // Fetch buckets for sidebar
  useEffect(() => {
    const supabase = require('@supabase/supabase-js').createClient(projectUrl, anonKey);
    supabase.storage.listBuckets()
      .then(({ data, error }: { data: Bucket[]; error: any }) => {
        if (!error) setBuckets(data || []);
      });
  }, [projectUrl, anonKey]);

  // Filter pinned/unpinned
  const visibleTables = tableNames.slice(1);
  const pinnedTables = visibleTables.filter(t => tablePins.includes(t));
  const unpinnedTables = visibleTables.filter(t => !tablePins.includes(t));
  const pinnedBuckets = buckets.filter(b => bucketPins.includes(b.name));
  const unpinnedBuckets = buckets.filter(b => !bucketPins.includes(b.name));

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
        stopLoading();
        return;
    };
    startLoading();
    const { data: fetchedData, error } = await client.from(selectedTable).select({
      order: sortConfig || undefined,
    });
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to fetch data: ${error.message}` });
      setData([]);
    } else {
      setData(fetchedData || []);
    }
    stopLoading();
    setSelectedRows(new Set());
  }, [client, selectedTable, sortConfig, toast, startLoading, stopLoading]);

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
    closeDeleteDialog();
  };
  
  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    openEditDialog();
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
            {/* Kopabase Logo SVG */}
            <svg width="24" height="24" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <g>
                <path fill="#191616" d="M63.86,7.77l-32.8-.45c-4.98-.07-9.06,3.95-9.06,8.94v48.56c0,8.8,11.37,12.3,16.33,5.04l32.8-48.11c4.01-5.89-.14-13.88-7.26-13.98Z"/>
                <path fill="#fff" d="M31.06,76.29c-1.15,0-2.32-.17-3.49-.53-4.9-1.51-8.07-5.8-8.07-10.93V16.26c0-3.08,1.21-5.98,3.41-8.14,2.2-2.17,5.14-3.36,8.19-3.29l32.8.45c4.28.06,8.02,2.36,9.99,6.16,1.98,3.8,1.71,8.18-.7,11.72l-32.8,48.11c-2.2,3.23-5.65,5.02-9.34,5.02ZM30.94,9.82c-1.7,0-3.31.66-4.52,1.86-1.24,1.22-1.92,2.85-1.92,4.58v48.56c0,3.5,2.35,5.48,4.54,6.15,2.2.68,5.25.37,7.22-2.53l32.8-48.11c1.36-1.99,1.5-4.46.39-6.6s-3.22-3.44-5.63-3.47l-32.8-.45s-.06,0-.09,0Z"/>
              </g>
              <g>
                <path fill="#191616" d="M63.86,89l-32.8.45c-4.98.07-9.06-3.95-9.06-8.94V31.95c0-8.8,11.37-12.3,16.33-5.04l32.8,48.11c4.01,5.89-.14,13.88-7.26,13.98Z"/>
                <path fill="#fff" d="M30.94,91.95c-3.02,0-5.87-1.17-8.03-3.3-2.2-2.17-3.41-5.06-3.41-8.14V31.95c0-5.13,3.17-9.42,8.07-10.93,4.9-1.52,9.93.25,12.82,4.49l32.8,48.11c2.41,3.54,2.67,7.92.7,11.72-1.98,3.8-5.71,6.1-9.99,6.16l-32.8.45c-.05,0-.11,0-.16,0ZM31.04,25.5c-.71,0-1.39.11-2,.3-2.2.68-4.54,2.65-4.54,6.15v48.56c0,1.74.68,3.37,1.92,4.58,1.22,1.2,2.82,1.86,4.52,1.86.03,0,.06,0,.09,0l32.8-.45c2.41-.03,4.51-1.33,5.63-3.47,1.11-2.14.96-4.61-.39-6.6L36.26,28.32c-1.42-2.08-3.4-2.83-5.22-2.83Z"/>
              </g>
            </svg>
            <h2 className="text-lg font-semibold">{projectNameProp && projectNameProp.trim() ? projectNameProp : projectName}</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0 flex flex-col h-full">
          {/* Divider above pinned section */}
          <SidebarSeparator className="my-2" />
          {/* Pinned Section */}
          {(pinnedTables.length > 0 || pinnedBuckets.length > 0) && (
            <>
              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Pinned</div>
              <div className="px-2 pb-2">
                <ul className="flex flex-col gap-1">
                  {pinnedTables.map(table => (
                    <li key={table}>
                      <button
                        className={`flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${selectedTable === table ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : ''}`}
                        onClick={() => {
                          setSelectedTable(table);
                          setSelectedBucket(null);
                          setShowSettings(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Table className="w-4 h-4" />
                          <span>{table}</span>
                        </span>
                        <Star
                          className="w-4 h-4 text-yellow-500 cursor-pointer ml-2"
                          onClick={e => { e.stopPropagation(); handlePinTable(table); }}
                          fill="currentColor"
                        />
                      </button>
                    </li>
                  ))}
                  {pinnedBuckets.map(bucket => (
                    <li key={bucket.id}>
                      <button
                        className={`flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${selectedBucket?.id === bucket.id ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : ''}`}
                        onClick={() => {
                          setSelectedBucket(bucket);
                          setSelectedTable(null);
                          setShowSettings(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Archive className="w-4 h-4" />
                          <span>{bucket.name}</span>
                          {bucket.public ? <span className="ml-2 text-xs text-muted-foreground">(public)</span> : null}
                        </span>
                        <Star
                          className="w-4 h-4 text-yellow-500 cursor-pointer ml-2"
                          onClick={e => { e.stopPropagation(); handlePinBucket(bucket.name); }}
                          fill="currentColor"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <SidebarSeparator className="my-2" />
            </>
          )}
          {/* Database Section */}
          <Collapsible open={dbOpen} onOpenChange={setDbOpen}>
            <div className="flex items-center justify-between px-4 pt-2 pb-1 cursor-pointer select-none" onClick={() => setDbOpen(v => !v)}>
              <div className="text-xs font-semibold text-muted-foreground">Database</div>
              {dbOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
            <CollapsibleContent>
              <TableList
                tables={unpinnedTables}
                selectedTable={selectedTable}
                onSelectTable={(table) => {
                  setSelectedTable(table);
                  setSelectedBucket(null);
                  setShowSettings(false);
                }}
                pinned={tablePins}
                onPin={handlePinTable}
              />
            </CollapsibleContent>
          </Collapsible>
          <SidebarSeparator />
          {/* Storage Section */}
          <Collapsible open={storageOpen} onOpenChange={setStorageOpen}>
            <div className="flex items-center justify-between px-4 pt-2 pb-1 cursor-pointer select-none" onClick={() => setStorageOpen(v => !v)}>
              <div className="text-xs font-semibold text-muted-foreground">Storage</div>
              {storageOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
            <CollapsibleContent>
              <StorageList 
                projectUrl={projectUrl}
                anonKey={anonKey}
                selectedBucketId={selectedBucket ? selectedBucket.id : undefined}
                onSelectBucket={(bucket) => {
                  setSelectedBucket(bucket);
                  setSelectedTable(null);
                  setShowSettings(false);
                }}
                buckets={unpinnedBuckets}
                pinned={bucketPins}
                onPin={handlePinBucket}
              />
            </CollapsibleContent>
          </Collapsible>
          <div className="flex-1" />
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-1${showSettings ? ' bg-muted' : ''}`}
            onClick={() => {
              setShowSettings(true);
              setSelectedTable(null);
              setSelectedBucket(null);
            }}
          >
            <SettingsIcon className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onDisconnect}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2"><path d="M10 2.5V7.5L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10 17.5V12.5L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.5 11.5L12.5 11.5L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2.5 11.5L7.5 11.5L5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.5 8.5L12.5 8.5L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2.5 8.5L7.5 8.5L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <span>Disconnect</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 flex flex-col h-svh">
          {showSettings ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex-1 min-h-0 flex flex-col">
              <div className="p-4 border-b flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                <span className="text-lg font-semibold">Settings</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <form
                  className="space-y-6 max-w-md w-full"
                  onSubmit={e => {
                    e.preventDefault();
                    setMaxVisibility(editedVisibility);
                    localStorage.setItem('maxVisibilitySeconds', String(editedVisibility));
                    setIsDirty(false);
                    toast({ title: 'Settings saved', description: 'Max visibility updated successfully.' });
                  }}
                >
                  <div>
                    <label htmlFor="max-visibility" className="block text-sm font-medium mb-1">Max visibility of private files (seconds)</label>
                    <Input
                      id="max-visibility"
                      type="number"
                      min={1}
                      value={editedVisibility}
                      onChange={e => {
                        setEditedVisibility(Number(e.target.value));
                        setIsDirty(Number(e.target.value) !== maxVisibility);
                      }}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" disabled={!isDirty} className="w-full">Save</Button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {selectedBucket ? (
                      <>
                        {selectedBucket.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Reload bucket files"
                          onClick={() => setBucketReloadKey(k => k + 1)}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </Button>
                      </>
                    ) : selectedTable ? (
                      <>
                        {selectedTable}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Reload table data"
                          onClick={fetchData}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </Button>
                      </>
                    ) : (
                      "Dashboard"
                    )}
                  </h1>
                </div>
                {selectedTable && !selectedBucket && (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => openAddDialog()}>
                      <Plus className="mr-2 h-4 w-4" /> Add Record
                    </Button>
                  </div>
                )}
              </div>
              {selectedTable && tableSchema && !selectedBucket ? (
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
                  onDeleteClick={() => openDeleteDialog()}
                />
              ) : selectedBucket ? (
                <StorageBucketViewer
                  key={selectedBucket.id + '-' + bucketReloadKey}
                  bucket={selectedBucket}
                  projectUrl={projectUrl}
                  anonKey={anonKey}
                  serviceRoleKey={serviceRoleKey}
                  maxVisibilitySeconds={maxVisibility}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Welcome to Kopabase!</h2>
                    <p className="text-muted-foreground text-lg">Select a table or storage bucket from the sidebar to get started.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {selectedTable && tableSchema && !selectedBucket && (
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
              onOpenChange={closeEditDialog}
              client={client}
              tableName={selectedTable}
              schema={tableSchema}
              initialData={editingRecord}
              primaryKey={primaryKey}
              onSuccess={fetchData}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
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
