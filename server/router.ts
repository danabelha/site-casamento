import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
  buscarConvidados,
  salvarConfirmacao,
  buscarTodosConvidados,
  adicionarConvidado,
  atualizarConvidado,
  deletarConvidado,
} from "./googleSheets";

const t = initTRPC.create();

export const appRouter = t.router({
  // 🔍 Buscar convidado (Site Público)
  searchConvidados: t.procedure
    .input(z.object({ nome: z.string() }))
    .mutation(async ({ input }) => {
      // A função buscarConvidados em googleSheets.ts já foi alterada para busca EXATA
      const result = await buscarConvidados(input.nome);
      return result;
    }),

  // ✅ Confirmar presença (Site Público)
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

  // 🔐 Painel Administrativo
  admin: t.router({
    // Listar todos os convidados
    getAllConvidados: t.procedure.query(async () => {
      return await buscarTodosConvidados();
    }),

    // Adicionar novo convidado
    adicionarConvidado: t.procedure
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

    // Atualizar convidado existente
    atualizarConvidado: t.procedure
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

    // Remover convidado
    deletarConvidado: t.procedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await deletarConvidado(input.id);
      }),

    // Obter estatísticas para o dashboard
    getEstatisticas: t.procedure.query(async () => {
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
