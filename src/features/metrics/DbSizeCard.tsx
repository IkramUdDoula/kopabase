import { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';

export function DbSizeCard() {
  const [size, setSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch database size from API
    fetch('/api/metrics/db-size')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.size === 'number') {
          setSize(data.size);
        } else {
          setError('Failed to fetch database size');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch database size');
        setLoading(false);
      });
  }, []);

  return (
    <MetricCard
      title="Database Size"
      value={size !== null ? `${(size / 1024 / 1024).toFixed(2)} MB` : '—'}
      loading={loading}
      error={error}
    />
  );
} 