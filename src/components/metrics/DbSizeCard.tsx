import { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';

export function DbSizeCard() {
  const [size, setSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabaseConnection = localStorage.getItem('supabaseConnection');
    let projectUrl = null;
    let serviceRoleKey = null;
    if (supabaseConnection) {
      try {
        const config = JSON.parse(supabaseConnection);
        projectUrl = config.projectUrl;
        serviceRoleKey = config.serviceRoleKey;
      } catch (e) {
        setError('Invalid config');
        setLoading(false);
        return;
      }
    }
    console.log('[DbSizeCard] projectUrl:', projectUrl);
    console.log('[DbSizeCard] serviceRoleKey:', serviceRoleKey);
    if (!projectUrl || !serviceRoleKey) {
      console.log('[DbSizeCard] Missing config');
      setError('Missing config');
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log('[DbSizeCard] Fetching db size...');
    fetch('/api/metrics/db-size', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectUrl, serviceRoleKey }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.size !== undefined) {
          setSize(data.size);
          console.log('[DbSizeCard] DB size fetched:', data.size);
        } else {
          setError('Error fetching size');
          console.log('[DbSizeCard] Error fetching size:', data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching size');
        console.log('[DbSizeCard] Fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <MetricCard
      title="Database Size"
      value={size !== null ? (size / 1024 / 1024).toFixed(2) : undefined}
      unit="MB"
      loading={loading}
      error={error || undefined}
      visualizationType="number"
    />
  );
} 