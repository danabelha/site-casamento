/**
 * Admin Panel Premium - Release Candidate 1
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
  const [filtroResposta, setFiltroResposta] = useState<"todos" | "Confirmado" | "Não Irá" | "Talvez" | "Pendente">("todos");
  
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

    // Estilos globais para Safari/Mobile stability
    const style = document.createElement('style');
    style.innerHTML = `
      :root { --dvh: 100dvh; }
      body { background-color: #FDFAF6; }
      input, select, textarea { font-size: 16px !important; } /* Previne zoom no iOS */
      .no-scroll { overflow: hidden; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .animate-spin-slow { animation: spin 2s linear infinite; }
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
    if (filtroResposta !== "todos") list = list.filter(c => c.status === filtroResposta);
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
    const totalPresentes = (getRankingPresentes.data as any[])?.reduce((acc, p) => acc + p.valorTotal, 0) || 0;
    
    return {
      totalLista: list.length,
      confirmados: confirmados.reduce((acc, c) => acc + 1 + (c.acompanhantes || 0), 0),
      criancas: confirmados.reduce((acc, c) => acc + (c.criancas || 0), 0),
      pendentes: list.filter(c => c.status === "Pendente").length,
      naoIrao: list.filter(c => c.status === "Não Irá").length,
      taxaConfirmacao: list.length ? Math.round((confirmados.length / list.length) * 100) : 0,
      valorPresentes: totalPresentes
    };
  }, [getAllConvidados.data, getRankingPresentes.data]);

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
        <div className="flex items-center gap-3">
          <h1 className="font-halimun text-2xl text-[#462F29] hidden md:block">Admin</h1>
          <div className="h-6 w-[1px] bg-[#E8CECE] hidden md:block mx-2"></div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getCacheStats.data?.isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
              {getCacheStats.data?.isSyncing ? 'Sincronizando...' : 'Sistema Online'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* 2. Cache Info & Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cache Info Card */}
          <div className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status do Cache</h3>
              <span className="text-[10px] font-mono text-wedding-gold">v1.2.0</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[11px] text-gray-500">Convidados</span>
                <span className="text-[11px] font-bold text-[#462F29]">{getCacheStats.data?.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-gray-500">Última Sinc.</span>
                <span className="text-[11px] font-bold text-[#462F29]">
                  {getCacheStats.data?.lastUpdate ? new Date(getCacheStats.data.lastUpdate).toLocaleTimeString('pt-BR') : '--:--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-gray-500">Idade</span>
                <span className="text-[11px] font-bold text-[#462F29]">{getCacheStats.data?.cacheAgeSeconds || 0}s</span>
              </div>
            </div>
            {carregando && (
              <div className="pt-2 border-t border-[#FDFAF6]">
                <p className="text-[9px] text-wedding-gold animate-pulse uppercase tracking-widest font-bold text-center">Sincronizando com Google Sheets...</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Confirmados", val: stats.confirmados, sub: "Pessoas", icon: "✨", color: "text-green-600" },
              { label: "Pendentes", val: stats.pendentes, sub: "Convites", icon: "⏳", color: "text-gray-400" },
              { label: "Taxa Conf.", val: `${stats.taxaConfirmacao}%`, sub: "Engajamento", icon: "📈", color: "text-wedding-gold" },
              { label: "Presentes", val: stats.valorPresentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), sub: "Estimado", icon: "🎁", color: "text-[#462F29]" },
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 border border-[#E8CECE] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className={`text-[18px] font-bold ${s.color}`}>{s.val}</span>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{s.label}</p>
                <p className="text-[8px] text-gray-300 uppercase tracking-tighter">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Busca & Filtros */}
        <div className="bg-white p-4 border border-[#E8CECE] rounded-sm shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou telefone..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FDFAF6] border-none outline-none text-[13px] placeholder:text-gray-300 focus:ring-1 focus:ring-wedding-gold/20 transition-all rounded-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {["todos", "Confirmado", "Não Irá", "Talvez", "Pendente"].map((f) => (
              <button 
                key={f} 
                onClick={() => setFiltroResposta(f as any)}
                className={`px-4 py-2.5 rounded-full text-[9px] uppercase tracking-widest font-bold whitespace-nowrap transition-all
                  ${filtroResposta === f ? 'bg-[#462F29] text-white shadow-lg' : 'bg-[#FDFAF6] text-gray-400 border border-[#E8CECE] hover:border-wedding-gold'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Lista de Convidados */}
        <div className="bg-white border border-[#E8CECE] rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFAF6] border-b border-[#E8CECE]">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Convidado</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold hidden md:table-cell text-center">Acomp.</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold hidden lg:table-cell">Mensagem</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDFAF6]">
                {convidadosFiltrados.length > 0 ? convidadosFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FDFAF6]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#462F29] text-[13px]">{c.nome}</div>
                      <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-2">
                        <span>{c.telefone || 'Sem tel'}</span>
                        <span className="text-gray-200">•</span>
                        <span>Limite: {c.limite}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold
                        ${c.status === 'Confirmado' ? 'bg-green-50 text-green-600' : 
                          c.status === 'Não Irá' ? 'bg-red-50 text-red-500' : 
                          c.status === 'Talvez' ? 'bg-orange-50 text-orange-500' : 
                          'bg-gray-50 text-gray-400'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className="text-[12px] font-bold text-[#462F29]">{c.acompanhantes || 0}</span>
                      {c.criancas ? <span className="text-[10px] text-wedding-gold ml-1">+{c.criancas}👶</span> : null}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-[11px] text-gray-500 italic max-w-xs truncate" title={c.mensagem}>
                        {c.mensagem || '--'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => iniciarEdicao(c)} className="text-[10px] uppercase font-bold text-wedding-gold hover:underline">Editar</button>
                        <button onClick={() => removerConvidado(c.id)} className="text-[10px] uppercase font-bold text-red-300 hover:text-red-500 transition-colors">Excluir</button>
                      </div>
                      {/* Mobile Actions (sempre visível) */}
                      <div className="flex justify-end gap-3 md:hidden">
                        <button onClick={() => iniciarEdicao(c)} className="text-lg">📝</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="space-y-3">
                        <span className="text-4xl block">🍃</span>
                        <p className="text-[11px] uppercase tracking-widest text-gray-300 font-bold">Nenhum convidado encontrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Ranking de Presentes (Visual Refinado) */}
        {getRankingPresentes.data && (getRankingPresentes.data as any[]).length > 0 && (
          <div className="bg-white border border-[#E8CECE] rounded-sm shadow-sm p-6">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-6">Ranking de Cotas de Presentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(getRankingPresentes.data as any[]).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#FDFAF6] border border-[#E8CECE]/50 rounded-sm">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#462F29] uppercase truncate max-w-[180px]">{p.presenteNome}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{p.quantidade} Contribuições</p>
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
        )}
      </main>

      {/* 6. Modal de Formulário (Premium) */}
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
