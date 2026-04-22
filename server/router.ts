import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
// @ts-ignore
import {
  buscarConvidados,
  salvarConfirmacao,
  buscarTodosConvidados,
  adicionarConvidado,
  atualizarConvidado,
  deletarConvidado,
} from "./googleSheets";

// 1. Definição do Contexto
export type Context = CreateExpressContextOptions;

// 2. Inicialização do tRPC
const t = initTRPC.context<Context>().create();

// 3. Procedures e Middlewares
const publicProcedure = t.procedure;

const isAdmin = t.middleware(async ({ next, ctx }) => {
  const password = ctx.req.headers["x-admin-password"];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Acesso negado: Senha administrativa incorreta ou ausente.",
    });
  }
  return next();
});

const adminProcedure = publicProcedure.use(isAdmin);

// 4. Definição do Router
// Para resolver o erro TS2883, definimos o router e exportamos o tipo separadamente.
// O segredo aqui é não deixar o TS tentar gerar um arquivo .d.ts complexo.
const appRouter = t.router({
  searchConvidados: publicProcedure
    .input(z.object({ nome: z.string() }))
    .mutation(async ({ input }) => {
      return await buscarConvidados(input.nome);
    }),

  confirmarPresenca: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
        acompanhantes: z.number(),
        criancas: z.number(),
        menores8: z.number(),
        acompanhanteDetalhes: z.string().optional(),
        mensagem: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const ok = await salvarConfirmacao(input);
      return { success: ok };
    }),

  adminRouter: t.router({
    getAllConvidados: adminProcedure.query(async () => {
      return await buscarTodosConvidados();
    }),

    adicionarConvidado: adminProcedure
      .input(
        z.object({
          nome: z.string(),
          email: z.string().optional(),
          telefone: z.string().optional(),
          limite: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await adicionarConvidado(input);
      }),

    atualizarConvidado: adminProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.string().optional(),
          acompanhantes: z.number().optional(),
          criancas: z.number().optional(),
          menores8: z.number().optional(),
          limite: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await atualizarConvidado(id, data);
      }),

    deletarConvidado: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await deletarConvidado(input.id);
      }),

    getEstatisticas: adminProcedure.query(async () => {
      const convidados = await buscarTodosConvidados();
      const stats = {
        total: convidados.length,
        confirmados: 0,
        naoIrao: 0,
        talvez: 0,
        pendentes: 0,
        acompanhantes: 0,
        criancas: 0,
        menores8: 0,
      };

      convidados.forEach((c: any) => {
        if (c.status === "Confirmado") stats.confirmados++;
        else if (c.status === "Não Irá") stats.naoIrao++;
        else if (c.status === "Talvez") stats.talvez++;
        else stats.pendentes++;

        stats.acompanhantes += c.acompanhantes || 0;
        stats.criancas += c.criancas || 0;
        stats.menores8 += c.menores8 || 0;
      });

      return stats;
    }),
  }),
});

// Exportamos o router como padrão ou nomeado, mas o tipo é o que importa para o frontend
export { appRouter };
export type AppRouter = typeof appRouter;
