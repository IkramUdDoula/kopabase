import React, { useEffect, useState } from "react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";

import type { SupabaseClient } from "@/lib/supabase-client";

type Bucket = {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
  [key: string]: any;
};

interface StorageListProps {
  client: SupabaseClient;
  projectUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  selectedBucketId?: string | null;
  onSelectBucket?: (bucket: Bucket) => void;
}

const StorageList: React.FC<StorageListProps> = ({ client, projectUrl, anonKey, serviceRoleKey, selectedBucketId, onSelectBucket }) => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuckets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Supabase Storage REST API: /storage/v1/bucket
        const storageUrl = projectUrl.replace(/\/rest\/v1$/, "") + "/storage/v1/bucket";
        const key = serviceRoleKey || anonKey;
        const headers = {
          apikey: anonKey,
          Authorization: `Bearer ${key}`,
        };
        const res = await fetch(storageUrl, { headers });
        if (!res.ok) throw new Error("Failed to fetch storage buckets");
        const data = await res.json();
        setBuckets(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setBuckets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBuckets();
  }, [projectUrl, anonKey, serviceRoleKey]);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        {loading ? (
          <div className="p-2 text-xs text-muted-foreground">Loading storage buckets...</div>
        ) : error ? (
          <div className="p-2 text-xs text-destructive">{error}</div>
        ) : buckets.length === 0 ? (
          <div className="p-2 text-xs text-muted-foreground">No storage buckets found.</div>
        ) : (
          <SidebarMenu>
            {buckets.map((bucket) => (
              <SidebarMenuItem key={bucket.id}>
                <SidebarMenuButton
                  isActive={selectedBucketId === bucket.id}
                  onClick={() => onSelectBucket && onSelectBucket(bucket)}
                >
                  <span>{bucket.name}</span>
                  {bucket.public && (
                    <span className="ml-2 text-xs text-green-600">public</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export type { Bucket };
export default StorageList; 