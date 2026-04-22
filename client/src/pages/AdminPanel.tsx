import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Link } from "wouter";

// Interface para o convidado (baseada no googleSheets.ts)
interface Convidado {
  id: string;
  nome: string;
  email?: string;
  status?: string;
  acompanhantes?: number;
  mensagem?: string;
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
          className="wedding-input mb-4 text-center"
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

  // Configuração do tRPC
  //const utils = trpc.useUtils();
  
  // Atualizado de .admin para .adminRouter conforme mudança no backend
  const { data: convidados, isLoading, error } = trpc.adminRouter.getAllConvidados.useQuery(undefined, {
    enabled: isLogged,
    retry: false,
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

  if (!isLogged) return <LoginPanel onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-lato text-wedding-charcoal">
      {/* Header do Admin */}
      <header className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="font-halimun text-2xl text-wedding-terracotta">Admin</h1>
          <span className="bg-wedding-gold/10 text-wedding-gold text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Live</span>
        </div>
        <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">Sair</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Dashboard de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total", value: convidados?.length || 0, color: "border-gray-200" },
            { label: "Confirmados", value: convidados?.filter((c: Convidado) => c.status === "Confirmado").length || 0, color: "border-green-200" },
            { label: "Não Irão", value: convidados?.filter((c: Convidado) => c.status === "Não Irá").length || 0, color: "border-red-200" },
            { label: "Acompanhantes", value: convidados?.reduce((acc: number, c: Convidado) => acc + (c.acompanhantes || 0), 0) || 0, color: "border-wedding-gold/30" },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white p-6 border-b-2 ${stat.color} shadow-sm`}>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabela de Convidados */}
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-normal">Convidado</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Acomp.</th>
                  <th className="p-4 font-normal">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">Carregando lista...</td></tr>
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
                    <td className="p-4 text-sm text-gray-500">{c.acompanhantes || 0}</td>
                    <td className="p-4 text-[12px] text-gray-400 italic max-w-xs truncate">{c.mensagem || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
