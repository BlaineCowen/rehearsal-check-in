"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>{children}</SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
