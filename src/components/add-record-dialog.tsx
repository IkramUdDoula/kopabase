"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { SupabaseClient } from "@/lib/supabase-client";
import { ScrollArea } from "./ui/scroll-area";

type AddRecordDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: SupabaseClient;
  tableName: string;
  schema: any;
  onSuccess: () => void;
};

// Function to generate Zod schema from Supabase schema
const generateZodSchema = (properties: any) => {
  const shape: { [key: string]: z.ZodType<any, any> } = {};
  for (const key in properties) {
    const prop = properties[key];
    // We can't add records for columns with a default value, as they are often auto-generated (e.g. id, created_at)
    if (prop.default !== undefined) continue;

    switch (prop.type) {
      case "boolean":
        shape[key] = z.boolean().default(false);
        break;
      case "integer":
      case "number":
        shape[key] = z.coerce.number().optional();
        break;
      case "string":
        if (prop.format === 'date-time') {
            shape[key] = z.string().optional(); // Let DB handle conversion
        } else {
            shape[key] = z.string().optional();
        }
        break;
      case "object":
        shape[key] = z.string().refine((val) => {
            if (!val) return true;
            try {
                JSON.parse(val);
                return true;
            } catch {
                return false;
            }
        }, { message: "Invalid JSON format" }).optional();
        break;
      default:
        shape[key] = z.any().optional();
        break;
    }
  }
  return z.object(shape);
};

export default function AddRecordDialog({ isOpen, onOpenChange, client, tableName, schema, onSuccess }: AddRecordDialogProps) {
  const { toast } = useToast();
  const formSchema = generateZodSchema(schema.properties);
  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    const recordToInsert: {[key: string]: any} = {};
    for (const key in values) {
        const value = (values as any)[key];
        if (value !== undefined && value !== null && value !== '') {
            if(schema.properties[key].type === 'object' && typeof value === 'string') {
                recordToInsert[key] = JSON.parse(value);
            } else {
                recordToInsert[key] = value;
            }
        }
    }

    const { error } = await client.from(tableName).insert(recordToInsert);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to add record: ${error.message}` });
    } else {
      toast({ title: "Success", description: "Record added successfully." });
      onSuccess();
      onOpenChange(false);
      form.reset();
    }
  };
  
  const renderField = (name: string) => {
    const prop = schema.properties[name];
    if (prop.default !== undefined) return null;

    let fieldType: "text" | "number" | "switch" | "textarea" | "datetime-local" = "text";
    
    switch (prop.type) {
        case "boolean": fieldType = "switch"; break;
        case "integer": case "number": fieldType = "number"; break;
        case "object": fieldType = "textarea"; break;
        case "string":
            if (prop.format === 'date-time') fieldType = "datetime-local";
            else fieldType = "text";
            break;
    }

    return (
        <FormField
            control={form.control}
            name={name as any}
            key={name}
            render={({ field }) => (
            <FormItem>
                <FormLabel>{name}</FormLabel>
                <FormControl>
                    {fieldType === "switch" ? (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    ) : fieldType === "textarea" ? (
                        <Textarea placeholder={`Enter JSON for ${name}`} {...field} value={field.value || ''} />
                    ) : (
                        <Input type={fieldType} placeholder={`Enter value for ${name}`} {...field} value={field.value || ''} />
                    )}
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if(!open) form.reset();}}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Record to '{tableName}'</DialogTitle>
          <DialogDescription>Fill in the details for the new record.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ScrollArea className="h-96 pr-6">
                    <div className="space-y-4 px-2">
                        {Object.keys(schema.properties).map(renderField)}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit">Add Record</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
