import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FILE_SIZE_UNITS } from "@/config/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format bytes as human-readable string (e.g., 1.23 MB)
 * @param bytes Number of bytes
 * @returns Formatted string
 */
export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || isNaN(bytes)) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + FILE_SIZE_UNITS[i];
}

/**
 * Generate a Zod schema from a Supabase table schema
 * @param properties Supabase table properties
 * @param options Optional: { skipDefaults: boolean, nullable: boolean }
 * @returns Zod object schema
 */
import * as z from "zod";
export function generateZodSchema(properties: any, options?: { skipDefaults?: boolean, nullable?: boolean }) {
  const shape: { [key: string]: z.ZodType<any, any> } = {};
  for (const key in properties) {
    const prop = properties[key];
    if (options?.skipDefaults && prop.default !== undefined) continue;
    switch (prop.type) {
      case "boolean":
        shape[key] = z.boolean().default(false);
        break;
      case "integer":
      case "number":
        shape[key] = z.coerce.number().optional();
        if (options?.nullable) shape[key] = shape[key].nullable();
        break;
      case "string":
        if (prop.format === 'date-time') {
          shape[key] = z.string().optional();
        } else {
          shape[key] = z.string().optional();
        }
        if (options?.nullable) shape[key] = shape[key].nullable();
        break;
      case "object":
        shape[key] = z.string().refine((val) => {
          if (!val || val === '') return true;
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        }, { message: "Invalid JSON format" }).optional();
        if (options?.nullable) shape[key] = shape[key].nullable();
        break;
      default:
        shape[key] = z.any().optional();
        if (options?.nullable) shape[key] = shape[key].nullable();
        break;
    }
  }
  return z.object(shape);
}
