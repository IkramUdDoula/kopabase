"use client";

import { useState, useEffect } from "react";
import { SupabaseClient, createSupabaseClient } from "@/lib/supabase-client";
import SupabaseConnectForm from "@/components/supabase-connect-form";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLoading } from "@/hooks/use-loading";

export default function Home() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [schema, setSchema] = useState<any | null>(null);
  const [projectUrl, setProjectUrl] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [anonKey, setAnonKey] = useState<string>("");
  const [serviceRoleKey, setServiceRoleKey] = useState<string | undefined>(undefined);
  const [isLoading, startLoading, stopLoading] = useLoading(false);
  const { toast } = useToast();

  // Restore connection info from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("supabaseConnection");
    if (saved) {
      try {
        const { projectUrl, anonKey, serviceRoleKey, projectName } = JSON.parse(saved);
        if (projectUrl && anonKey) {
          setProjectName(projectName || null);
          setAnonKey(anonKey);
          setServiceRoleKey(serviceRoleKey);
          handleConnect(projectUrl, anonKey, serviceRoleKey, projectName);
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  const handleConnect = async (url: string, key: string, serviceRoleKey?: string, projectName?: string) => {
    startLoading();
    try {
      if (!url || !key) {
        throw new Error("Project URL and Anon Key are required.");
      }
      const tempClient = createSupabaseClient(url, key, serviceRoleKey);
      const schemaResponse = await tempClient.getSchema();

      if (!schemaResponse || !schemaResponse.definitions) {
        throw new Error("Could not fetch schema. Please check credentials and connection.");
      }
      // Save connection info to localStorage
      localStorage.setItem("supabaseConnection", JSON.stringify({ projectUrl: url, anonKey: key, serviceRoleKey, projectName }));
      setClient(tempClient);
      setSchema(schemaResponse);
      setProjectUrl(url);
      setProjectName(projectName || null);
      setAnonKey(key);
      setServiceRoleKey(serviceRoleKey);
      toast({
        title: "Success",
        description: "Connected to Supabase project.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
      });
      setClient(null);
      setSchema(null);
      setProjectUrl(null);
      setProjectName(null);
      setAnonKey("");
      setServiceRoleKey(undefined);
      // Remove invalid connection info
      localStorage.removeItem("supabaseConnection");
    } finally {
      stopLoading();
    }
  };
  
  const handleDisconnect = () => {
    setClient(null);
    setSchema(null);
    setProjectUrl(null);
    setProjectName(null);
    setAnonKey("");
    setServiceRoleKey(undefined);
    localStorage.removeItem("supabaseConnection");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connecting to Supabase</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {client && schema && projectUrl ? (
        <DashboardLayout 
          client={client} 
          schema={schema} 
          onDisconnect={handleDisconnect} 
          projectUrl={projectUrl} 
          projectName={projectName}
          anonKey={anonKey}
          serviceRoleKey={serviceRoleKey}
        />
      ) : (
        <SupabaseConnectForm onConnect={handleConnect} />
      )}
    </main>
  );
}
