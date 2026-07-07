import { buscarTodosConvidados, type ConvidadoRow } from "../../googleSheets.js";

interface CachedGuest extends ConvidadoRow {
  nomeNormalizado: string;
}

class GuestCacheService {
  private cache: CachedGuest[] | null = null;
  private lastUpdate: number = 0;
  private syncDuration: number = 0;
  private readonly TTL = 5 * 60 * 1000; // 5 minutos em milissegundos
  private isSyncing = false;

  private normalizar(texto: string): string {
    return texto
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  public async getConvidados(): Promise<CachedGuest[]> {
    const now = Date.now();
    
    // Se o cache expirar ou não existir, atualiza
    if (!this.cache || (now - this.lastUpdate > this.TTL)) {
      await this.refreshCache();
    }

    return this.cache || [];
  }

  public async refreshCache(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    const start = Date.now();
    
    try {
      console.log("[GuestCacheService] Iniciando sincronização com Google Sheets...");
      const convidados = await buscarTodosConvidados(true);
      
      this.cache = convidados.map(c => ({
        ...c,
        nomeNormalizado: this.normalizar(c.nome)
      }));
      
      this.lastUpdate = Date.now();
      this.syncDuration = this.lastUpdate - start;
      
      console.log(`[GuestCacheService] Cache atualizado. ${this.cache.length} convidados sincronizados.`);
      console.log(`[GuestCacheService] Tempo de leitura: ${this.syncDuration}ms`);
    } catch (error) {
      console.error("[GuestCacheService] Erro ao atualizar cache:", error);
      
      // Se já temos um cache, mantemos ele mesmo que a atualização falhe (resiliência)
      if (!this.cache) {
        throw error;
      }
    } finally {
      this.isSyncing = false;
    }
  }

  public async buscar(nome: string): Promise<ConvidadoRow[]> {
    const termo = this.normalizar(nome);
    const lista = await this.getConvidados();
    
    const start = Date.now();
    
    // Busca inteligente:
    // 1. Busca por correspondência exata (Prioridade Máxima)
    let resultado = lista.filter(c => c.nomeNormalizado === termo);
    
    // 2. Se não encontrar exato, busca por partes do nome (Contém)
    if (resultado.length === 0 && termo.length >= 3) {
      resultado = lista.filter(c => c.nomeNormalizado.includes(termo));
    }
    
    // 3. Se ainda não encontrar, busca por primeiro nome ou sobrenome (Palavras isoladas)
    if (resultado.length === 0 && termo.length >= 3) {
      const palavrasTermo = termo.split(" ");
      resultado = lista.filter(c => {
        const palavrasNome = c.nomeNormalizado.split(" ");
        return palavrasTermo.every(p => palavrasNome.some(pn => pn.startsWith(p) || pn.endsWith(p)));
      });
    }

    const duration = Date.now() - start;
    
    if (duration > 50) {
      console.warn(`[GuestCacheService] Busca complexa detectada: ${duration}ms para o termo "${nome}"`);
    }
    
    return resultado;
  }

  public getStats() {
    return {
      count: this.cache?.length || 0,
      lastUpdate: this.lastUpdate ? new Date(this.lastUpdate).toISOString() : null,
      cacheAgeSeconds: Math.floor((Date.now() - this.lastUpdate) / 1000),
      lastSyncDurationMs: this.syncDuration,
      isSyncing: this.isSyncing
    };
  }
}

export const guestCacheService = new GuestCacheService();
