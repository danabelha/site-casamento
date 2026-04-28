import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Link } from "wouter";

// Interface para o convidado (baseada no googleSheets.ts)
interface Convidado {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
  acompanhantes?: number;
  criancas?: number;
  menores8?: number;
  limite?: number;
  mensagem?: string;
  dataConfirmacao?: string;
}

// Componente de Login Seguro
function LoginPanel({ onLogin }: { onLogin: (pass: string) => void }) {
  const [pass, setPass] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-cream p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-sm shadow-sm border border-wedding-blush/20">
        <h2 className="font-halimun text-3xl text-wedding-terracotta text-center mb-6">Painel Admin</h2>
        <input
          type="password"
          placeholder="Senha de Acesso"
          className="wedding-input mb-4 text-center border p-2 w-full"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onLogin(pass)}
        />
        <button 
          onClick={() => onLogin(pass)}
          className="w-full bg-wedding-charcoal text-white py-3 uppercase text-xs tracking-widest hover:bg-black transition-colors"
        >
          Acessar Painel
        </button>
        <Link href="/">
          <p className="text-center mt-6 text-[10px] uppercase tracking-tighter text-gray-400 cursor-pointer hover:text-wedding-gold">Voltar ao Site</p>
        </Link>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [adminPass, setAdminPass] = useState<string | null>(localStorage.getItem("admin_secret"));
  const [isLogged, setIsLogged] = useState(!!adminPass);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConvidado, setEditingConvidado] = useState<Convidado | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    limite: 2,
  });

  const utils = trpc.useUtils();
  
  const { data: convidados, isLoading, error } = trpc.adminRouter.getAllConvidados.useQuery(undefined, {
    enabled: isLogged,
    retry: false,
  });

  const addMutation = trpc.adminRouter.adicionarConvidado.useMutation({
    onSuccess: () => {
      utils.adminRouter.getAllConvidados.invalidate();
      closeModal();
    }
  });

  const updateMutation = trpc.adminRouter.atualizarConvidado.useMutation({
    onSuccess: () => {
      utils.adminRouter.getAllConvidados.invalidate();
      closeModal();
    }
  });

  const deleteMutation = trpc.adminRouter.deletarConvidado.useMutation({
    onSuccess: () => {
      utils.adminRouter.getAllConvidados.invalidate();
    }
  });

  useEffect(() => {
    if (error) {
      handleLogout();
      alert("Sessão expirada ou senha incorreta.");
    }
  }, [error]);

  const handleLogin = (pass: string) => {
    localStorage.setItem("admin_secret", pass);
    setAdminPass(pass);
    setIsLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    setAdminPass(null);
    setIsLogged(false);
  };

  const openModal = (convidado?: Convidado) => {
    if (convidado) {
      setEditingConvidado(convidado);
      setFormData({
        nome: convidado.nome,
        email: convidado.email || "",
        telefone: convidado.telefone || "",
        limite: convidado.limite || 0,
      });
    } else {
      setEditingConvidado(null);
      setFormData({ nome: "", email: "", telefone: "", limite: 2 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingConvidado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConvidado) {
      await updateMutation.mutateAsync({ id: editingConvidado.id, ...formData });
    } else {
      await addMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este convidado?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  if (!isLogged) return <LoginPanel onLogin={handleLogin} />;

  // Estatísticas Detalhadas
  const confirmados = convidados?.filter((c: Convidado) => c.status === "Confirmado") || [];
  const totalConfirmados = confirmados.length;
  const totalAcompanhantesAdultos = confirmados.reduce((acc: number, c: Convidado) => acc + (c.acompanhantes || 0), 0);
  const totalCriancas = confirmados.reduce((acc: number, c: Convidado) => acc + (c.criancas || 0), 0);
  const totalGeral = totalConfirmados + totalAcompanhantesAdultos + totalCriancas;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-lato text-wedding-charcoal pb-20">
      <header className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-halimun text-2xl text-wedding-terracotta">Admin</h1>
          <span className="bg-wedding-gold/10 text-wedding-gold text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Live</span>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => openModal()}
            className="bg-wedding-gold text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-wedding-gold/80 transition-all shadow-md"
          >
            + Novo Convidado
          </button>
          <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">Sair</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Dashboard de Estatísticas Detalhado */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Total Lista", value: convidados?.length || 0, color: "border-gray-200" },
            { label: "Conv. Confirmados", value: totalConfirmados, color: "border-green-300" },
            { label: "Acomp. Adultos", value: totalAcompanhantesAdultos, color: "border-blue-200" },
            { label: "Crianças", value: totalCriancas, color: "border-pink-200" },
            { label: "Total de Pessoas", value: totalGeral, color: "border-wedding-gold" },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white p-6 border-b-4 ${stat.color} shadow-sm rounded-sm`}>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{stat.label}</p>
              <p className="text-3xl font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabela de Convidados */}
        <div className="bg-white border border-gray-100 shadow-md overflow-hidden rounded-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-normal">Convidado</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Detalhes (Acomp/Cria)</th>
                  <th className="p-4 font-normal">Mensagem</th>
                  <th className="p-4 font-normal text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Carregando lista...</td></tr>
                ) : convidados?.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Nenhum convidado cadastrado.</td></tr>
                ) : convidados?.map((c: Convidado) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-sm">{c.nome}</p>
                      <p className="text-[10px] text-gray-400">{c.email || "Sem e-mail"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-tighter font-bold ${
                        c.status === "Confirmado" ? "bg-green-100 text-green-700" : 
                        c.status === "Não Irá" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {c.status || "Pendente"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {c.status === "Confirmado" ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs">Adultos: <strong>{c.acompanhantes || 0}</strong></span>
                          <span className="text-xs">Crianças: <strong>{c.criancas || 0}</strong></span>
                        </div>
                      ) : (
                        <span className="text-gray-300">Limite: {c.limite}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {c.mensagem ? (
                        <div className="group relative">
                          <p className="text-[12px] text-gray-500 italic max-w-[200px] truncate cursor-help" title={c.mensagem}>
                            "{c.mensagem}"
                          </p>
                          <div className="hidden group-hover:block absolute z-10 bg-wedding-charcoal text-white text-[11px] p-3 rounded shadow-xl -left-2 top-6 w-64 leading-relaxed border border-white/10">
                            {c.mensagem}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-200">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openModal(c)} className="text-wedding-gold hover:text-wedding-gold/70 text-xs uppercase tracking-tighter font-bold">Editar</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs uppercase tracking-tighter font-bold">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl border border-wedding-blush/20">
            <h2 className="font-cormorant text-2xl mb-6 text-wedding-charcoal">{editingConvidado ? "Editar Convidado" : "Novo Convidado"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1 font-bold">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-200 p-3 text-sm focus:border-wedding-gold outline-none transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1 font-bold">E-mail (Opcional)</label>
                <input 
                  type="email" 
                  className="w-full border border-gray-200 p-3 text-sm focus:border-wedding-gold outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1 font-bold">Telefone</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 p-3 text-sm focus:border-wedding-gold outline-none transition-all"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1 font-bold">Limite Acomp.</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 p-3 text-sm focus:border-wedding-gold outline-none transition-all"
                    value={formData.limite}
                    onChange={(e) => setFormData({...formData, limite: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-wedding-charcoal text-white py-4 uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                  {editingConvidado ? "Salvar Alterações" : "Cadastrar Convidado"}
                </button>
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 py-4 uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all text-gray-500">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
