import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface MetricCardProps {
  title: string;
  value?: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: ReactNode;
  loading?: boolean;
  error?: string;
  visualizationType?: 'number' | 'progress' | 'gauge' | 'chart' | 'custom';
  children?: ReactNode;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  loading,
  error,
  visualizationType = 'number',
  children,
}: MetricCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="pb-2 flex flex-row items-center gap-2 w-full justify-center">
        {icon && <span className="text-xl">{icon}</span>}
        <CardTitle className="text-base font-medium text-center w-full">{title}</CardTitle>
        {trend && <span className="ml-2">{trend}</span>}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center w-full">
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : visualizationType === 'number' ? (
          <span className="text-2xl font-bold text-center">
            {value}
            {unit && <span className="ml-1 text-base font-normal">{unit}</span>}
          </span>
        ) : visualizationType === 'progress' ? (
          children
        ) : visualizationType === 'gauge' ? (
          children
        ) : visualizationType === 'chart' ? (
          children
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
} 