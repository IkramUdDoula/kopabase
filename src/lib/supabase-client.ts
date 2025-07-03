export type SupabaseClient = {
  getSchema: () => Promise<any>;
  from: (table: string) => {
    select: (options?: { query?: string, order?: { column: string, ascending: boolean } }) => Promise<{ data: any[] | null; error: any | null }>;
    insert: (records: any | any[]) => Promise<{ data: any[] | null; error: any | null }>;
    update: (record: any, pkColumn: string, pkValue: any) => Promise<{ data: any[] | null; error: any | null }>;
    delete: () => {
      in: (column: string, values: any[]) => Promise<{ data: any[] | null; error: any | null }>;
    };
  };
};

export const createSupabaseClient = (projectUrl: string, anonKey: string, serviceRoleKey?: string): SupabaseClient => {
  // Ensure the URL does not end with a slash
  const sanitizedUrl = projectUrl.endsWith('/') ? projectUrl.slice(0, -1) : projectUrl;
  const restUrl = `${sanitizedUrl}/rest/v1`;

  const supabaseKey = serviceRoleKey || anonKey;
  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };

  const getSchema = async () => {
    try {
      const response = await fetch(`${restUrl}/`, { headers });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || 'Failed to fetch schema');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching schema:', error);
      throw error;
    }
  };

  const from = (table: string) => ({
    select: async (options?: { query?: string, order?: { column: string, ascending: boolean } }) => {
        try {
            const { query = '*', order } = options || {};
            let url = `${restUrl}/${table}?select=${query}`;
            if(order) {
                url += `&order=${order.column}.${order.ascending ? 'asc' : 'desc'}`
            }
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error(`Failed to fetch data from ${table}`);
            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    insert: async (records: any | any[]) => {
        try {
            const response = await fetch(`${restUrl}/${table}`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify(records),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to insert data: ${errorText}`);
            }
            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    update: async (record: any, pkColumn: string, pkValue: any) => {
        try {
            const response = await fetch(`${restUrl}/${table}?${pkColumn}=eq.${encodeURIComponent(pkValue)}`, {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify(record),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update data: ${errorText}`);
            }
            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    delete: () => ({
        in: async (column: string, values: any[]) => {
            if (values.length === 0) return { data: [], error: null };
            try {
                const response = await fetch(`${restUrl}/${table}?${column}=in.(${values.join(',')})`, {
                    method: 'DELETE',
                    headers
                });
                if (response.status === 204 || response.ok) {
                    return { data: [], error: null };
                }
                const errorText = await response.text();
                throw new Error(`Failed to delete data: ${errorText}`);
            } catch (error) {
                return { data: null, error };
            }
        }
    }),
  });

  return { getSchema, from };
};
