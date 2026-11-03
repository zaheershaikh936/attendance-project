'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtool } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultStatus: 'loading',
  defaultOptions: {
    queries: {
      initialData: undefined,
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      onMutate: (variables) => {
        console.log('About to mutate variables:', variables);
      },
    },
  },
});

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtool initialState={{}} />
    </QueryClientProvider>
  );
}
