"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { useState } from "react";
import "@mysten/dapp-kit/dist/index.css";

const networks = {
  testnet: { url: getJsonRpcFullnodeUrl("testnet"), network: "testnet" },
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session (Next.js App Router pattern).
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
