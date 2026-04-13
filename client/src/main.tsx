import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./lib/trpc";
import { httpBatchLink } from "@trpc/client";

// 🔥 cria o client do react-query
const queryClient = new QueryClient();

// 🔥 cria o client do trpc
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "https://site-casamento-meod.onrender.com/trpc", // backend
    }),
  ],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);