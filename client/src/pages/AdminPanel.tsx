/**
 * Admin Panel - Gerenciamento de Convidados
 * Design Philosophy: Minimalismo Japonês Contemporâneo
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

  const getAllConvidados = trpc.adminRouter.getAllConvidados.useQuery(undefined, {
    enabled: autenticado,
    retry: false,
  });

  const adicionarConvidadoMutation = trpc.adminRouter.adicionarConvidado.useMutation();
  const atualizarConvidadoMutation = trpc.adminRouter.atualizarConvidado.useMutation();
  const deletarConvidadoMutation = trpc.adminRouter.deletarConvidado.useMutation();

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
      setNovoConvidado({ nome: "", email: "", telefone: "", limite: 0 });
      alert("Convidado adicionado!");
    } catch (error) {
      alert("Erro ao adicionar.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  async function removerConvidado(id: string) {
    if (confirm("Tem certeza que deseja remover?")) {
      try {
        setCarregando(true);
        await deletarConvidadoMutation.mutateAsync({ id });
        await getAllConvidados.refetch();
      } catch (error) {
        alert("Erro ao remover");
      } finally {
        setCarregando(false);
      }
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
    } catch (error) {
      alert("Erro ao atualizar status");
    } finally {
      setCarregando(false);
    }
  }

  // Estatísticas Detalhadas
  const confirmados = convidados.filter(c => c.status === "Confirmado");
  const stats = {
    total: convidados.length,
    confirmados: confirmados.length,
    naoIrao: convidados.filter(c => c.status === "Não Irá").length,
    acompanhantes: confirmados.reduce((acc, c) => acc + (c.acompanhantes || 0), 0),
    criancas: confirmados.reduce((acc, c) => acc + (c.criancas || 0), 0),
  };

  let convidadosFiltrados = Array.isArray(convidados) ? convidados : [];
  if (filtroResposta !== "todos") convidadosFiltrados = convidadosFiltrados.filter((c) => c && c.status === filtroResposta);
  if (busca) convidadosFiltrados = convidadosFiltrados.filter((c) => c && c.nome && c.nome.toLowerCase().includes(busca.toLowerCase()));

  const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontWeight: "normal", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "10px" };
  const tdStyle: React.CSSProperties = { padding: "16px", borderTop: "1px solid #E8CECE", color: "#2C2C2C", verticalAlign: "middle" };
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
        <button onClick={() => setAutenticado(false)} style={{ background: "none", border: "none", color: "#C4876A", cursor: "pointer", fontSize: "12px", textTransform: "uppercase" }}>Sair</button>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Dashboard de Estatísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Total Lista", valor: stats.total, cor: "#2C2C2C" },
            { label: "Conv. Confirmados", valor: stats.confirmados, cor: "#4CAF50" },
            { label: "Acomp. Adultos", valor: stats.acompanhantes, cor: "#2196F3" },
            { label: "Crianças", valor: stats.criancas, cor: "#E91E63" },
            { label: "Total Pessoas", valor: stats.confirmados + stats.acompanhantes + stats.criancas, cor: "#C9A96E" }
          ].map((s) => (
            <div key={s.label} style={{ border: "1px solid #E8CECE", padding: "24px", textAlign: "center", backgroundColor: "#FFF" }}>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: s.cor, margin: "0 0 4px 0" }}>{s.valor}</p>
              <p style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Formulário de Adição */}
        <div style={{ border: "1px solid #E8CECE", padding: "24px", backgroundColor: "#FFF", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", marginBottom: "20px" }}>Adicionar Convidado</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <input type="text" placeholder="Nome" value={novoConvidado.nome} onChange={(e) => setNovoConvidado({...novoConvidado, nome: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Limite Acomp." value={novoConvidado.limite} onChange={(e) => setNovoConvidado({...novoConvidado, limite: parseInt(e.target.value) || 0})} style={inputStyle} />
          </div>
          <button onClick={adicionarConvidado} disabled={carregando} style={{ backgroundColor: "#2C2C2C", color: "#FFF", border: "none", padding: "12px 24px", fontSize: "12px", cursor: "pointer", textTransform: "uppercase" }}>{carregando ? "..." : "Adicionar"}</button>
        </div>

        {/* Tabela */}
        <div style={{ backgroundColor: "#FFF", border: "1px solid #E8CECE", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F2" }}>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Acomp/Cria</th>
                <th style={thStyle}>Mensagem</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {convidadosFiltrados.map((c) => (
                <tr key={c.id}>
                  <td style={tdStyle}>{c.nome}</td>
                  <td style={tdStyle}>
                    <select value={c.status || "Pendente"} onChange={(e) => atualizarStatus(c.id, e.target.value)} style={{ ...inputStyle, padding: "4px 8px" }}>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Não Irá">Não Irá</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: "11px" }}>{c.acompanhantes || 0}A / {c.criancas || 0}C</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: "11px", fontStyle: "italic", color: "#666", maxWidth: "200px" }}>
                    {c.mensagem || "-"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button onClick={() => removerConvidado(c.id)} style={{ color: "#D4A5A5", background: "none", border: "none", cursor: "pointer", fontSize: "11px", textTransform: "uppercase" }}>Remover</button>
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
