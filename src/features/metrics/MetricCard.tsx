import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  loading?: boolean;
  error?: string | null;
}

export function MetricCard({ title, value, loading, error }: MetricCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-destructive text-sm text-center h-16 flex items-center justify-center">{error}</div>
        ) : (
          <div className="text-2xl font-bold text-center h-16 flex items-center justify-center">{value}</div>
        )}
      </CardContent>
    </Card>
  );
} 