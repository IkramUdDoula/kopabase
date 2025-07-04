"use client";

import { useEffect, useMemo } from "react";
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
import { generateZodSchema } from "@/lib/utils";

type EditRecordDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: SupabaseClient;
  tableName: string;
  schema: any;
  initialData: any | null;
  primaryKey: string;
  onSuccess: () => void;
};

export default function EditRecordDialog({ isOpen, onOpenChange, client, tableName, schema, initialData, primaryKey, onSuccess }: EditRecordDialogProps) {
  const { toast } = useToast();
  const formSchema = generateZodSchema(schema.properties);
  type FormValues = z.infer<typeof formSchema>;

  const defaultValues = useMemo(() => {
    if (!initialData) return {};
    const values: { [key: string]: any } = {};
    for (const key in schema.properties) {
      if (initialData.hasOwnProperty(key)) {
        const value = initialData[key];
        const prop = schema.properties[key];
        if (prop.type === 'object' && value !== null) {
          values[key] = JSON.stringify(value, null, 2);
        } else if (prop.type === 'string' && prop.format === 'date-time' && value) {
          // Format for datetime-local input
          try {
            values[key] = new Date(value).toISOString().slice(0, 16);
          } catch (e) {
            values[key] = '';
          }
        }
        else {
          values[key] = value;
        }
      }
    }
    return values;
  }, [initialData, schema]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [isOpen, defaultValues, form]);


  const onSubmit = async (values: FormValues) => {
    if (!initialData) return;
    
    const recordToUpdate: { [key: string]: any } = {};
    for (const key in values) {
      // Zod transforms empty strings to undefined for optional fields, so we need to check initialData
      const hasInitialValue = initialData[key] !== null && initialData[key] !== undefined;
      const formValue = (values as any)[key];

      // Compare form value with the original value from `initialData` to detect changes
      // This is complex because of type differences (e.g. JSON string vs object)
      // A simpler approach is to just check if the form value is different from the *processed* default value
      if (formValue !== defaultValues[key]) {
        if(schema.properties[key].type === 'object' && typeof formValue === 'string') {
          recordToUpdate[key] = formValue === '' ? null : JSON.parse(formValue);
        } else if (formValue === '') {
          recordToUpdate[key] = null; // Send null for empty strings to clear values
        }
        else {
          recordToUpdate[key] = formValue;
        }
      }
    }

    if (Object.keys(recordToUpdate).length === 0) {
        toast({ title: "No Changes", description: "No changes were made to the record." });
        onOpenChange(false);
        return;
    }
    
    const { error } = await client.from(tableName).update(recordToUpdate, primaryKey, initialData[primaryKey]);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to update record: ${error.message}` });
    } else {
      toast({ title: "Success", description: "Record updated successfully." });
      onSuccess();
      onOpenChange(false);
    }
  };
  
  const renderField = (name: string) => {
    const prop = schema.properties[name];
    const isDisabled = name === primaryKey;

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
                        <Switch disabled={isDisabled} checked={field.value} onCheckedChange={field.onChange} />
                    ) : fieldType === "textarea" ? (
                        <Textarea disabled={isDisabled} placeholder={`Enter JSON for ${name}`} {...field} value={field.value || ''} />
                    ) : (
                        <Input disabled={isDisabled} type={fieldType} placeholder={`Enter value for ${name}`} {...field} value={field.value || ''} />
                    )}
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Record in '{tableName}'</DialogTitle>
          <DialogDescription>Make changes to the record below. The primary key cannot be edited.</DialogDescription>
        </DialogHeader>
        {initialData && (
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <ScrollArea className="h-96 pr-6">
                      <div className="space-y-4 px-2">
                          {Object.keys(schema.properties).map(renderField)}
                      </div>
                  </ScrollArea>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                      <Button type="submit" disabled={!form.formState.isDirty}>Update Record</Button>
                  </DialogFooter>
              </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
