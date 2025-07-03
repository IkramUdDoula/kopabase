"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Database } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  projectUrl: z.string().url({ message: "Please enter a valid Supabase project URL." }),
  anonKey: z.string().min(1, { message: "Please enter your anon key." }),
  serviceRoleKey: z.string().optional(),
  projectName: z.string().optional(),
});

type SupabaseConnectFormProps = {
  onConnect: (url: string, key: string, serviceRoleKey?: string, projectName?: string) => void;
};

export default function SupabaseConnectForm({ onConnect }: SupabaseConnectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectUrl: "",
      anonKey: "",
      serviceRoleKey: "",
      projectName: "",
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [jsonUrl, setJsonUrl] = useState("");

  async function handleImportClick() {
    if (jsonUrl && jsonUrl.trim() !== "") {
      // Fetch JSON from the link
      try {
        const response = await fetch(jsonUrl.trim());
        if (!response.ok) throw new Error("Failed to fetch JSON from the provided link.");
        const data = await response.json();
        if (!data.projectUrl || !data.anonKey) {
          throw new Error("Missing required fields: projectUrl and anonKey");
        }
        form.setValue("projectUrl", data.projectUrl);
        form.setValue("anonKey", data.anonKey);
        form.setValue("serviceRoleKey", data.serviceRoleKey || "");
        form.setValue("projectName", data.projectName || "");
        if (data.openaiKey) {
          localStorage.setItem("openaiKey", data.openaiKey);
        }
        toast({
          title: "Config imported!",
          description: "Supabase connection details have been filled from your JSON link." + (data.openaiKey ? " OpenAI key imported." : ""),
        });
      } catch (err: any) {
        toast({
          title: "Import failed",
          description: err.message || "Invalid JSON link.",
          variant: "destructive",
        });
      }
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.projectUrl || !data.anonKey) {
        throw new Error("Missing required fields: projectUrl and anonKey");
      }
      form.setValue("projectUrl", data.projectUrl);
      form.setValue("anonKey", data.anonKey);
      form.setValue("serviceRoleKey", data.serviceRoleKey || "");
      form.setValue("projectName", data.projectName || "");
      if (data.openaiKey) {
        localStorage.setItem("openaiKey", data.openaiKey);
      }
      toast({
        title: "Config imported!",
        description: "Supabase connection details have been filled from your JSON file." + (data.openaiKey ? " OpenAI key imported." : ""),
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Invalid JSON file.",
        variant: "destructive",
      });
    } finally {
      e.target.value = ""; // Reset input so same file can be re-imported
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    onConnect(values.projectUrl, values.anonKey, values.serviceRoleKey, values.projectName);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Database className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Kopabase</CardTitle>
          <CardDescription>Connect to your Supabase project to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
              <Input
                type="url"
                placeholder="Paste JSON config link and press the button below"
                className="mb-2"
                value={jsonUrl}
                onChange={e => setJsonUrl(e.target.value)}
                autoComplete="off"
              />
              <Button type="button" variant="outline" onClick={handleImportClick} className="mb-2 w-full">
                Import JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                style={{ display: "none" }}
                aria-label="Import Supabase config JSON"
              />
              <p className="text-center">---------- Or ----------</p>
              <FormField
                control={form.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://<project-ref>.supabase.co" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anonKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Anon Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="eyJhbGciOi..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="serviceRoleKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Role Key <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Supabase service_role key..." {...field} value={field.value || ''} autoComplete="off" />
                    </FormControl>
                    <FormDescription>
                      Use the service_role key to bypass RLS policies.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="My Supabase Project" {...field} autoComplete="off" />
                    </FormControl>
                    <FormDescription>
                      This name will be used for display purposes only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Connect
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
