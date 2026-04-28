import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/router"; // Ajuste o caminho se necessário

export const trpc = createTRPCReact<AppRouter>( );

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL || "https://site-casamento-meod.onrender.com/trpc",
      
      // 🔐 O SEGREDO DA SEGURANÇA:
      // Esta função roda antes de CADA chamada ao servidor.
      headers( ) {
        const adminPass = localStorage.getItem("admin_secret");
        return {
          // Se houver uma senha no localStorage, enviamos no header
          "x-admin-password": adminPass || "",
        };
      },
    }),
  ],
});
