import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router";
import * as trpcExpress from '@trpc/server/adapters/express';

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res, info }) => ({ req, res, info }),
  }),
);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Inicialização do cache na subida do servidor para evitar cold start
  try {
    const { guestCacheService } = await import("./services/cache/GuestCacheService.js");
    await guestCacheService.refreshCache();
    guestCacheService.startAutoSync();
    console.log("[Server] Cache de convidados inicializado e agendado com sucesso.");
  } catch (error) {
    console.error("[Server] Falha ao inicializar cache na subida:", error);
  }
});
