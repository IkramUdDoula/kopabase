import React, { useEffect, useState, useMemo } from "react";
import type { Bucket } from "./storage-list";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Eye, ArrowUpDown, Loader2, Trash2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { createClient } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface StorageBucketViewerProps {
  bucket: Bucket;
  projectUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  maxVisibilitySeconds?: number;
}

type FileObject = {
  id?: string;
  name: string;
  updated_at?: string;
  [key: string]: any;
};

// Add a helper to format bytes
function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || isNaN(bytes)) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const StorageBucketViewer: React.FC<StorageBucketViewerProps> = ({ bucket, projectUrl, anonKey, serviceRoleKey, maxVisibilitySeconds = 60 }) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewLoading, setViewLoading] = useState<string | null>(null); // fileKey being loaded
  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'updated_at' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Initialize Supabase client (anonKey only)
  const supabase = useMemo(() => createClient(projectUrl, anonKey), [projectUrl, anonKey]);

  useEffect(() => {
    setSelectedFiles(new Set()); // Reset selection when bucket changes
  }, [bucket]);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const bucketName = bucket.name;
        const path = '';
        let listOptions: any = { limit: 100 };
        if (sortBy === 'name' || sortBy === 'updated_at') {
          listOptions.sortBy = { column: sortBy, order: sortOrder };
        }
        console.log('[Supabase Debug] Listing from bucket:', bucketName, 'path:', path, 'sortBy:', sortBy, 'order:', sortOrder);
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .list(path, listOptions);
        if (error) {
          setError(error.message);
          setFiles([]);
          console.error('[Storage Error]', error);
        } else {
          setFiles(data || []);
          console.log('[Supabase Debug] Files returned by list API:', data);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [bucket, supabase, sortBy, sortOrder]);

  const filteredFiles = useMemo(() => {
    let result = files;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(f => {
        // Filename
        if (f.name.toLowerCase().includes(lower)) return true;
        // Size
        const sizeStr = formatBytes(f.metadata?.size ?? f.size).toLowerCase();
        if (sizeStr.includes(lower)) return true;
        // Uploaded date
        if (f.updated_at) {
          const dateStr = new Date(f.updated_at).toLocaleString().toLowerCase();
          if (dateStr.includes(lower)) return true;
        }
        return false;
      });
    }
    // Client-side sort for size
    if (sortBy === 'size') {
      result = [...result].sort((a, b) => {
        const aSize = a.metadata?.size ?? a.size ?? 0;
        const bSize = b.metadata?.size ?? b.size ?? 0;
        return sortOrder === 'asc' ? aSize - bSize : bSize - aSize;
      });
    }
    return result;
  }, [files, searchTerm, sortBy, sortOrder]);

  const allSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedFiles.has(f.id || f.name));
  const someSelected = filteredFiles.some(f => selectedFiles.has(f.id || f.name));

  const handleSelectFile = (file: FileObject, checked: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(file.id || file.name);
      } else {
        newSet.delete(file.id || file.name);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id || f.name)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleViewFile = async (file: FileObject) => {
    const fileKey = file.id || file.name;
    if (bucket.public) {
      // Public: open direct URL
      const url = projectUrl.replace(/\/rest\/v1$/, "") + `/storage/v1/object/public/${bucket.name}/${file.name}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Private: fetch signed URL
      setViewLoading(fileKey);
      try {
        // Use Supabase client to create signed URL
        const { data, error } = await supabase
          .storage
          .from(bucket.name)
          .createSignedUrl(file.name, maxVisibilitySeconds);
        console.log('[Supabase Debug] Signed URL response:', data, error);
        if (error || !data?.signedUrl) throw new Error(error?.message || 'Failed to get signed URL');
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } catch (err: any) {
        alert(err.message || "Failed to get signed URL");
      } finally {
        setViewLoading(null);
      }
    }
  };

  // Sorting handler
  const handleSort = (column: 'name' | 'updated_at' | 'size') => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Delete selected files
  const handleDeleteFiles = async () => {
    if (!bucket || selectedFiles.size === 0) return;
    setDeleting(true);
    try {
      const fileNames = files.filter(f => selectedFiles.has(f.id || f.name)).map(f => f.name);
      const { error } = await supabase.storage.from(bucket.name).remove(fileNames);
      if (error) {
        toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Files deleted', description: `${fileNames.length} file(s) deleted.` });
        setSelectedFiles(new Set());
        // Refresh file list
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .storage
          .from(bucket.name)
          .list('', {
            limit: 100,
            sortBy: { column: sortBy, order: sortOrder },
          });
        if (fetchError) {
          setError(fetchError.message);
          setFiles([]);
        } else {
          setFiles(data || []);
        }
      }
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex-1 min-h-0 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {selectedFiles.size > 0 && (
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedFiles.size})
          </Button>
        )}
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected files?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedFiles.size} file(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFiles} disabled={deleting} className="bg-destructive text-destructive-foreground">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <span className="text-xs text-destructive">{error}</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <span className="text-xs text-muted-foreground">No files found.</span>
        </div>
      ) : (
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={checked => handleSelectAll(!!checked)}
                      disabled={filteredFiles.length === 0}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none">
                    <Button variant="ghost" onClick={() => handleSort('name')} className="p-0 h-auto hover:bg-transparent rounded-full">
                      Filename
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      {sortBy === 'name' && (
                        <span className="ml-1 align-middle">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none">
                    <Button variant="ghost" onClick={() => handleSort('size')} className="p-0 h-auto hover:bg-transparent rounded-full">
                      Size
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      {sortBy === 'size' && (
                        <span className="ml-1 align-middle">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none">
                    <Button variant="ghost" onClick={() => handleSort('updated_at')} className="p-0 h-auto hover:bg-transparent rounded-full">
                      Uploaded
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      {sortBy === 'updated_at' && (
                        <span className="ml-1 align-middle">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => {
                    const fileKey = file.id || file.name;
                    return (
                      <TableRow key={fileKey} data-state={selectedFiles.has(fileKey) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFiles.has(fileKey)}
                            onCheckedChange={checked => handleSelectFile(file, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="break-all max-w-xs">{file.name}</TableCell>
                        <TableCell>{formatBytes(file.metadata?.size ?? file.size)}</TableCell>
                        <TableCell>{file.updated_at ? new Date(file.updated_at).toLocaleString() : "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View file"
                            onClick={() => handleViewFile(file)}
                            disabled={viewLoading === fileKey}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-24 text-center">
                      No results.
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
};

export default StorageBucketViewer;
