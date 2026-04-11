/**
 * Admin Panel - Gerenciamento de Convidados
 * Design Philosophy: Minimalismo Japonês Contemporâneo
 * Paleta: Cream (#FDFAF6), Blush (#D4A5A5), Terracotta (#C4876A), Charcoal (#2C2C2C), Gold (#C9A96E)
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
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
  const [novoConvidado, setNovoConvidado] = useState({
    nome: "",
    email: "",
    telefone: "",
    limite: 0,
  });
  const [filtroResposta, setFiltroResposta] = useState<"todos" | "Confirmado" | "Não Irá" | "Talvez" | "Pendente">("todos");
  const [busca, setBusca] = useState("");

  const SENHA_ADMIN = "casamento2026";

  const getAllConvidados = trpc.admin.getAllConvidados.useQuery(undefined, {
    enabled: autenticado,
    retry: false,
  });
  const getEstatisticas = trpc.admin.getEstatisticas.useQuery(undefined, {
    enabled: autenticado,
    retry: false,
  });

  const adicionarConvidadoMutation = trpc.admin.adicionarConvidado.useMutation();
  const atualizarConvidadoMutation = trpc.admin.atualizarConvidado.useMutation();
  const deletarConvidadoMutation = trpc.admin.deletarConvidado.useMutation();

  useEffect(() => {
    if (autenticado && getAllConvidados.data) {
      setConvidados((getAllConvidados.data as Convidado[]) || []);
    }
  }, [autenticado, getAllConvidados.data]);

  function autenticar() {
    if (senhaDigitada === SENHA_ADMIN) {
      setAutenticado(true);
      setSenhaDigitada("");
    } else {
      alert("Senha incorreta!");
      setSenhaDigitada("");
    }
  }

  async function adicionarConvidado() {
    if (!novoConvidado.nome.trim()) {
      alert("Digite o nome do convidado");
      return;
    }

    try {
      setCarregando(true);
      await adicionarConvidadoMutation.mutateAsync({
        nome: novoConvidado.nome,
        email: novoConvidado.email || undefined,
        telefone: novoConvidado.telefone || undefined,
        limite: Number(novoConvidado.limite) || 0,
      });

      await getAllConvidados.refetch();
      await getEstatisticas.refetch();
      setNovoConvidado({ nome: "", email: "", telefone: "", limite: 0 });
      alert("Convidado adicionado com sucesso!");
    } catch (error) {
      alert("Erro ao adicionar convidado.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  async function removerConvidado(id: string) {
    if (confirm("Tem certeza que deseja remover este convidado?")) {
      try {
        setCarregando(true);
        await deletarConvidadoMutation.mutateAsync({ id });
        await getAllConvidados.refetch();
        await getEstatisticas.refetch();
        alert("Convidado removido com sucesso!");
      } catch (error) {
        alert("Erro ao remover convidado");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }
  }

  async function atualizarLimite(id: string, novoLimite: number) {
    try {
      setCarregando(true);
      await atualizarConvidadoMutation.mutateAsync({
        id,
        limite: novoLimite,
      });
      await getAllConvidados.refetch();
    } catch (error) {
      alert("Erro ao atualizar limite");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarStatus(id: string, novoStatus: string) {
    try {
      setCarregando(true);
      await atualizarConvidadoMutation.mutateAsync({
        id,
        status: novoStatus as any,
      });
      await getAllConvidados.refetch();
      await getEstatisticas.refetch();
    } catch (error) {
      alert("Erro ao atualizar status");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  const stats = getEstatisticas.data || {
    total: 0, confirmados: 0, naoIrao: 0, talvez: 0, pendentes: 0, acompanhantes: 0, criancas: 0, menores8: 0,
  };

  let convidadosFiltrados = Array.isArray(convidados) ? convidados : [];
  if (filtroResposta !== "todos") convidadosFiltrados = convidadosFiltrados.filter((c) => c && c.status === filtroResposta);
  if (busca) convidadosFiltrados = convidadosFiltrados.filter((c) => c && c.nome && c.nome.toLowerCase().includes(busca.toLowerCase()));

  if (!autenticado) {
    return (
      <div style={{ backgroundColor: "#FDFAF6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "42px", color: "#2C2C2C", marginBottom: "32px" }}>Painel Admin</h1>
          <div style={{ border: "1px solid #E8CECE", padding: "32px 24px", backgroundColor: "#FDFAF6" }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#888", marginBottom: "20px", letterSpacing: "0.1em" }}>Digite a senha para acessar o painel administrativo</p>
            <input type="password" placeholder="Senha" value={senhaDigitada} onChange={(e) => setSenhaDigitada(e.target.value)} onKeyPress={(e) => e.key === "Enter" && autenticar()} style={{ width: "100%", padding: "12px 16px", border: "1px solid #E8CECE", backgroundColor: "#FDFAF6", fontFamily: "'Lato', sans-serif", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", outline: "none" }} />
            <button onClick={autenticar} className="admin-btn-primary" style={{ width: "100%" }}>Entrar</button>
            <Link href="/"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", color: "#C9A96E", marginTop: "20px", cursor: "pointer", textDecoration: "underline" }}>Voltar para o site</p></Link>
          </div>
        </div>
        <style>{`.admin-btn-primary { background-color: #C4876A; color: #FDFAF6; border: none; padding: 12px 24px; font-family: 'Lato', sans-serif; font-size: 12px; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: all 0.3s ease; }.admin-btn-primary:hover { background-color: #B37555; }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FDFAF6", minHeight: "100vh" }}>
      <header style={{ backgroundColor: "#FDFAF6", borderBottom: "1px solid #E8CECE", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(8px)" }}>
        <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "28px", color: "#2C2C2C", margin: 0 }}>Admin</h1>
        <button onClick={() => setAutenticado(false)} className="admin-btn-secondary">Sair</button>
      </header>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {getAllConvidados.isError && <div style={{ padding: "20px", backgroundColor: "#FEE2E2", border: "1px solid #EF4444", color: "#B91C1C", marginBottom: "20px", fontFamily: "'Lato', sans-serif", fontSize: "13px" }}>Erro ao carregar dados.</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {[ { label: "Total", valor: stats.total, cor: "#2C2C2C" }, { label: "Confirmados", valor: stats.confirmados, cor: "#4CAF50" }, { label: "Não Irão", valor: stats.naoIrao, cor: "#F44336" }, { label: "Talvez", valor: stats.talvez, cor: "#FF9800" }, { label: "Pendentes", valor: stats.pendentes, cor: "#9E9E9E" }, { label: "Acompanhantes", valor: stats.acompanhantes, cor: "#2196F3" }, { label: "Crianças", valor: stats.criancas, cor: "#E91E63" }, { label: "Menores de 8", valor: stats.menores8, cor: "#9C27B0" } ].map((stat) => (
            <div key={stat.label} style={{ border: "1px solid #E8CECE", padding: "20px", backgroundColor: "#FDFAF6", textAlign: "center" }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "24px", fontWeight: "bold", color: stat.cor, margin: "0 0 8px 0" }}>{stat.valor || 0}</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "10px", color: "#888", letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid #E8CECE", padding: "24px", marginBottom: "40px", backgroundColor: "#FDFAF6" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#2C2C2C", marginTop: 0, marginBottom: "20px" }}>Adicionar Novo Convidado</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <input type="text" placeholder="Nome completo" value={novoConvidado.nome} onChange={(e) => setNovoConvidado({ ...novoConvidado, nome: e.target.value })} style={inputStyle} />
            <input type="email" placeholder="Email" value={novoConvidado.email} onChange={(e) => setNovoConvidado({ ...novoConvidado, email: e.target.value })} style={inputStyle} />
            <input type="tel" placeholder="Telefone" value={novoConvidado.telefone} onChange={(e) => setNovoConvidado({ ...novoConvidado, telefone: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Limite Acompanhantes" value={novoConvidado.limite} onChange={(e) => setNovoConvidado({ ...novoConvidado, limite: parseInt(e.target.value) || 0 })} style={inputStyle} />
          </div>
          <button onClick={adicionarConvidado} disabled={carregando} className="admin-btn-primary">{carregando ? "Adicionando..." : "Adicionar Convidado"}</button>
        </div>
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input type="text" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: "200px" }} />
          <select value={filtroResposta} onChange={(e) => setFiltroResposta(e.target.value as any)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="todos">Todos</option>
            <option value="Confirmado">Confirmados</option>
            <option value="Não Irá">Não Irão</option>
            <option value="Talvez">Talvez</option>
            <option value="Pendente">Pendentes</option>
          </select>
        </div>
        <div style={{ overflowX: "auto", border: "1px solid #E8CECE", backgroundColor: "#FDFAF6" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Lato', sans-serif", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8CECE", backgroundColor: "#F5EEEB" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Limite</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Acomp.</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Crianças</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {convidadosFiltrados.map((convidado) => (
                <tr key={convidado.id} style={{ borderBottom: "1px solid #E8CECE" }}>
                  <td style={tdStyle}>{convidado.id}</td>
                  <td style={tdStyle}>{convidado.nome}</td>
                  <td style={tdStyle}>
                    <select value={convidado.status || "Pendente"} onChange={(e) => atualizarStatus(convidado.id, e.target.value)} style={{ ...inputStyle, padding: "6px 8px" }}>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Não Irá">Não Irá</option>
                      <option value="Talvez">Talvez</option>
                    </select>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <input type="number" value={convidado.limite || 0} onChange={(e) => atualizarLimite(convidado.id, parseInt(e.target.value) || 0)} style={{ width: "50px", textAlign: "center", border: "1px solid #E8CECE" }} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{convidado.acompanhantes || 0}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{convidado.criancas || 0}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button onClick={() => removerConvidado(convidado.id)} disabled={carregando} className="admin-btn-delete">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.admin-btn-primary { background-color: #C4876A; color: #FDFAF6; border: none; padding: 10px 20px; font-family: 'Lato', sans-serif; font-size: 12px; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: all 0.3s ease; }.admin-btn-primary:hover { background-color: #B37555; }.admin-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }.admin-btn-secondary { background-color: #D4A5A5; color: #FDFAF6; border: none; padding: 8px 16px; font-family: 'Lato', sans-serif; font-size: 10px; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; }.admin-btn-delete { background-color: #F44336; color: #FDFAF6; border: none; padding: 6px 12px; font-family: 'Lato', sans-serif; font-size: 10px; cursor: pointer; text-transform: uppercase; transition: all 0.3s ease; }.admin-btn-delete:hover { background-color: #D32F2F; }`}</style>
    </div>
  );
}

const inputStyle = { padding: "10px 12px", border: "1px solid #E8CECE", backgroundColor: "#FDFAF6", fontFamily: "'Lato', sans-serif", fontSize: "13px", outline: "none" };
const thStyle = { padding: "12px", textAlign: "left" as const, fontWeight: "bold", color: "#2C2C2C" };
const tdStyle = { padding: "12px", color: "#2C2C2C" };
