/**
 * Admin Panel Premium - Release Candidate 5.3
 * Design Philosophy: Editorial, Clean, and High-Performance
 */

import { useState, useEffect, useMemo } from "react";
import { trpc } from "../lib/trpc";

interface Convidado {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: "Confirmado" | "Não Irá" | "Talvez" | "Pendente";
  acompanhantes?: number; 
  criancas?: number;      
  menores8?: number;     
  dataConfirmacao?: string;
  acompanhanteDetalhes?: string; 
  mensagem?: string;
  limite?: number;
}

export default function AdminPanel() {
  // --- AUTH & STATE ---
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [exibirForm, setExibirForm] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroResposta, setFiltroResposta] = useState<string>("todos");
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  
  const [formConvidado, setFormConvidado] = useState({ 
    nome: "", 
    email: "", 
    telefone: "", 
    limite: "" as string | number,
    status: "Pendente" as any
  });

  const SENHA_ADMIN = "casamento2026";

  // --- TRPC QUERIES & MUTATIONS ---
  const getAllConvidados = trpc.adminRouter.getAllConvidados.useQuery(undefined, {
    enabled: autenticado,
    retry: false,
  });

  const getCacheStats = trpc.adminRouter.getCacheStats.useQuery(undefined, {
    enabled: autenticado,
    refetchInterval: 30000, // Atualiza stats a cada 30s
  });

  const getRankingPresentes = trpc.adminRouter.getRankingPresentes.useQuery(undefined, {
    enabled: autenticado,
  });

  const refreshCacheMutation = trpc.adminRouter.refreshCache.useMutation();
  const adicionarConvidadoMutation = trpc.adminRouter.adicionarConvidado.useMutation();
  const atualizarConvidadoMutation = trpc.adminRouter.atualizarConvidado.useMutation();
  const deletarConvidadoMutation = trpc.adminRouter.deletarConvidado.useMutation();

  // --- EFFECTS ---
  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_auth") === "true";
    if (isAuth) setAutenticado(true);

    // Estilos globais para Safari/Mobile stability e Skeletons
    const style = document.createElement('style');
    style.innerHTML = `
      :root { --dvh: 100dvh; }
      body { background-color: #FDFAF6; }
      input, select, textarea { font-size: 16px !important; } /* Previne zoom no iOS */
      .no-scroll { overflow: hidden; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .animate-spin-slow { animation: spin 2s linear infinite; }
      @keyframes skeleton-loading {
        0% { background-color: #f3f4f6; }
        50% { background-color: #e5e7eb; }
        100% { background-color: #f3f4f6; }
      }
      .skeleton {
        animation: skeleton-loading 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // --- HANDLERS ---
  const autenticar = () => {
    if (senhaDigitada === SENHA_ADMIN) {
      setAutenticado(true);
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_auth_pass", senhaDigitada); 
      setSenhaDigitada("");
    } else {
      alert("Senha incorreta!");
      setSenhaDigitada("");
    }
  };

  const sair = () => {
    setAutenticado(false);
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_auth_pass");
  };

  const handleRefreshCache = async () => {
    if (carregando) return;
    try {
      setCarregando(true);
      await refreshCacheMutation.mutateAsync();
      await getAllConvidados.refetch();
      await getCacheStats.refetch();
    } catch (error) {
      alert("Erro ao atualizar cache.");
    } finally {
      setCarregando(false);
    }
  };

  const handleExport = () => {
    const data = getAllConvidados.data || [];
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,Status,Limite,Acompanhantes,Crianças,Mensagem\n"
      + data.map((c: any) => `"${c.nome}","${c.status}",${c.limite},${c.acompanhantes},${c.criancas},"${c.mensagem?.replace(/"/g, '""') || ''}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `convidados_casamento_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const salvarConvidado = async () => {
    if (!formConvidado.nome.trim()) return alert("Nome é obrigatório");
    try {
      setCarregando(true);
      const payload = {
        nome: formConvidado.nome,
        email: formConvidado.email,
        telefone: formConvidado.telefone,
        limite: Number(formConvidado.limite) || 0,
        status: formConvidado.status,
      };

      if (editandoId) {
        await atualizarConvidadoMutation.mutateAsync({ id: editandoId, ...payload });
      } else {
        await adicionarConvidadoMutation.mutateAsync(payload);
      }
      await getAllConvidados.refetch();
      limparForm();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setCarregando(false);
    }
  };

  const removerConvidado = async (id: string) => {
    if (!confirm("Remover este convidado?")) return;
    try {
      setCarregando(true);
      await deletarConvidadoMutation.mutateAsync({ id });
      await getAllConvidados.refetch();
    } catch (error) {
      alert("Erro ao remover.");
    } finally {
      setCarregando(false);
    }
  };

  const limparForm = () => {
    setFormConvidado({ nome: "", email: "", telefone: "", limite: "", status: "Pendente" });
    setEditandoId(null);
    setExibirForm(false);
  };

  const iniciarEdicao = (c: Convidado) => {
    setEditandoId(c.id);
    setFormConvidado({
      nome: c.nome,
      email: c.email || "",
      telefone: c.telefone || "",
      limite: c.limite ?? 0,
      status: c.status as any
    });
    setExibirForm(true);
  };

  // --- DATA PROCESSING ---
  const convidadosFiltrados = useMemo(() => {
    let list = (getAllConvidados.data as Convidado[]) || [];
    
    if (filtroResposta !== "todos") {
      if (filtroResposta === "Com Crianças") {
        list = list.filter(c => (c.criancas || 0) > 0);
      } else if (filtroResposta === "Com Menores de 8") {
        list = list.filter(c => (c.menores8 || 0) > 0);
      } else if (filtroResposta === "Com Mensagem") {
        list = list.filter(c => c.mensagem && c.mensagem.trim() !== "");
      } else {
        list = list.filter(c => c.status === filtroResposta);
      }
    }
    
    if (busca) {
      const b = busca.toLowerCase();
      list = list.filter(c => 
        c.nome.toLowerCase().includes(b) || 
        c.email?.toLowerCase().includes(b) || 
        c.telefone?.includes(b)
      );
    }
    return list;
  }, [getAllConvidados.data, filtroResposta, busca]);

  const stats = useMemo(() => {
    const list = (getAllConvidados.data as Convidado[]) || [];
    const confirmados = list.filter(c => c.status === "Confirmado");
    const ranking = (getRankingPresentes.data as any[]) || [];
    const totalPresentes = ranking.reduce((acc, p) => acc + p.valorTotal, 0);
    const mensagens = list.filter(c => c.mensagem && c.mensagem.trim() !== "").length;
    
    const totalCriancas = confirmados.reduce((acc, c) => acc + (c.criancas || 0), 0);
    const menores8 = confirmados.reduce((acc, c) => acc + (c.menores8 || 0), 0);
    
    return {
      totalLista: list.length,
      confirmados: confirmados.reduce((acc, c) => acc + 1 + (c.acompanhantes || 0), 0),
      criancas: totalCriancas,
      menores8,
      maiores8: totalCriancas - menores8,
      acompanhantes: confirmados.reduce((acc, c) => acc + (c.acompanhantes || 0), 0),
      pendentes: list.filter(c => c.status === "Pendente").length,
      naoIrao: list.filter(c => c.status === "Não Irá").length,
      taxaConfirmacao: list.length ? Math.round((confirmados.length / list.length) * 100) : 0,
      valorPresentes: totalPresentes,
      mensagens,
      ranking
    };
  }, [getAllConvidados.data, getRankingPresentes.data]);

  const SkeletonCard = () => (
    <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm space-y-4 skeleton">
      <div className="h-3 w-20 bg-gray-200 rounded"></div>
      <div className="space-y-3">
        <div className="h-2 w-full bg-gray-100 rounded"></div>
        <div className="h-2 w-full bg-gray-100 rounded"></div>
        <div className="h-2 w-full bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  const SkeletonStat = () => (
    <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm skeleton">
      <div className="flex justify-between items-center mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
      </div>
      <div className="h-2 w-20 bg-gray-100 rounded mb-1"></div>
      <div className="h-2 w-12 bg-gray-100 rounded"></div>
    </div>
  );

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia, Daniel! 👋";
    if (hora >= 12 && hora < 18) return "Boa tarde, Daniel! 👋";
    return "Boa noite, Daniel! 👋";
  };

  const diasParaCasamento = Math.max(0, Math.ceil((new Date('2026-12-05').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  // --- RENDER HELPERS ---
  if (!autenticado) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFAF6] px-6">
        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <h1 className="font-halimun text-4xl text-[#462F29]">Admin</h1>
          <div className="bg-white p-8 border border-[#E8CECE] shadow-xl rounded-sm space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Acesso Restrito</p>
              <input 
                type="password" 
                placeholder="Digite a senha" 
                value={senhaDigitada} 
                onChange={(e) => setSenhaDigitada(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && autenticar()}
                className="w-full border-b border-[#E8CECE] py-3 text-center outline-none focus:border-wedding-gold transition-colors"
              />
            </div>
            <button 
              onClick={autenticar}
              className="w-full bg-[#462F29] text-white py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-wedding-gold transition-all active:scale-[0.98]"
            >
              Entrar no Painel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFAF6] font-montserrat pb-20 md:pb-10">
      {/* 1. Barra de Ações Superior (Fixa) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8CECE] px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="font-halimun text-2xl text-[#462F29]">{getSaudacao()}</h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            Faltam {diasParaCasamento} dias para o grande dia.
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getCacheStats.data?.isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
              {getCacheStats.data?.isSyncing ? 'Sincronizando...' : 'Sistema Online'}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#E8CECE] hidden md:block mx-2"></div>

          <button 
            onClick={handleRefreshCache}
            disabled={carregando}
            className="p-2.5 bg-[#FDFAF6] border border-[#E8CECE] rounded-full hover:bg-white hover:shadow-md transition-all active:scale-90 relative group"
            title="Atualizar Cache"
          >
            <span className={`block ${carregando ? 'animate-spin' : ''}`}>🔄</span>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#462F29] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Atualizar Cache</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="p-2.5 bg-[#FDFAF6] border border-[#E8CECE] rounded-full hover:bg-white hover:shadow-md transition-all active:scale-90 relative group"
            title="Exportar CSV"
          >
            <span>📥</span>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#462F29] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Exportar CSV</span>
          </button>

          <button 
            onClick={() => setExibirForm(true)}
            className="bg-[#462F29] text-white px-4 py-2.5 rounded-full text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-wedding-gold transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="text-sm">+</span> <span className="hidden sm:inline">Novo Convidado</span>
          </button>

          <button onClick={sair} className="text-[9px] uppercase tracking-widest text-red-400 font-bold hover:text-red-600 transition-colors ml-2">Sair</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
        
        {/* 2. Resumo de Hoje */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-wedding-gold rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Resumo de Hoje</h2>
          </div>
          <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm">
            <p className="text-[12px] text-gray-500 italic">Hoje não houve novas movimentações.</p>
          </div>
        </section>

        {/* 3. Indicadores Inteligentes */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-wedding-gold rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Indicadores Inteligentes</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getAllConvidados.isLoading ? Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />) : (
              <>
                <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Presente Mais Escolhido</p>
                  <h4 className="text-[16px] font-bold text-[#462F29] truncate">
                    {stats.ranking.length > 0 ? stats.ranking[0].presenteNome : 'Nenhum'}
                  </h4>
                  <p className="text-[8px] text-gray-300 uppercase tracking-tighter">
                    {stats.ranking.length > 0 ? `${stats.ranking[0].quantidade} Cotas` : ''}
                  </p>
                </div>
                <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Última Confirmação</p>
                  <h4 className="text-[16px] font-bold text-[#462F29] truncate">
                    {getAllConvidados.data && (getAllConvidados.data as Convidado[]).filter(c => c.dataConfirmacao).sort((a, b) => new Date(b.dataConfirmacao!).getTime() - new Date(a.dataConfirmacao!).getTime())[0]?.nome || 'Nenhuma'}
                  </h4>
                  <p className="text-[8px] text-gray-300 uppercase tracking-tighter">
                    {getAllConvidados.data && (getAllConvidados.data as Convidado[]).filter(c => c.dataConfirmacao).sort((a, b) => new Date(b.dataConfirmacao!).getTime() - new Date(a.dataConfirmacao!).getTime())[0]?.dataConfirmacao?.split(',')[0] || ''}
                  </p>
                </div>
                <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Última Sincronização</p>
                  <h4 className="text-[16px] font-bold text-[#462F29]">
                    {getCacheStats.data?.lastUpdate ? new Date(getCacheStats.data.lastUpdate).toLocaleTimeString('pt-BR') : '--:--'}
                  </h4>
                  <p className="text-[8px] text-gray-300 uppercase tracking-tighter">
                    {getCacheStats.data?.lastUpdate ? new Date(getCacheStats.data.lastUpdate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Crianças Menores de 8</p>
                  <h4 className="text-[16px] font-bold text-blue-500">{stats.menores8}</h4>
                  <p className="text-[8px] text-gray-300 uppercase tracking-tighter">Total Confirmadas</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 4. Necessita Atenção (Alertas Inteligentes) */}
        {!getAllConvidados.isLoading && (
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-orange-400 rounded-full"></div>
              <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Necessita Atenção</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.pendentes > 30 && (
                <div className="bg-red-50 p-4 border border-red-200 rounded-sm flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-[12px] text-red-700">Mais de 30 convidados pendentes de confirmação.</p>
                </div>
              )}
              {stats.mensagens > 0 && (
                <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-sm flex items-center gap-3">
                  <span className="text-xl">✉️</span>
                  <p className="text-[12px] text-yellow-700">Novas mensagens não lidas.</p>
                </div>
              )}
              {getCacheStats.data && getCacheStats.data.cacheAgeSeconds > 300 && (
                <div className="bg-orange-50 p-4 border border-orange-200 rounded-sm flex items-center gap-3">
                  <span className="text-xl">⏳</span>
                  <p className="text-[12px] text-orange-700">Cache desatualizado. Considere sincronizar.</p>
                </div>
              )}
              {stats.pendentes <= 30 && stats.mensagens === 0 && (getCacheStats.data && getCacheStats.data.cacheAgeSeconds <= 300) && (
                <div className="bg-green-50 p-4 border border-green-200 rounded-sm flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <p className="text-[12px] text-green-700">Tudo sob controle! Nenhuma pendência urgente.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Últimas Atualizações (Timeline) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-wedding-gold rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Últimas Atualizações</h2>
          </div>
          <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm">
            <p className="text-[12px] text-gray-500 italic">Histórico de atualizações em breve.</p>
          </div>
        </section>

        {/* 6. Ranking dos Presentes */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-[#462F29] rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Ranking dos Presentes</h2>
          </div>
          
          {stats.ranking.length > 0 ? (
            <div className="bg-white border border-[#E8CECE] rounded-sm shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.ranking.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#FDFAF6] border border-[#E8CECE]/50 rounded-sm">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#462F29] uppercase truncate max-w-[180px]">
                        {idx === 0 && '🥇 '}
                        {idx === 1 && '🥈 '}
                        {idx === 2 && '🥉 '}
                        {p.presenteNome}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                        {p.quantidade} Cotas • {stats.valorPresentes > 0 ? Math.round((p.valorTotal / stats.valorPresentes) * 100) : 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-wedding-gold">
                        {p.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center border border-[#E8CECE] rounded-sm">
              <p className="text-[11px] uppercase tracking-widest text-gray-300 font-bold">Nenhum presente registrado ainda</p>
            </div>
          )}
        </section>

        {/* 7. Mensagens Recentes */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-pink-400 rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Mensagens Recentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAllConvidados.isLoading ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />) : 
             convidadosFiltrados.filter(c => c.mensagem && c.mensagem.trim() !== "").slice(0, 3).map((c) => (
              <div key={`msg-${c.id}`} className="bg-white p-6 border border-[#E8CECE] rounded-sm shadow-sm hover:shadow-md transition-all relative">
                <div className="absolute top-4 right-4 text-pink-100 text-4xl font-serif">"</div>
                <div className="space-y-4">
                  <p className="text-[13px] text-[#462F29]/80 leading-relaxed italic pr-4">
                    {c.mensagem}
                  </p>
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                    <div>
                      <p className="text-[11px] font-bold text-[#462F29] uppercase tracking-wider">{c.nome}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">{c.status}</p>
                    </div>
                    {c.dataConfirmacao && (
                      <p className="text-[8px] text-gray-300 uppercase tracking-tighter">{c.dataConfirmacao.split(',')[0]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {convidadosFiltrados.filter(c => c.mensagem && c.mensagem.trim() !== "").length === 0 && (
              <div className="col-span-full bg-white p-12 text-center border border-[#E8CECE] rounded-sm">
                <p className="text-[11px] uppercase tracking-widest text-gray-300 font-bold">Nenhuma mensagem recebida ainda</p>
              </div>
            )}
          </div>
          {convidadosFiltrados.filter(c => c.mensagem && c.mensagem.trim() !== "").length > 3 && (
            <div className="text-center mt-6">
              <button 
                onClick={() => setFiltroResposta("Com Mensagem")}
                className="text-[10px] uppercase tracking-widest font-bold text-wedding-gold hover:underline"
              >
                Ver todas as mensagens
              </button>
            </div>
          )}
        </section>

        {/* 8. Lista de Convidados (Cards Expansíveis) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-[#462F29] rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-[#462F29]">Lista de Convidados</h2>
          </div>

          <div className="bg-white p-4 border border-[#E8CECE] rounded-sm shadow-sm space-y-4 mb-6">
            <div className="relative flex-grow w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar na lista de convidados..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#FDFAF6] border-none outline-none text-[13px] placeholder:text-gray-300 focus:ring-1 focus:ring-wedding-gold/20 transition-all rounded-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full no-scrollbar">
              {["todos", "Confirmado", "Não Irá", "Talvez", "Pendente", "Com Crianças", "Com Menores de 8", "Com Mensagem"].map((f) => (
                <button 
                  key={f} 
                  onClick={() => setFiltroResposta(f)}
                  className={`px-4 py-2.5 rounded-full text-[9px] uppercase tracking-widest font-bold whitespace-nowrap transition-all
                    ${filtroResposta === f ? 'bg-[#462F29] text-white shadow-lg' : 'bg-[#FDFAF6] text-gray-400 border border-[#E8CECE] hover:border-wedding-gold'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {getAllConvidados.isLoading ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />) : 
             convidadosFiltrados.length > 0 ? convidadosFiltrados.map((c) => (
              <div key={c.id} className="bg-white border border-[#E8CECE] rounded-sm shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50"
                  onClick={() => setExpandidoId(expandidoId === c.id ? null : c.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                      ${c.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 
                        c.status === 'Não Irá' ? 'bg-red-100 text-red-700' : 
                        c.status === 'Talvez' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'}`}>
                      {c.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#462F29] uppercase tracking-wide">{c.nome}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border
                          ${c.status === 'Confirmado' ? 'bg-green-50 text-green-600 border-green-100' : 
                            c.status === 'Não Irá' ? 'bg-red-50 text-red-400 border-red-100' : 
                            c.status === 'Talvez' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                            'bg-gray-50 text-gray-400 border-gray-100'}`}>
                          {c.status}
                        </span>
                        {(c.acompanhantes || 0) > 0 && (
                          <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                            {c.acompanhantes} Adultos
                          </span>
                        )}
                        {(c.criancas || 0) > 0 && (
                          <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            {c.criancas} Crianças
                          </span>
                        )}
                        {c.mensagem && (
                          <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
                            💌 Mensagem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); iniciarEdicao(c); }}
                        className="p-2 text-gray-400 hover:text-wedding-gold transition-colors"
                        title="Editar"
                      >
                        📝
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removerConvidado(c.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className={`transition-transform duration-300 ${expandidoId === c.id ? 'rotate-180' : ''}`}>
                      🔽
                    </div>
                  </div>
                </div>
                
                {/* Detalhes Expandidos */}
                {expandidoId === c.id && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray-50 bg-[#FDFAF6]/30 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Acompanhantes Adultos</h5>
                          <div className="space-y-1">
                            {c.acompanhanteDetalhes ? c.acompanhanteDetalhes.split('\n').filter(line => !line.includes('(')).map((nome, idx) => (
                              <p key={idx} className="text-[12px] text-[#462F29] font-medium">• {nome}</p>
                            )) : <p className="text-[11px] text-gray-400 italic">Nenhum acompanhante adulto informado.</p>}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Crianças</h5>
                          <div className="space-y-1">
                            {c.acompanhanteDetalhes ? c.acompanhanteDetalhes.split('\n').filter(line => line.includes('(')).map((detalhe, idx) => {
                              const idadeMatch = detalhe.match(/\((\d+)\s+anos\)/);
                              const idade = idadeMatch ? parseInt(idadeMatch[1]) : 0;
                              return (
                                <p key={idx} className="text-[12px] text-[#462F29] font-medium">
                                  • {detalhe} {idade < 8 && <span className="text-[9px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full ml-2 uppercase font-bold tracking-tighter">Menor de 8</span>}
                                </p>
                              );
                            }) : <p className="text-[11px] text-gray-400 italic">Nenhuma criança informada.</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Mensagem do Convidado</h5>
                          <div className="bg-white p-4 border border-[#E8CECE]/50 rounded-sm italic">
                            <p className="text-[12px] text-[#462F29]/80 leading-relaxed">
                              {c.mensagem ? `"${c.mensagem}"` : "Nenhuma mensagem enviada."}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-6 pt-2">
                          <div>
                            <h5 className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Telefone</h5>
                            <p className="text-[12px] text-[#462F29]">{c.telefone || '--'}</p>
                          </div>
                          <div>
                            <h5 className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">E-mail</h5>
                            <p className="text-[12px] text-[#462F29]">{c.email || '--'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="bg-white p-20 text-center border border-[#E8CECE] rounded-sm">
                <span className="text-4xl block mb-4">🍃</span>
                <p className="text-[11px] uppercase tracking-widest text-gray-300 font-bold">Nenhum convidado encontrado</p>
              </div>
            )}
          </div>
        </section>

        {/* 9. Informações Técnicas (Sistema) */}
        <section className="space-y-6 pt-10 border-t border-[#E8CECE]/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-gray-300 rounded-full"></div>
            <h2 className="font-montserrat text-[14px] font-bold uppercase tracking-[0.2em] text-gray-400">Informações Técnicas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {getCacheStats.isLoading ? <SkeletonCard /> : (
              <div className="bg-white/50 p-5 border border-[#E8CECE] rounded-sm space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status do Cache</h3>
                  <span className="text-[10px] font-mono text-wedding-gold/50">v1.2.1</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-gray-400">Convidados Carregados</span>
                    <span className="text-[11px] font-bold text-gray-500">{getCacheStats.data?.count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-gray-400">Última Sinc.</span>
                    <span className="text-[11px] font-bold text-gray-500">
                      {getCacheStats.data?.lastUpdate ? new Date(getCacheStats.data.lastUpdate).toLocaleTimeString('pt-BR') : '--:--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-gray-400">Idade do Cache</span>
                    <span className="text-[11px] font-bold text-gray-500">{getCacheStats.data?.cacheAgeSeconds || 0}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-gray-400">Tempo de Sinc.</span>
                    <span className="text-[11px] font-bold text-gray-500">{getCacheStats.data?.lastSyncDurationMs || 0}ms</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${getCacheStats.data?.isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500/50'}`}></div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                    {getCacheStats.data?.isSyncing ? 'Sincronizando...' : 'Sistema Estável'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="md:col-span-3 bg-white/30 p-6 border border-dashed border-[#E8CECE] rounded-sm flex flex-col items-center justify-center text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Dica de Performance</p>
              <p className="text-[11px] text-gray-400/70 max-w-md">
                O sistema utiliza um cache inteligente para garantir que o site carregue instantaneamente para seus convidados. 
                Sincronizações manuais são necessárias apenas após grandes alterações na planilha.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Modal de Formulário (Premium) */}
      {exibirForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#462F29]/40 backdrop-blur-sm" onClick={limparForm}></div>
          <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#462F29] px-8 py-6 flex justify-between items-center">
              <h2 className="font-cormorant text-2xl text-white uppercase tracking-widest">
                {editandoId ? 'Editar Convidado' : 'Novo Convidado'}
              </h2>
              <button onClick={limparForm} className="text-white/60 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formConvidado.nome} 
                    onChange={(e) => setFormConvidado({...formConvidado, nome: e.target.value})}
                    className="w-full border-b border-[#E8CECE] py-2 outline-none focus:border-wedding-gold transition-colors text-[14px]"
                    placeholder="Ex: Mariana Abelha"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">E-mail</label>
                    <input 
                      type="email" 
                      value={formConvidado.email} 
                      onChange={(e) => setFormConvidado({...formConvidado, email: e.target.value})}
                      className="w-full border-b border-[#E8CECE] py-2 outline-none focus:border-wedding-gold transition-colors text-[14px]"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Telefone</label>
                    <input 
                      type="tel" 
                      value={formConvidado.telefone} 
                      onChange={(e) => setFormConvidado({...formConvidado, telefone: e.target.value})}
                      className="w-full border-b border-[#E8CECE] py-2 outline-none focus:border-wedding-gold transition-colors text-[14px]"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Limite Acompanhantes</label>
                    <input 
                      type="number" 
                      value={formConvidado.limite} 
                      onChange={(e) => setFormConvidado({...formConvidado, limite: e.target.value})}
                      className="w-full border-b border-[#E8CECE] py-2 outline-none focus:border-wedding-gold transition-colors text-[14px]"
                    />
                  </div>
                  {editandoId && (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Status Atual</label>
                      <select 
                        value={formConvidado.status} 
                        onChange={(e) => setFormConvidado({...formConvidado, status: e.target.value as any})}
                        className="w-full border-b border-[#E8CECE] py-2 outline-none focus:border-wedding-gold transition-colors text-[14px] bg-transparent"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Não Irá">Não Irá</option>
                        <option value="Talvez">Talvez</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  onClick={salvarConvidado}
                  disabled={carregando}
                  className="flex-grow bg-[#462F29] text-white py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-wedding-gold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {carregando ? 'Processando...' : editandoId ? 'Salvar Alterações' : 'Cadastrar Convidado'}
                </button>
                <button 
                  onClick={limparForm}
                  className="px-8 border border-[#E8CECE] text-gray-400 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#FDFAF6] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
