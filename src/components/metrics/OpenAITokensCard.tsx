import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function OpenAITokensCard() {
  const [tokens, setTokens] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const openaiKey = localStorage.getItem('openaiKey');
    if (!openaiKey) {
      setError('No OpenAI key');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/metrics/openai-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openaiKey }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.tokens !== undefined) {
          setTokens(data.tokens);
        } else {
          setError('Error fetching tokens');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching tokens');
        setLoading(false);
      });
  }, []);

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-center">OpenAI Tokens Used (Today)</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-center">
        {loading ? 'Loading...' : error ? error : tokens?.toLocaleString()}
      </CardContent>
    </Card>
  );
} 