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
  acompanhantes?: number;
  criancas?: number;
  menores8?: number;
  dataConfirmacao?: string;
  acompanhanteDetalhes?: string;
  mensagem?: string;
  limite?: number;
}

export default function AdminPanel() {
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  const [formConvidado, setFormConvidado] = useState({
    nome: "",
    email: "",
    telefone: "",
    limite: 0,
    status: "Pendente" as any,
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

  // Segurança: Sessão expira ao fechar a aba (Ponto 2)
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
      setSenhaDigitada("");
    } else {
      alert("Senha incorreta!");
      setSenhaDigitada("");
    }
  }

  function sair() {
    setAutenticado(false);
    sessionStorage.removeItem("admin_auth");
  }

  async function salvarConvidado() {
    if (!formConvidado.nome.trim()) {
      alert("Digite o nome do convidado");
      return;
    }
    try {
      setCarregando(true);
      if (editandoId) {
        // Alteração (Ponto 7 e 8)
        await atualizarConvidadoMutation.mutateAsync({
          id: editandoId,
          nome: formConvidado.nome,
          email: formConvidado.email,
          telefone: formConvidado.telefone,
          limite: Number(formConvidado.limite),
          status: formConvidado.status,
        });
        alert("Convidado Alterado com sucesso");
      } else {
        // Inclusão (Ponto 6)
        await adicionarConvidadoMutation.mutateAsync({
          nome: formConvidado.nome,
          email: formConvidado.email || undefined,
          telefone: formConvidado.telefone || undefined,
          limite: Number(formConvidado.limite) || 0,
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
    setFormConvidado({ nome: "", email: "", telefone: "", limite: 0, status: "Pendente" });
    setEditandoId(null);
  }

  function iniciarEdicao(c: Convidado) {
    setEditandoId(c.id);
    setFormConvidado({
      nome: c.nome,
      email: c.email || "",
      telefone: c.telefone || "",
      limite: c.limite || 0,
      status: c.status || "Pendente",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removerConvidado(id: string) {
    if (confirm("Tem certeza que deseja remover este convidado?")) {
      try {
        setCarregando(true);
        await deletarConvidadoMutation.mutateAsync({ id });
        await getAllConvidados.refetch();
        alert("Convidado Removido com sucesso"); // Ponto 9
      } catch (error) {
        alert("Erro ao remover convidado");
      } finally {
        setCarregando(false);
      }
    }
  }

  // Estatísticas Detalhadas (Ponto 3)
  const confirmados = convidados.filter(c => c.status === "Confirmado");
  const stats = {
    total: convidados.length,
    confirmados: confirmados.length,
    naoIrao: convidados.filter(c => c.status === "Não Irá").length,
    talvez: convidados.filter(c => c.status === "Talvez").length,
    acompanhantes: confirmados.reduce((acc, c) => acc + (c.acompanhantes || 0), 0),
    criancas: confirmados.reduce((acc, c) => acc + (c.criancas || 0), 0),
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
            <button onClick={autenticar} style={{ width: "100%", backgroundColor: "#C4876A", color: "#FFF", border: "none", padding: "12px", cursor: "pointer", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.1em" }}>Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FDFAF6", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #E8CECE", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#FDFAF6", zIndex: 100 }}>
        <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "28px", color: "#2C2C2C", margin: 0 }}>Admin</h1>
        <button onClick={sair} style={{ background: "none", border: "none", color: "#C4876A", cursor: "pointer", fontSize: "12px", textTransform: "uppercase" }}>Sair</button>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Dashboard de Estatísticas (Ponto 3) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Total", valor: stats.total, cor: "#2C2C2C" },
            { label: "Confirmados", valor: stats.confirmados, cor: "#4CAF50" },
            { label: "Não Irão", valor: stats.naoIrao, cor: "#F44336" },
            { label: "Talvez", valor: stats.talvez, cor: "#FF9800" },
            { label: "Acompanhantes", valor: stats.acompanhantes, cor: "#2196F3" },
            { label: "Crianças < 9", valor: stats.criancas, cor: "#E91E63" }
          ].map((s) => (
            <div key={s.label} style={{ border: "1px solid #E8CECE", padding: "20px", textAlign: "center", backgroundColor: "#FFF" }}>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: s.cor, margin: "0 0 4px 0" }}>{s.valor}</p>
              <p style={{ fontSize: "9px", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Formulário de Adição/Edição (Ponto 6, 7, 8) */}
        <div style={{ border: "1px solid #E8CECE", padding: "24px", backgroundColor: "#FFF", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", marginBottom: "20px" }}>
            {editandoId ? "Editar Convidado" : "Incluir Novo Convidado"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <input type="text" placeholder="Nome Completo" value={formConvidado.nome} onChange={(e) => setFormConvidado({...formConvidado, nome: e.target.value})} style={inputStyle} />
            <input type="email" placeholder="E-mail" value={formConvidado.email} onChange={(e) => setFormConvidado({...formConvidado, email: e.target.value})} style={inputStyle} />
            <input type="tel" placeholder="Telefone" value={formConvidado.telefone} onChange={(e) => setFormConvidado({...formConvidado, telefone: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Limite Acomp." value={formConvidado.limite} onChange={(e) => setFormConvidado({...formConvidado, limite: parseInt(e.target.value) || 0})} style={inputStyle} />
            {editandoId && (
              <select value={formConvidado.status} onChange={(e) => setFormConvidado({...formConvidado, status: e.target.value as any})} style={inputStyle}>
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Não Irá">Não Irá</option>
                <option value="Talvez">Talvez</option>
              </select>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={salvarConvidado} disabled={carregando} style={{ backgroundColor: "#2C2C2C", color: "#FFF", border: "none", padding: "12px 24px", fontSize: "11px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {carregando ? "Processando..." : editandoId ? "Salvar Alterações" : "Incluir Convidado"}
            </button>
            {editandoId && (
              <button onClick={limparForm} style={{ backgroundColor: "#FDFAF6", color: "#888", border: "1px solid #E8CECE", padding: "12px 24px", fontSize: "11px", cursor: "pointer", textTransform: "uppercase" }}>Cancelar</button>
            )}
          </div>
        </div>

        {/* Filtros e Busca */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input type="text" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: "200px" }} />
          <select value={filtroResposta} onChange={(e) => setFiltroResposta(e.target.value as any)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="todos">Todos os Status</option>
            <option value="Confirmado">Confirmados</option>
            <option value="Não Irá">Não Irão</option>
            <option value="Talvez">Talvez</option>
            <option value="Pendente">Pendentes</option>
          </select>
        </div>

        {/* Lista de Convidados (Ponto 4) */}
        <div style={{ backgroundColor: "#FFF", border: "1px solid #E8CECE", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F2" }}>
                <th style={thStyle}>Convidado</th>
                <th style={thStyle}>E-mail / Telefone</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Acompanhantes (Nomes)</th>
                <th style={thStyle}>Mensagem</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {convidadosFiltrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#888", fontSize: "12px" }}>Nenhum convidado encontrado.</td></tr>
              ) : (
                convidadosFiltrados.map((c) => (
                  <tr key={c.id}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "bold" }}>{c.nome}</span>
                      <div style={{ fontSize: "9px", color: "#C9A96E", marginTop: "4px" }}>ID: {c.id} | Limite: {c.limite}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ marginBottom: "4px" }}>{c.email || "-"}</div>
                      <div style={{ color: "#888" }}>{c.telefone || "-"}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "2px", 
                        fontSize: "10px", 
                        textTransform: "uppercase",
                        backgroundColor: c.status === "Confirmado" ? "#E8F5E9" : c.status === "Não Irá" ? "#FFEBEE" : "#F5F5F5",
                        color: c.status === "Confirmado" ? "#2E7D32" : c.status === "Não Irá" ? "#C62828" : "#616161"
                      }}>
                        {c.status || "Pendente"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ maxWidth: "250px", fontSize: "11px", lineHeight: "1.4" }}>
                        {c.acompanhanteDetalhes ? (
                          <div style={{ whiteSpace: "pre-wrap" }}>{c.acompanhanteDetalhes}</div>
                        ) : (
                          <span style={{ color: "#CCC" }}>Nenhum acompanhante</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontStyle: "italic", color: "#666", maxWidth: "200px" }}>
                      {c.mensagem || "-"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <button onClick={() => iniciarEdicao(c)} style={{ color: "#C9A96E", background: "none", border: "none", cursor: "pointer", fontSize: "11px", textTransform: "uppercase" }}>Editar</button>
                        <button onClick={() => removerConvidado(c.id)} style={{ color: "#D4A5A5", background: "none", border: "none", cursor: "pointer", fontSize: "11px", textTransform: "uppercase" }}>Remover</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
