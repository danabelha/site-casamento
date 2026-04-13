import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/router";


export const trpc = createTRPCReact<AppRouter>();

//const getBaseUrl = () => {
//  if (typeof window !== "undefined") {
//    return `https://site-casamento-meod.onrender.com/trpc`;
//  }
//  return "https://site-casamento-meod.onrender.com/trpc";
//};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,
    }),
  ],
});