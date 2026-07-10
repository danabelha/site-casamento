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

const startupTime = Date.now();
console.log(`[STARTUP] ${new Date().toISOString()} - Servidor iniciando...`);

app.listen(PORT, "0.0.0.0", async () => {
  const serverListeningTime = Date.now();
  console.log(`[STARTUP] ${new Date().toISOString()} - Servidor ouvindo na porta ${PORT} (${serverListeningTime - startupTime}ms)`);
  
  try {
    const cacheImportStart = Date.now();
    console.log(`[STARTUP] ${new Date().toISOString()} - Importando GuestCacheService...`);
    
    const { guestCacheService } = await import("./services/cache/GuestCacheService.js");
    const cacheImportEnd = Date.now();
    console.log(`[STARTUP] ${new Date().toISOString()} - GuestCacheService importado (${cacheImportEnd - cacheImportStart}ms)`);
    
    const cacheRefreshStart = Date.now();
    console.log(`[STARTUP] ${new Date().toISOString()} - Iniciando sincronização com Google Sheets...`);
    
    await guestCacheService.refreshCache();
    const cacheRefreshEnd = Date.now();
    console.log(`[STARTUP] ${new Date().toISOString()} - Cache sincronizado (${cacheRefreshEnd - cacheRefreshStart}ms)`);
    
    const stats = guestCacheService.getStats();
    console.log(`[STARTUP] ${new Date().toISOString()} - Cache contém ${stats.count} convidados`);
    
    guestCacheService.startAutoSync();
    console.log(`[STARTUP] ${new Date().toISOString()} - Auto-sync agendado`);
    
    const totalStartupTime = Date.now() - startupTime;
    console.log(`[STARTUP] ${new Date().toISOString()} - SERVIDOR PRONTO (${totalStartupTime}ms total)`);
  } catch (error) {
    console.error("[STARTUP] Falha ao inicializar cache:", error);
  }
});
