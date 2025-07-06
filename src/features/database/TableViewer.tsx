"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";

type TableViewerProps = {
  data: any[];
  isLoading: boolean;
  columns: string[];
  primaryKey: string;
  selectedRows: Set<any>;
  sortConfig: { column: string; ascending: boolean } | null;
  onSort: (config: { column: string; ascending: boolean }) => void;
  onSelectRow: (row: any, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEditClick: (record: any) => void;
  selectedRowCount: number;
  onDeleteClick: () => void;
};

export default function TableViewer({
  data,
  isLoading,
  columns,
  primaryKey,
  selectedRows,
  sortConfig,
  onSort,
  onSelectRow,
  onSelectAll,
  onEditClick,
  selectedRowCount,
  onDeleteClick,
}: TableViewerProps) {
  const [searchTerm, setSearchTerm, resetSearch] = useSearch('');
  const handleSort = (column: string) => {
    if (sortConfig && sortConfig.column === column) {
      onSort({ column, ascending: !sortConfig.ascending });
    } else {
      onSort({ column, ascending: true });
    }
  };

  const renderCell = (row: any, col: string) => {
    const item = row[col];
    const isPrimaryKeyColumn = col === primaryKey;

    if (isPrimaryKeyColumn) {
      return (
        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent rounded-full" onClick={() => onEditClick(row)}>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
            {String(item)}
          </Badge>
        </Button>
      );
    }
    
    if (item === null) return <span className="text-muted-foreground">NULL</span>;
    if (typeof item === 'boolean') return <Checkbox checked={item} disabled />;
    
    const content = typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);
    const displayContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
    
    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="truncate" title={displayContent}>{displayContent}</span>
        {displayContent.length > 30 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto max-w-lg break-words">
                <pre className="max-h-96 overflow-auto rounded-sm bg-muted p-2 text-xs">{content}</pre>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const item = row[col];
        if (item === null || item === undefined) return false;
        const itemString = typeof item === 'object' ? JSON.stringify(item) : String(item);
        return itemString.toLowerCase().includes(lowerCaseSearchTerm);
      })
    );
  }, [data, columns, searchTerm]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex-1 min-h-0 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <Input 
          placeholder="Search table data..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="max-w-sm"
        />
        {selectedRowCount > 0 && (
            <Button variant="destructive" onClick={onDeleteClick}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedRowCount})
            </Button>
        )}
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
                      checked={data.length > 0 && selectedRows.size === data.length}
                      onCheckedChange={(checked) => onSelectAll(!!checked)}
                      disabled={data.length === 0}
                    />
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead key={col}>
                      <Button variant="ghost" onClick={() => handleSort(col)}>
                        {col}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row[primaryKey]} data-state={selectedRows.has(row[primaryKey]) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row[primaryKey])}
                          onCheckedChange={(checked) => onSelectRow(row, !!checked)}
                        />
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col} className="max-w-xs">{renderCell(row, col)}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
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
} 