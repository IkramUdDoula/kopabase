import { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';

export function OpenAITokensCard() {
  const [tokens, setTokens] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch OpenAI tokens from API
    fetch('/api/metrics/openai-tokens')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.tokens === 'number') {
          setTokens(data.tokens);
        } else {
          setError('Failed to fetch OpenAI tokens');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch OpenAI tokens');
        setLoading(false);
      });
  }, []);

  return (
    <MetricCard
      title="OpenAI Tokens"
      value={tokens !== null ? tokens.toLocaleString() : '—'}
      loading={loading}
      error={error}
    />
  );
} 