import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Loader2, Archive, Star } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar";

export type Bucket = {
  id: string;
  name: string;
  public: boolean;
  [key: string]: any;
};

interface StorageListProps {
  projectUrl: string;
  anonKey: string;
  onSelectBucket: (bucket: Bucket) => void;
  selectedBucketId?: string;
  buckets: Bucket[];
  pinned: string[];
  onPin: (bucketName: string) => void;
}

const StorageList: React.FC<StorageListProps> = ({ projectUrl, anonKey, onSelectBucket, selectedBucketId, buckets, pinned, onPin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // No need to fetch buckets here, they are passed as props
    setLoading(false);
  }, [buckets]);

  return (
    <div className="p-2">
      <SidebarMenu>
        {buckets.map((bucket) => (
          <SidebarMenuItem key={bucket.id}>
            <SidebarMenuButton
              onClick={() => onSelectBucket(bucket)}
              isActive={!!selectedBucketId && bucket.id === selectedBucketId}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span>{bucket.name}</span>
                {bucket.public ? <span className="ml-2 text-xs text-muted-foreground">(public)</span> : null}
              </span>
              <Star
                className={`w-4 h-4 cursor-pointer ml-2 ${pinned.includes(bucket.name) ? 'text-yellow-500' : 'text-muted-foreground'}`}
                onClick={e => { e.stopPropagation(); onPin(bucket.name); }}
                fill={pinned.includes(bucket.name) ? 'currentColor' : 'none'}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      {loading && (
        <div className="flex justify-center items-center h-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {error && (
        <div className="text-destructive text-sm text-center h-16 flex items-center justify-center">{error}</div>
      )}
      {!loading && !error && buckets.length === 0 && (
        <div className="text-muted-foreground text-sm text-center h-16 flex items-center justify-center">No buckets found.</div>
      )}
    </div>
  );
};

export default StorageList; 