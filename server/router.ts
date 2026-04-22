import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  buscarConvidados,
  salvarConfirmacao,
  buscarTodosConvidados,
  adicionarConvidado,
  atualizarConvidado,
  deletarConvidado,
} from "./googleSheets";

// 1. Inicialização do tRPC com definição de contexto básica para evitar erros de tipagem
// Se estiver usando Express, o contexto geralmente contém { req, res }
const t = initTRPC.context<any>().create();

// 2. Middleware de Autenticação
const isAdmin = t.middleware(async ({ next, ctx }) => {
  // O tRPC pega o cabeçalho 'x-admin-password' do contexto (passado pelo adapter do Express)
  const password = ctx.req?.headers["x-admin-password"];
  
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Acesso negado: Senha administrativa incorreta ou ausente.",
    });
  }
  
  return next();
});

// 3. Definição da Procedure Protegida
const adminProcedure = t.procedure.use(isAdmin);

// 4. Definição das Rotas (Router)
export const appRouter = t.router({
  
  // --- ROTAS PÚBLICAS ---
  
  searchConvidados: t.procedure
    .input(z.object({ nome: z.string() }))
    .mutation(async ({ input }) => {
      const result = await buscarConvidados(input.nome);
      return result;
    }),

  confirmarPresenca: t.procedure
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

  // --- ROTAS PRIVADAS ---
  // IMPORTANTE: Mudamos de 'admin' para 'adminRouter' para evitar conflito com métodos internos do tRPC
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

      convidados.forEach((c) => {
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

export type AppRouter = typeof appRouter;
