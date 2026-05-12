/**
 * Admin Panel - Gerenciamento de Convidados
 * Design Philosophy: Minimalismo Japonês Contemporâneo
 */

import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";

interface Convidado {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: "Confirmado" | "Não Irá" | "Talvez" | "Pendente";
  acompanhantes?: number; // Representa adultos ou crianças > 8 anos
  criancas?: number;      // Representa crianças < 8 anos
  menores8?: number;     // Campo redundante vindo do servidor, vamos focar em 'criancas'
  dataConfirmacao?: string;
  acompanhanteDetalhes?: string; // Nomes dos acompanhantes
  mensagem?: string;
  limite?: number;
}

export default function AdminPanel() {
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [exibirForm, setExibirForm] = useState(false);
  
  const [formConvidado, setFormConvidado] = useState({ 
    nome: "", 
    email: "", 
    telefone: "", 
    limite: 0, 
    status: "Pendente" as any,
    acompanhantes: 0,
    criancas: 0
  });

  const [filtroResposta, setFiltroResposta] = useState<"todos" | "Confirmado" | "Não Irá" | "Talvez" | "Pendente">("todos");
  const [busca, setBusca] = useState("");

  const SENHA_ADMIN = "casamento2026";

  const getAllConvidados = trpc.adminRouter.getAllConvidados.useQuery(undefined, {
    enabled: autenticado,
    retry: false,
  });

  const adicionarConvidadoMutation = trpc.adminRouter.adicionarConvidado.useMutation();
  const atualizarConvidadoMutation = trpc.adminRouter.atualizarConvidado.useMutation();
  const deletarConvidadoMutation = trpc.adminRouter.deletarConvidado.useMutation();

  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_auth") === "true";
    if (isAuth) setAutenticado(true);
  }, []);

  useEffect(() => {
    if (autenticado && getAllConvidados.data) {
      setConvidados((getAllConvidados.data as Convidado[]) || []);
    }
  }, [autenticado, getAllConvidados.data]);

  function autenticar() {
    if (senhaDigitada === SENHA_ADMIN) {
      setAutenticado(true);
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_auth_pass", senhaDigitada); 
      setSenhaDigitada("");
    } else {
      alert("Senha incorreta!");
      setSenhaDigitada("");
    }
  }

  function sair() {
    setAutenticado(false);
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_auth_pass");
  }

  async function salvarConvidado() {
    if (!formConvidado.nome.trim()) {
      alert("Digite o nome do convidado");
      return;
    }
    try {
      setCarregando(true);
      if (editandoId) {
        await atualizarConvidadoMutation.mutateAsync({
          id: editandoId,
          nome: formConvidado.nome,
          email: formConvidado.email,
          telefone: formConvidado.telefone,
          limite: Number(formConvidado.limite),
          status: formConvidado.status,
          acompanhantes: Number(formConvidado.acompanhantes),
          criancas: Number(formConvidado.criancas),
        });
        alert("Convidado Alterado com sucesso");
      } else {
        await adicionarConvidadoMutation.mutateAsync({
          nome: formConvidado.nome,
          email: formConvidado.email,
          telefone: formConvidado.telefone,
          limite: Number(formConvidado.limite),
          acompanhantes: Number(formConvidado.acompanhantes),
          criancas: Number(formConvidado.criancas),
        });
        alert("Convidado Cadastrado com sucesso");
      }
      await getAllConvidados.refetch();
      limparForm();
    } catch (error) {
      alert("Erro ao processar solicitação.");
    } finally {
      setCarregando(false);
    }
  }

  function limparForm() {
    setFormConvidado({ 
      nome: "", 
      email: "", 
      telefone: "", 
      limite: 0, 
      status: "Pendente" as any,
      acompanhantes: 0,
      criancas: 0
    });
    setEditandoId(null);
    setExibirForm(false);
  }

  function iniciarEdicao(c: Convidado) {
    setEditandoId(c.id);
    setFormConvidado({
      nome: c.nome,
      email: c.email || "",
      telefone: c.telefone || "",
      limite: c.limite || 0,
      status: c.status as any,
      acompanhantes: Number(c.acompanhantes) || 0,
      criancas: Number(c.criancas) || 0,
    });
    setExibirForm(true);
  }

  async function removerConvidado(id: string) {
    if (confirm("Tem certeza que deseja remover este convidado?")) {
      try {
        setCarregando(true);
        await deletarConvidadoMutation.mutateAsync({ id });
        await getAllConvidados.refetch();
        alert("Convidado Removido com sucesso");
      } catch (error) {
        alert("Erro ao remover convidado");
      } finally {
        setCarregando(false);
      }
    }
  }

  const confirmadosLista = convidados.filter(c => c.status === "Confirmado");
  const stats = {
    total: convidados.length,
    // Total Evento = Titulares Confirmados + Acompanhantes (> 8 anos)
    confirmados: confirmadosLista.reduce((acc, c) => acc + 1 + (Number(c.acompanhantes) || 0), 0),
    naoIrao: convidados.filter(c => c.status === "Não Irá").length,
    talvez: convidados.filter(c => c.status === "Talvez").length,
    // Soma total de acompanhantes (> 8 anos) de todos os confirmados
    acompanhantes: confirmadosLista.reduce((acc, c) => acc + (Number(c.acompanhantes) || 0), 0),
    // Soma total de crianças (< 8 anos) de todos os confirmados
    criancasMenores8: confirmadosLista.reduce((acc, c) => acc + (Number(c.criancas) || 0), 0),
  };

  let convidadosFiltrados = Array.isArray(convidados) ? convidados : [];
  if (filtroResposta !== "todos") convidadosFiltrados = convidadosFiltrados.filter((c) => c && c.status === filtroResposta);
  if (busca) convidadosFiltrados = convidadosFiltrados.filter((c) => c && c.nome && c.nome.toLowerCase().includes(busca.toLowerCase()));

  const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontWeight: "normal", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "10px" };
  const tdStyle: React.CSSProperties = { padding: "16px", borderTop: "1px solid #E8CECE", color: "#2C2C2C", verticalAlign: "top", fontSize: "12px" };
  const inputStyle: React.CSSProperties = { padding: "10px 12px", border: "1px solid #E8CECE", backgroundColor: "#FDFAF6", fontFamily: "'Lato', sans-serif", fontSize: "13px", outline: "none" };

  if (!autenticado) {
    return (
      <div style={{ backgroundColor: "#FDFAF6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "42px", color: "#2C2C2C", marginBottom: "32px" }}>Painel Admin</h1>
          <div style={{ border: "1px solid #E8CECE", padding: "32px 24px", backgroundColor: "#FDFAF6" }}>
            <input type="password" placeholder="Senha" value={senhaDigitada} onChange={(e) => setSenhaDigitada(e.target.value)} onKeyPress={(e) => e.key === "Enter" && autenticar()} style={{ ...inputStyle, width: "100%", marginBottom: "16px", textAlign: "center" }} />
            <button onClick={autenticar} style={{ width: "100%", backgroundColor: "#C4876A", color: "#FFF", border: "none", padding: "12px", cursor: "pointer", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "16px" }}>Entrar</button>
            <a href="/" style={{ display: "block", color: "#888", fontSize: "11px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}>Voltar para o Site</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FDFAF6", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #E8CECE", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#FDFAF6", zIndex: 100 }}>
        <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "28px", color: "#2C2C2C", margin: 0 }}>Painel Administrativo</h1>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="/" style={{ color: "#888", fontSize: "10px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}>Site</a>
          <button onClick={() => setExibirForm(true)} style={{ backgroundColor: "#C9A96E", color: "#FFF", border: "none", padding: "8px 16px", fontSize: "10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>+ Novo Convidado</button>
          <button onClick={sair} style={{ background: "none", border: "none", color: "#C4876A", cursor: "pointer", fontSize: "12px", textTransform: "uppercase" }}>Sair</button>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Dashboard de Estatísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Total Lista", valor: stats.total, cor: "#2C2C2C" },
            { label: "Total Evento", valor: stats.confirmados, cor: "#4CAF50" },
            { label: "Não Irão", valor: stats.naoIrao, cor: "#F44336" },
            { label: "Talvez", valor: stats.talvez, cor: "#FF9800" },
            { label: "ACOMPANHANTES", valor: stats.acompanhantes, cor: "#2196F3" },
            { label: "Crianças (< 8 anos)", valor: stats.criancasMenores8, cor: "#E91E63" }
          ].map((s) => (
            <div key={s.label} style={{ border: "1px solid #E8CECE", padding: "20px", textAlign: "center", backgroundColor: "#FFF" }}>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: s.cor, margin: "0 0 4px 0" }}>{s.valor}</p>
              <p style={{ fontSize: "9px", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Formulário de Adição/Edição (MODAL) */}
        {exibirForm && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ border: "1px solid #E8CECE", padding: "32px", backgroundColor: "#FFF", width: "90%", maxWidth: "600px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", marginBottom: "24px", textAlign: "center" }}>
                {editandoId ? "Editar Convidado" : "Incluir Novo Convidado"}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Nome Completo</label>
                  <input type="text" placeholder="Ex: João Silva" value={formConvidado.nome} onChange={(e) => setFormConvidado({...formConvidado, nome: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>E-mail</label>
                    <input type="email" placeholder="email@exemplo.com" value={formConvidado.email} onChange={(e) => setFormConvidado({...formConvidado, email: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Telefone</label>
                    <input type="tel" placeholder="(00) 00000-0000" value={formConvidado.telefone} onChange={(e) => setFormConvidado({...formConvidado, telefone: e.target.value})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Limite Acomp.</label>
                    <input type="number" value={formConvidado.limite} onChange={(e) => setFormConvidado({...formConvidado, limite: parseInt(e.target.value) || 0})} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Acomp. (&gt; 8)</label>
                    <input type="number" value={formConvidado.acompanhantes} onChange={(e) => setFormConvidado({...formConvidado, acompanhantes: parseInt(e.target.value) || 0})} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Crianças (&lt; 8)</label>
                    <input type="number" value={formConvidado.criancas} onChange={(e) => setFormConvidado({...formConvidado, criancas: parseInt(e.target.value) || 0})} style={inputStyle} />
                  </div>
                </div>
                {editandoId && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Status de Confirmação</label>
                    <select value={formConvidado.status} onChange={(e) => setFormConvidado({...formConvidado, status: e.target.value as any})} style={inputStyle}>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Não Irá">Não Irá</option>
                      <option value="Talvez">Talvez</option>
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={salvarConvidado} disabled={carregando} style={{ backgroundColor: "#C4876A", color: "#FFF", border: "none", padding: "14px 28px", cursor: "pointer", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.1em", flex: 1 }}>
                  {carregando ? "Salvando..." : editandoId ? "Salvar Alterações" : "Cadastrar Convidado"}
                </button>
                <button onClick={limparForm} style={{ backgroundColor: "transparent", color: "#888", border: "1px solid #E8CECE", padding: "14px 28px", cursor: "pointer", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.1em" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Filtros e Busca */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {["todos", "Confirmado", "Não Irá", "Talvez", "Pendente"].map((f) => (
              <button key={f} onClick={() => setFiltroResposta(f as any)} style={{ background: filtroResposta === f ? "#2C2C2C" : "none", color: filtroResposta === f ? "#FFF" : "#888", border: "1px solid #E8CECE", padding: "6px 12px", fontSize: "10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {f}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ ...inputStyle, width: "300px" }} />
        </div>

        {/* Tabela de Convidados */}
        <div style={{ backgroundColor: "#FFF", border: "1px solid #E8CECE", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#FDFAF6" }}>
                <th style={thStyle}>Convidado</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Acomp.</th>
                <th style={thStyle}>Mensagem</th>
                <th style={thStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {convidadosFiltrados.map((c) => (
                <tr key={c.id}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{c.nome}</div>
                    <div style={{ fontSize: "10px", color: "#888" }}>{c.email || "Sem e-mail"} • {c.telefone || "Sem tel"}</div>
                    <div style={{ fontSize: "10px", color: "#C4876A", marginTop: "4px" }}>Limite: {c.limite || 0} acompanhantes</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: "4px 8px", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: c.status === "Confirmado" ? "#E8F5E9" : c.status === "Não Irá" ? "#FFEBEE" : "#F5F5F5", color: c.status === "Confirmado" ? "#2E7D32" : c.status === "Não Irá" ? "#C62828" : "#666" }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                      <strong>{Number(c.acompanhantes) || 0}</strong> acomp. {">"} 8<br/>
                      <strong>{Number(c.criancas) || 0}</strong> {"<"} 8
                    </div>
                    {c.acompanhanteDetalhes && (
                      <div style={{ fontSize: "9px", color: "#666", borderTop: "1px solid #F0F0F0", paddingTop: "4px", marginTop: "4px", whiteSpace: "pre-line" }}>
                        {c.acompanhanteDetalhes}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "11px", maxWidth: "200px", color: "#666", fontStyle: "italic" }}>
                      {c.mensagem || "-"}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => iniciarEdicao(c)} style={{ background: "none", border: "none", color: "#2196F3", cursor: "pointer", fontSize: "10px", textTransform: "uppercase" }}>Editar</button>
                      <button onClick={() => removerConvidado(c.id)} style={{ background: "none", border: "none", color: "#F44336", cursor: "pointer", fontSize: "10px", textTransform: "uppercase" }}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
