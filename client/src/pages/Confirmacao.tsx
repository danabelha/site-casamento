/*
 * Página de Confirmação — Otimizada para Mobile First com Tailwind 4
 */

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";

// Importar imagens
import manualImg from "../assets/images/manual_final_v2.png";
import headerLogo from "../assets/images/header_logo_perfect.png";
import princesaImg from "../assets/images/princesa.jpg";
import fazendeiroImg from "../assets/images/fazendeiro.jpg";
import camisaTimeImg from "../assets/images/camisa_time.jpg";
import poolPartyImg from "../assets/images/pool_party.png";
import planoSaudeImg from "../assets/images/plano_saude.jpg";
import cavacoImg from "../assets/images/cavaco.jpg";
import inicioTudoImg from "../assets/images/inicio_tudo.jpg";
import novoCapituloImg from "../assets/images/novo_capitulo.jpg";

// ===== CONSTANTES =====
const GALLERY_ITEMS = [
  {
    url: inicioTudoImg,
    titulo: "Como tudo começou",
    texto: "Essa foto guarda o início de tudo. Ainda não éramos um casal, mas já existia uma conexão que nenhum dos dois conseguia esconder. Sem perceber, estávamos escrevendo o primeiro capítulo da história que, hoje, temos a alegria de celebrar com vocês."
  },
  {
    url: novoCapituloImg,
    titulo: "UM NOVO CAPÍTULO",
    texto: "A vida sempre encontra uma forma de nos surpreender. Entre tantos sonhos realizados, nasceu o mais especial de todos: nossa família."
  },
  {
    url: "https://i.pinimg.com/736x/25/40/70/254070ff05550f897f4a850e6786c884.jpg",
    titulo: "O Pedido",
    texto: "Um 'sim' que ecoará pela eternidade. Sob o céu que testemunhou nosso amor, decidimos trilhar o mesmo caminho de mãos dadas."
  },
  {
    url: "https://i.pinimg.com/736x/a3/94/f2/a394f25f3491c43b14e44cee714aae35.jpg",
    titulo: "O Grande Dia",
    texto: "Agora, estamos prestes a celebrar o capítulo mais importante da nossa história. E sua presença tornará esse momento ainda mais especial."
  },
];

const PRESENTES = [
  { 
    nome: "👑 QUOTA PARA NOIVA CONTINUAR PRINCESA", 
    descricao: "Ajude a Mary a manter os altos padrões de realeza pelos próximos 50 anos.", 
    valor: "", 
    pix: "casamento@danielemariana.com", 
    foto: princesaImg
  },
  { 
    nome: "🚜 QUOTA PARA PROJETO BEEFARM", 
    descricao: "Abelha ainda acredita que um dia terá uma fazenda com algumas novilhas e um apiário para produzir o puro mel da abelha virgem.", 
    valor: "", 
    pix: "casamento@danielemariana.com", 
    foto: fazendeiroImg
  },
  { 
    nome: "👕 QUOTA PARA O NOIVO NÃO USAR CAMISA DE TIME", 
    descricao: "Ajude a Mary nesta importante missão social.", 
    valor: "", 
    pix: "casamento@danielemariana.com", 
    foto: camisaTimeImg
  },
  { 
    nome: "🏖️ QUOTA PARA POOL PARTY PÓS-CASAMENTO", 
    descricao: "O casamento acaba, mas o show tem que continuar.", 
    valor: "", 
    pix: "casamento@danielemariana.com", 
    foto: poolPartyImg
  },
  { 
    nome: "🏥 QUOTA PARA MANTER O PLANO DE SAÚDE PREMIUM DA NOIVA", 
    descricao: "Nem a ciência explica como alguém consegue gostar tanto de hospital.", 
    valor: "", 
    pix: "casamento@danielemariana.com", 
    foto: planoSaudeImg
  },
  { 
    nome: "🎶 FUNDO DO CAVACO", 
    descricao: 'Quota para pedir a música "MANDEEEEEEI MEU CAVACO CHORAR".', 
    valor: "", 
    pix: "casamento@danielemariana.com", 
    foto: cavacoImg
  },
];

const ENDERECO_CURTO = "R. Cônego Eugênio Leite, 1098 - Pinheiros, São Paulo - SP";
const MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Celeiro Quintal " + ENDERECO_CURTO)}`;

// ===== COMPONENTES AUXILIARES =====

function SectionDivider({ title, isVerification = false }: { title: string; isVerification?: boolean } ) {
  return (
    <div className="text-center mb-8 md:mb-12 px-4 animate-in fade-in duration-700">
      <h2 className={`font-cormorant font-light text-[#462F29] leading-tight tracking-wide whitespace-nowrap
        ${isVerification ? 'text-[22px] sm:text-[28px] md:text-[42px]' : 'text-[28px] md:text-[42px]'}`}>
        {title}
      </h2>
    </div>
  );
}

function SectionSeparator() {
  return (
    <div className="w-full flex justify-center py-6 md:py-8">
      {/* Separador minimalista invisível para manter o ritmo visual - Reduzido em RC-5.11 */}
    </div>
  );
}

function FadeSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`${className} transition-all duration-1000 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====

export default function Confirmacao() {
  // Adicionando animação customizada para a seta de navegação
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bounce-x {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(5px); }
      }
      .animate-bounce-x {
        animation: bounce-x 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  const [nomeBusca, setNomeBusca] = useState("");
  const [convidadoSelecionado, setConvidadoSelecionado] = useState<any>(null);
  const [resposta, setResposta] = useState<"Confirmado" | "Talvez" | "Não Irá" | null>(null);
  const acompanhantesRef = useRef<HTMLDivElement>(null);
  const mensagemRef = useRef<HTMLDivElement>(null);

  // RC-5.13.2: Guided RSVP Flow (UX) - Smooth scroll to next steps
  useEffect(() => {
    if (resposta === "Confirmado") {
      const delay = 300; // Aguardar animação de fade-in
      setTimeout(() => {
        if (convidadoSelecionado?.limite && convidadoSelecionado.limite > 0) {
          acompanhantesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          mensagemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, delay);
    }
  }, [resposta, convidadoSelecionado?.limite]);
  const [adultos, setAdultos] = useState<{ nome: string }[]>([]);
  const [criancas, setCriancas] = useState<{ nome: string; idade: string }[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const queryClient = useQueryClient();
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [mensagemCarregamento, setMensagemCarregamento] = useState("Preparando seu convite...");
  const [modalPresenteAberto, setModalPresenteAberto] = useState<number | null>(null);
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [outroValor, setOutroValor] = useState<string>("");
  const [carregandoRegistro, setCarregandoRegistro] = useState(false);

  const searchMutation = trpc.searchConvidados.useMutation();
  const confirmarMutation = trpc.confirmarPresenca.useMutation();
  const registrarPresenteMutation = trpc.registrarPresente.useMutation();
  const generatePixCodeMutation = trpc.generatePixCode.useMutation();

  const [pixGerado, setPixGerado] = useState<string | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [carregandoPixCode, setCarregandoPixCode] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);

  // Formatação de moeda BRL
  const formatarMoeda = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    const numero = parseFloat(limpo) / 100;
    if (isNaN(numero)) return "";
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const parseMoedaParaNumero = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    return parseFloat(limpo) / 100;
  };

  useEffect(() => {
    if (convidadoSelecionado) {
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  }, [convidadoSelecionado]);

  const handleSearch = async () => {
    const nomeLimpo = nomeBusca.trim();
    if (!nomeLimpo || carregandoBusca) return;
    
    // RC-5.10.5: Frontend Validation - Mandatory name and surname
    const normalizar = (texto: string) => texto.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const termo = normalizar(nomeLimpo);
    const palavras = termo.split(/\s+/).filter(p => p.length > 0);
    
    if (palavras.length < 2) {
      setErroBusca("Informe seu nome e sobrenome para localizar o convite.");
      return;
    }

    const startTime = Date.now();
    setErroBusca(null);
    setCarregandoBusca(true);
    setMensagemCarregamento("Verificando...");
    
    // RC-5.10.4: Coordinated Health Check & Search
    try {
      // 1. Verificar se o Health Check (disparado no App.tsx) ainda está pendente
      const queryState = queryClient.getQueryState(["health"]);
      const isHealthPending = queryState?.status === "pending";
      
      if (isHealthPending) {
        setMensagemCarregamento("Preparando seu convite... 💛");
        // Health Check em andamento. Aguardando até 8s...
        
        // Aguardar o Health Check ou timeout de 8s
        await Promise.race([
          queryClient.fetchQuery({ queryKey: ["health"] }),
          new Promise(resolve => setTimeout(resolve, 8000))
        ]).catch(() => {
          // Health Check falhou ou expirou. Seguindo para busca.
        });
      }

      // 2. Executar a busca com timeout e retry controlado
      const makeSearchAttempt = async (attempt: number) => {
        if (attempt > 1) setMensagemCarregamento("Finalizando preparação... ✨");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("TIMEOUT")), 15000)
        );
        
        return Promise.race([
          searchMutation.mutateAsync({ nome: nomeBusca }),
          timeoutPromise
        ]);
      };

      let resultado;
      try {
        resultado = await makeSearchAttempt(1);
      } catch (error: any) {
        if (error?.message === "TIMEOUT") {
          // Primeira busca falhou por TIMEOUT. Tentando retry final...
          resultado = await makeSearchAttempt(2);
        } else {
          throw error;
        }
      }

      // 3. Processar Resultado
      const duration = Date.now() - startTime;
      const minDuration = 300;
      if (duration < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - duration));
      }

      if (resultado && (resultado as any).length > 0) {
        const lista = resultado as any[];
        
        // RC-5.10.5: Ambiguity handling
        if (lista.length > 1) {
          // Tentar encontrar correspondência exata
          const exato = lista.find(c => normalizar(c.nome) === termo);
          if (exato) {
            setConvidadoSelecionado(exato);
          } else {
            setErroBusca("Encontramos mais de um convite com esse nome. Informe o nome completo para continuar.");
          }
        } else {
          setConvidadoSelecionado(lista[0]);
        }
      } else {
        setErroBusca(`Não encontramos o convite para "${nomeBusca}". Tente digitar apenas o primeiro nome e sobrenome, ou verifique a grafia conforme o convite.`);
      }
    } catch (error: any) {
      console.error("[RC-5.10.4] Erro na busca:", error);
      if (error?.message === "TIMEOUT") {
        setErroBusca("Não foi possível localizar seu convite agora. Tente novamente em alguns instantes.");
      } else {
        setErroBusca("Ocorreu um erro ao buscar seu convite. Por favor, tente novamente em instantes.");
      }
    } finally {
      setCarregandoBusca(false);
    }
  };



  const handleGerarPixCode = async (presenteIndex: number) => {
    const valor = valorSelecionado || (outroValor ? parseMoedaParaNumero(outroValor) : null);
    
    if (!valor || valor <= 0) {
      alert("Informe um valor maior que R$ 0,00 para gerar o PIX.");
      return;
    }

    try {
      setCarregandoPixCode(true);
      const resultado = await generatePixCodeMutation.mutateAsync({
        value: valor,
        presenteNome: PRESENTES[presenteIndex].nome,
      });
      setPixGerado(resultado.brCode);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar código PIX. Tente novamente.");
    } finally {
      setCarregandoPixCode(false);
    }
  };

  const handleCopiarPixCode = async (presenteIndex: number) => {
    if (!convidadoSelecionado || !pixGerado) return;
    const presente = PRESENTES[presenteIndex];
    const valor = valorSelecionado || (outroValor ? parseMoedaParaNumero(outroValor) : null);
    
    if (!valor || valor <= 0) return;

    try {
      setCarregandoRegistro(true);
      
      await registrarPresenteMutation.mutateAsync({
        convidadoId: convidadoSelecionado.id,
        convidadoNome: convidadoSelecionado.nome,
        presenteNome: presente.nome,
        valor: valor,
        pix: pixGerado,
        status: "PIX copiado",
      });
      
      await navigator.clipboard.writeText(pixGerado);
      
      // Feedback visual elegante em vez de alert
      setPixCopiado(true);
      setTimeout(() => {
        setPixCopiado(false);
        setModalPresenteAberto(null);
        setValorSelecionado(null);
        setOutroValor("");
        setPixGerado(null);
      }, 2500);
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar presente. Tente novamente.");
    } finally {
      setCarregandoRegistro(false);
    }
  };

  const handleSubmit = async () => {
    if (!convidadoSelecionado || !resposta) return;
    try {
      const detalhes = [
        ...adultos.map(a => a.nome),
        ...criancas.map(c => `${c.nome} (${c.idade} anos)`)
      ].join("\n");

      const menoresDe8 = criancas.filter(c => {
        const idadeNum = parseInt(c.idade, 10);
        return !isNaN(idadeNum) && idadeNum <= 7;
      });

      const criancasPagantes = criancas.filter(c => {
        const idadeNum = parseInt(c.idade, 10);
        return !isNaN(idadeNum) && idadeNum > 7;
      });

      await confirmarMutation.mutateAsync({
        id: convidadoSelecionado.id,
        status: resposta === "Talvez" ? "Talvez" : resposta === "Confirmado" ? "Confirmado" : "Não Irá",
        acompanhantes: adultos.length + criancasPagantes.length,
        criancas: criancas.length,
        menores8: menoresDe8.length,
        mensagem,
        acompanhanteDetalhes: detalhes,
      });
      setSucesso(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao confirmar presença.");
    }
  };

  const getSucessoMensagem = () => {
    if (resposta === "Confirmado") {
      return {
        titulo: "CONFIRMAÇÃO RECEBIDA",
        mensagem: (
          <div className="bg-[#462F29] p-8 md:p-12 rounded-sm shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/5">
            <p className="font-cormorant text-3xl md:text-4xl text-wedding-gold mb-6 tracking-wide">Que alegria ter você conosco!</p>
            <p className="text-white/90 font-light text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Sua presença foi registrada com sucesso e estamos ansiosos para celebrar este dia tão especial ao seu lado.
            </p>
            <div className="pt-4 border-t border-white/10">
              <a 
                href="#manual-do-convidado" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('manual-do-convidado')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-wedding-gold font-montserrat text-[11px] uppercase tracking-[0.25em] font-bold hover:text-white transition-colors group"
              >
                Ver Manual do Convidado
                <span className="text-lg group-hover:translate-y-1 transition-transform">↓</span>
              </a>
            </div>
          </div>
        )
      };
    }
    if (resposta === "Talvez") {
      return {
        titulo: "RESPOSTA RECEBIDA",
        mensagem: (
          <>
            <p className="font-cormorant text-2xl text-wedding-gold mb-4">Obrigado por nos avisar.</p>
            <p className="text-white/80 font-light leading-relaxed">
              Ficaremos felizes em receber sua confirmação quando você tiver certeza. Estaremos esperando por você.
            </p>
          </>
        )
      };
    }
    return {
      titulo: "RESPOSTA RECEBIDA",
      mensagem: (
        <>
          <p className="font-cormorant text-2xl text-wedding-gold mb-4">Sentiremos sua falta neste dia tão especial.</p>
          <p className="text-white/80 font-light leading-relaxed">
            Obrigado por nos avisar e por fazer parte da nossa história. Seu carinho já torna este momento ainda mais especial.
          </p>
        </>
      )
    };
  };

  const PremiumTitle = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center mb-8">
      <h4 className="font-montserrat text-[13px] font-bold uppercase tracking-[0.25em] text-wedding-gold text-center opacity-90">
        {title}
      </h4>
    </div>
  );

  const limiteAtingido = (adultos.length + criancas.length) >= (convidadoSelecionado?.limite || 0);

  const valorInvalido = !valorSelecionado && (!outroValor || parseMoedaParaNumero(outroValor) <= 0);

  return (
    <div className={`min-h-screen bg-[#FDFAF6] text-wedding-charcoal ${!convidadoSelecionado ? 'h-[100dvh] overflow-hidden fixed inset-0' : ''}`}>
      <style>{`
        :root {
          --dvh: 100dvh;
        }
        input, select, textarea {
          font-size: 16px !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
      <main className={`max-w-6xl mx-auto ${!convidadoSelecionado ? 'h-[100dvh] flex flex-col pt-[15dvh] px-4' : 'pt-10 md:pt-20 pb-0'}`}>
        {/* Cabeçalho (Logo do Casal) */}
        <FadeSection className={`flex justify-center ${!convidadoSelecionado ? 'mb-4 md:mb-6' : 'mb-12 md:mb-16'}`}>
          <img 
            src={headerLogo} 
            alt="Mariana & Daniel - 05 de Dezembro de 2026" 
            className={`w-full h-auto object-contain transition-all duration-500 ${!convidadoSelecionado ? 'max-w-[280px] md:max-w-[400px]' : 'max-w-[380px] md:max-w-[650px]'}`}
          />
        </FadeSection>

        {!convidadoSelecionado ? (
          <FadeSection className="w-full max-w-[420px] mx-auto text-center p-6 md:p-8 bg-white shadow-xl rounded-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-4 md:mb-6">
              <h2 className="font-montserrat text-[12px] md:text-[14px] font-bold tracking-[0.2em] text-[#462F29] uppercase mb-1">IDENTIFIQUE-SE</h2>
              <p className="font-light text-[#888] text-[11px] md:text-[13px]">Digite seu nome e sobrenome para localizar seu convite.</p>
            </div>
            
            <input 
              type="text" 
              placeholder="Seu nome e sobrenome" 
              className="wedding-input mb-4 !text-[16px] !py-3 md:!py-4"
              value={nomeBusca}
              onChange={(e) => {
                setNomeBusca(e.target.value);
                if (erroBusca) setErroBusca(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={carregandoBusca}
            />
            
            <button 
              onClick={handleSearch}
              disabled={carregandoBusca}
              className={`w-full bg-[#462F29] text-white py-4 md:py-5 tracking-[0.25em] uppercase text-[11px] md:text-[12px] font-bold transition-all hover:bg-[#2d1e1a] shadow-lg active:scale-[0.98] ${carregandoBusca ? 'opacity-50' : 'opacity-100'} flex items-center justify-center gap-3 rounded-sm`}
            >
              {carregandoBusca ? (
                <>
                  <span className="animate-spin-slow text-lg">⏳</span>
                  <span>{mensagemCarregamento}</span>
                </>
              ) : "Verificar Convite"}
            </button>

            {erroBusca && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[12px] text-red-800 leading-relaxed font-light">
                  {erroBusca}
                </p>
              </div>
            )}
          </FadeSection>
        ) : (
          <div className="">
            {/* 1. Boas-vindas */}
            <FadeSection className="text-center mb-16 md:mb-24 px-6">
              <h2 className="font-halimun text-[32px] md:text-[48px] text-[#462F29] mb-6 leading-tight">
                Olá, {convidadoSelecionado.nome}!
              </h2>
              <p className="font-montserrat text-[14px] md:text-[17px] text-wedding-charcoal/60 leading-relaxed max-w-[550px] mx-auto font-light tracking-wide">
                Nossa história também tem você, por isso preparamos este espaço com todo carinho para compartilhar cada detalhe do nosso grande dia.
              </p>
            </FadeSection>

            {/* 2. Nossa História */}
            <section className="relative px-4 sm:px-6 mb-8 md:mb-16">
              <SectionDivider title="Nossa História" />
            <div className="relative max-w-5xl mx-auto">
              {GALLERY_ITEMS.map((item, index) => (
                <div 
                  key={index} 
                  className="sticky top-0 h-[75vh] md:h-[85vh] flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 py-1"
                >
                  <div className={`w-full md:w-1/2 flex justify-center transition-all duration-700 animate-in fade-in zoom-in-95`}>
                    <div 
                      className={`bg-white p-4 md:p-5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] transition-all duration-700 hover:scale-[1.015]
                        ${index === 0 ? 'rotate-[-2.8deg] translate-x-[-16px] translate-y-[-12px]' : 
                          index === 1 ? 'rotate-[3.8deg] translate-x-[20px] translate-y-[14px]' : 
                          index === 2 ? 'rotate-[-4.8deg] translate-x-[-24px] translate-y-[-18px]' : 
                          'rotate-[2.8deg] translate-x-[22px] translate-y-[12px]'}`}
                    >
                      <img 
                        src={item.url} 
                        alt={item.titulo} 
                        loading={index === 0 ? "eager" : "lazy"}
                        className="w-[238px] h-[305px] md:w-[387px] md:h-[508px] object-cover grayscale-[5%] hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  </div>
                    <div className="w-full md:w-1/2 text-center md:text-left space-y-2 md:space-y-3 px-8 py-8 bg-[#462F29] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-10 rounded-[1px]">
	                      <h3 className="font-cormorant text-[20px] md:text-[28px] text-wedding-gold uppercase tracking-[0.15em] leading-tight">
	                        {item.titulo}
	                      </h3>
                      <p className="font-montserrat text-[12px] md:text-[14px] text-white/80 leading-relaxed font-light tracking-wide">
                        {item.texto}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <SectionSeparator />

            {/* 3. Presentes */}
            <section className="px-4 sm:px-6 mb-4 md:mb-8 overflow-x-hidden">
              <SectionDivider title="Presentes" />
              <div className="max-w-6xl mx-auto -mt-6">
                <p className="text-center font-montserrat text-[9px] md:text-[10px] text-wedding-gold/60 uppercase tracking-[0.25em] mb-6 md:hidden animate-in fade-in duration-1000 font-bold">
                  Deslize para descobrir mais presentes <span className="inline-block animate-bounce-x ml-1 text-wedding-gold/80 scale-125">→</span>
                </p>
                <div className="flex overflow-x-auto pb-12 gap-5 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide px-6 md:px-0 snap-x snap-mandatory scroll-smooth">
                  {PRESENTES.map((p, i) => (
                    <FadeSection key={i} className="min-w-[78vw] md:min-w-0 group snap-center">
                      <div className="bg-white border border-[#D4AF37]/5 p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-[220ms] flex flex-col h-full rounded-[2px] transform hover:-translate-y-1 active:scale-[0.98] md:active:scale-100">
                        <div className="overflow-hidden mb-5 aspect-[4/5] relative rounded-[1px]">
                          <img 
                            src={p.foto} 
                            alt={p.nome} 
                            className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />
                        </div>
                        <div className="flex-grow text-center flex flex-col justify-between px-1">
                          <div>
                            <h3 className="font-montserrat font-bold text-[12px] md:text-[13px] text-[#462F29] uppercase tracking-[0.12em] mb-2.5 leading-snug break-words">
                              {p.nome}
                            </h3>
                            <p className="font-montserrat text-[11px] md:text-[12px] text-[#462F29]/60 leading-relaxed italic min-h-[40px] mb-5">
                              {p.descricao}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              setModalPresenteAberto(i);
                              setValorSelecionado(null);
                              setOutroValor("");
                              setPixGerado(null);
                            }}
                            className="w-full bg-[#462F29] text-white py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#3d2924] transition-all duration-200 shadow-md active:scale-[0.98] active:brightness-95"
                          >
                            Presentear via PIX
                          </button>
                        </div>
                      </div>
                    </FadeSection>
                  ))}
                </div>
              </div>
            </section>

            <SectionSeparator />

            {/* 4. Localização */}
            <div className="bg-[#FDFAF6] pt-2 pb-6 md:pt-4 md:pb-8">
              <FadeSection className="max-w-4xl mx-auto px-6 text-center">
                <SectionDivider title="Localização" />
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-halimun text-[35.5px] md:text-[46.5px] text-[#462F29] font-medium">Celeiro Quintal</h3>
                    <p className="font-montserrat text-[12px] md:text-[14px] text-wedding-gold uppercase tracking-[0.3em] font-bold">
                      05 de Dezembro de 2026 • 17h30
                    </p>
                    <div className="space-y-2">
                      <p className="font-montserrat text-[14px] md:text-[16px] text-[#462F29] font-light">R. Cônego Eugênio Leite, 1098</p>
                      <p className="font-montserrat text-[14px] md:text-[16px] text-[#462F29] font-light">Pinheiros • São Paulo</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6">
                      <a 
                        href={MAPS_URL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-[#462F29] text-white px-8 py-4.5 text-[11px] uppercase tracking-[0.25em] hover:bg-wedding-gold hover:text-white transition-all duration-300 shadow-lg font-bold min-w-[220px] active:scale-[0.98]"
                      >
                        Ver no Mapa
                      </a>
                      <a 
                        href="https://www.instagram.com/celeiroquintal/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block border border-[#462F29] text-[#462F29] px-8 py-4.5 text-[11px] uppercase tracking-[0.25em] hover:bg-[#462F29] hover:text-white transition-all duration-300 shadow-lg font-bold min-w-[220px] active:scale-[0.98]"
                      >
                        Conhecer o Espaço
                      </a>
                    </div>
                  </div>
                </div>
              </FadeSection>
            </div>

            <SectionSeparator />

            {/* 5. Confirmação de Presença */}
            <div id="rsvp-section" className="bg-[#462F29] py-10 md:py-16">
              <FadeSection className="max-w-[700px] mx-auto px-6 text-center">
                <div className="text-center mb-8">
                  <p className="font-montserrat text-[10px] md:text-[12px] text-white/40 uppercase tracking-[0.25em] mb-4">
                    Esperamos você para celebrar conosco.
                  </p>
                  <h2 className="font-cormorant font-light text-white text-[28px] md:text-[42px] leading-tight mb-4">Confirmação de Presença</h2>
                </div>
                
                {sucesso ? (
                  <div className="space-y-12">
	                      <div className="text-center space-y-8 py-16 px-8 border border-wedding-gold/20 bg-[#462F29] rounded-sm animate-in fade-in duration-600 max-w-2xl mx-auto shadow-2xl">
	                        <PremiumTitle title={getSucessoMensagem().titulo} />
                      
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 text-white">
                        {getSucessoMensagem().mensagem}
                      </div>
                    </div>
                    
                    {/* Manual do Convidado — Exibição Condicional */}
                    {resposta === "Confirmado" && (
                      <FadeSection id="manual-do-convidado" className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000 pt-8">
                        <PremiumTitle title="MANUAL DO CONVIDADO" />
                        <div className="max-w-[500px] mx-auto bg-white p-2 rounded-sm shadow-2xl">
                          <img 
                            src={manualImg} 
                            alt="Manual do Convidado" 
                            className="w-full h-auto"
                          />
                        </div>
                        <p className="font-montserrat text-[10px] text-white/50 uppercase tracking-widest">
                          Tire um print para não esquecer os detalhes!
                        </p>
                      </FadeSection>
                    )}
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-3">
                        <h2 className="font-halimun text-[32px] md:text-[42px] font-medium text-wedding-gold leading-relaxed px-4 break-words">
                          {convidadoSelecionado.nome}
                        </h2>
                        <p className="text-white text-[14px] md:text-[16px] font-light tracking-[0.1em] uppercase">
                          Por favor, confirme sua presença.
                        </p>
                      </div>
                      
                      {convidadoSelecionado.limite > 0 && (
                        <div className="inline-block border border-wedding-gold/30 px-4 py-1.5 rounded-sm">
                          <p className="font-montserrat text-[9px] md:text-[10px] text-wedding-gold uppercase tracking-[0.25em] font-bold">
                            Você pode levar até {convidadoSelecionado.limite} acompanhante(s)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cards de Status */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {[
                        { id: "Confirmado", label: "Confirmo minha presença" },
                        { id: "Talvez", label: "Ainda não tenho certeza" },
                        { id: "Não Irá", label: "Não poderei comparecer" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setResposta(opt.id as any)}
                          className={`p-5 border text-[10px] md:text-[11px] uppercase tracking-[0.15em] transition-all duration-300 h-full flex items-center justify-center text-center rounded-[2px]
                            ${resposta === opt.id 
                              ? "bg-wedding-gold text-white border-wedding-gold shadow-xl scale-[1.03]" 
                              : "bg-white/5 text-white/80 border-white/10 hover:border-wedding-gold hover:bg-white/10"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Seção de Acompanhantes (Apenas se Confirmado) */}
                    {resposta === "Confirmado" && convidadoSelecionado.limite > 0 && (
                      <div ref={acompanhantesRef} className="space-y-8 pt-10 animate-in fade-in slide-in-from-top-4">
                        <PremiumTitle title="SEUS ACOMPANHANTES" />
                        
                        {/* Lista de Acompanhantes */}
                        <div className="space-y-4">
                          {adultos.map((a, i) => (
                            <div key={`a-${i}`} className="flex gap-2 items-center bg-white p-2 border border-wedding-gold/20 shadow-inner rounded-sm">
                              <input
                                type="text"
                                placeholder="Nome e Sobrenome (Adulto)"
                                className="wedding-input flex-grow !border-none !p-3 !text-[14px] !text-[#462F29] bg-transparent placeholder:text-[#462F29]/40"
                                value={a.nome}
                                onChange={(e) => {
                                  const n = [...adultos];
                                  n[i].nome = e.target.value;
                                  setAdultos(n);
                                }}
                              />
                              <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-red-500 text-[10px] px-3 uppercase tracking-widest font-bold">Remover</button>
                            </div>
                          ))}
                          {criancas.map((c, i) => (
                            <div key={`c-${i}`} className="flex gap-2 items-center bg-white p-2 border border-wedding-gold/20 shadow-inner rounded-sm">
                              <input
                                type="text"
                                placeholder="Nome e Sobrenome (Criança)"
                                className="wedding-input flex-grow !border-none !p-3 !text-[14px] !text-[#462F29] bg-transparent placeholder:text-[#462F29]/40"
                                value={c.nome}
                                onChange={(e) => {
                                  const n = [...criancas];
                                  n[i].nome = e.target.value;
                                  setCriancas(n);
                                }}
                              />
                              <div className="flex items-center gap-2 px-3 border-l border-wedding-gold/20">
                                <span className="text-[10px] uppercase tracking-widest text-[#462F29]/40 font-bold">Idade:</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  className="wedding-input w-12 !border-none p-0 !text-[14px] font-bold !text-[#462F29] bg-transparent focus:ring-0"
                                  value={c.idade}
                                  onChange={(e) => {
                                    const n = [...criancas];
                                    n[i].idade = e.target.value;
                                    setCriancas(n);
                                  }}
                                />
                              </div>
                              <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="text-red-500 text-[10px] px-3 uppercase tracking-widest font-bold">Remover</button>
                            </div>
                          ))}
                        </div>

                        {/* Cards Premium de Adicionar */}
                        {!limiteAtingido && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                              onClick={() => setAdultos([...adultos, { nome: "" }])}
                              className="group flex flex-col items-center p-6 border border-wedding-gold/30 rounded-md transition-all duration-300 hover:bg-wedding-gold hover:-translate-y-1 hover:shadow-lg"
                            >
                              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👤</span>
	                              <span className="font-montserrat text-[12px] font-semibold uppercase tracking-widest text-wedding-gold group-hover:text-white">Adicionar Adulto</span>
	                            </button>
	                            <button 
	                              onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
	                              className="group flex flex-col items-center p-6 border border-wedding-gold/30 rounded-md transition-all duration-300 hover:bg-wedding-gold hover:-translate-y-1 hover:shadow-lg"
	                            >
	                              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👶</span>
	                              <span className="font-montserrat text-[12px] font-semibold uppercase tracking-widest text-wedding-gold group-hover:text-white">Adicionar Criança</span>
	                            </button>
                          </div>
                        )}
                        {limiteAtingido && (
                          <p className="text-[10px] text-wedding-gold/60 italic text-center">Limite de acompanhantes atingido.</p>
                        )}
                      </div>
                    )}

                    {/* Mensagem e Botão Final */}
                    {resposta && (
                      <div className="space-y-8 pt-10 animate-in fade-in duration-500">
                        {(resposta === "Confirmado" || resposta === "Não Irá") && (
                        <div ref={mensagemRef} className="space-y-6">
                          <PremiumTitle title="MENSAGEM PARA OS NOIVOS" />
	                          <p className="text-[12px] text-white/60 font-light italic text-center -mt-6">
	                            Compartilhe uma lembrança, um conselho ou uma mensagem carinhosa para os noivos. ❤️
	                          </p>
                          
                          <textarea
                            placeholder="Escreva aqui sua mensagem..."
                            rows={4}
                            className="wedding-input !text-[16px] !bg-white !text-[#462F29] !border-wedding-gold/20 shadow-inner placeholder:text-[#462F29]/40 rounded-sm"
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                          />
                        </div>
                        )}
                        
                        <div className="pt-4">
                          <PremiumTitle title="BLOCO DE CONFIRMAÇÃO FINAL" />
                          <button
                            onClick={handleSubmit}
                            disabled={confirmarMutation.isPending}
                            className="w-full bg-wedding-gold text-white py-5 tracking-[0.3em] uppercase text-[12px] shadow-2xl hover:bg-white hover:text-[#462F29] transition-all duration-300 disabled:opacity-50 font-bold active:scale-[0.99] rounded-[2px]"
                          >
                            {confirmarMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </FadeSection>
            </div>
          </div>
        )}

        {/* Bottom Sheet de Cotas de Presentes (Premium Flow) */}
        {modalPresenteAberto !== null && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
              onClick={() => {
                setModalPresenteAberto(null);
                setValorSelecionado(null);
                setOutroValor("");
                setPixGerado(null);
              }}
            ></div>
            
            {/* Bottom Sheet / Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[24px] shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-full sm:zoom-in duration-300 max-h-[92vh] overflow-y-auto no-scrollbar">
              {/* Handle mobile */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h3 className="font-cormorant text-[26px] md:text-[32px] text-[#462F29] leading-tight mb-1">
                    {PRESENTES[modalPresenteAberto].nome}
                  </h3>
                  <p className="text-[12px] text-[#462F29]/60 font-montserrat leading-relaxed">
                    {PRESENTES[modalPresenteAberto].descricao}
                  </p>
                </div>
                <button 
                  onClick={() => setModalPresenteAberto(null)}
                  className="p-2 text-[#462F29]/40 hover:text-[#462F29] transition-colors"
                >
                  ✕
                </button>
              </div>

              {!pixGerado ? (
                <div className="space-y-6 animate-in fade-in duration-250">
                  <div className="space-y-3">
                    <p className="text-[10px] font-montserrat text-[#462F29]/40 uppercase tracking-[0.2em] font-bold">Escolha um valor sugerido</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 200, 300, 500, 1000].map((valor) => (
                        <button
                          key={valor}
                          onClick={() => {
                            setValorSelecionado(valor);
                            setOutroValor("");
                          }}
                          className={`py-3.5 px-3 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                            valorSelecionado === valor
                              ? 'bg-[#D4AF37] text-[#462F29] shadow-lg -translate-y-0.5'
                              : 'bg-[#FDFAF6] text-[#462F29] border border-[#462F29]/5 hover:border-[#D4AF37]/30'
                          }`}
                        >
                          R$ {valor}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-montserrat text-[#462F29]/40 uppercase tracking-[0.2em] font-bold">Ou contribua com outro valor</p>
                    <div className="relative group">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="R$ 0,00"
                        value={outroValor}
                        onChange={(e) => {
                          const formatado = formatarMoeda(e.target.value);
                          setOutroValor(formatado);
                          setValorSelecionado(null);
                        }}
                        className="w-full px-5 py-4 bg-[#FDFAF6] border border-[#462F29]/5 rounded-xl text-[18px] font-bold text-[#462F29] focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all placeholder:text-[#462F29]/20"
                      />
                    </div>
                    {valorInvalido && !valorSelecionado && outroValor !== "" && (
                      <p className="text-[10px] text-red-500 font-montserrat italic text-center animate-in fade-in duration-200">
                        Por favor, informe um valor para continuar.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleGerarPixCode(modalPresenteAberto)}
                    disabled={carregandoPixCode || valorInvalido}
                    className="w-full bg-[#462F29] text-white py-4.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[12px] hover:bg-[#D4AF37] hover:text-[#462F29] transition-all duration-250 disabled:opacity-30 shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {carregandoPixCode ? (
                      <>
                        <span className="animate-spin text-lg">⏳</span>
                        <span>Gerando PIX...</span>
                      </>
                    ) : (
                      <span>Gerar Chave PIX</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-250">
                  <div className="bg-[#FDFAF6] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-sm space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-montserrat text-[#462F29]/40 mb-1 uppercase tracking-[0.2em] font-bold">Recebedor</p>
                        <p className="text-[15px] font-bold text-[#462F29]">Daniel Abelha Torres</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-[8px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">PIX Gerado</span>
                    </div>
                    
                    <div>
                      <p className="text-[9px] font-montserrat text-[#462F29]/40 mb-1 uppercase tracking-[0.2em] font-bold">Valor da Contribuição</p>
                      <p className="text-[22px] font-bold text-[#D4AF37]">
                        {valorSelecionado 
                          ? valorSelecionado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                          : outroValor}
                      </p>
                    </div>

                    <div className="pt-4">
                      <p className="text-[9px] font-montserrat text-[#462F29]/40 mb-2 uppercase tracking-[0.2em] font-bold">Código PIX</p>
                      <div className="bg-white p-4 rounded-xl border border-[#462F29]/5 shadow-inner relative group cursor-pointer active:scale-[0.99] transition-transform" onClick={() => handleCopiarPixCode(modalPresenteAberto)}>
                        <p className="text-[11px] font-mono text-[#462F29]/60 break-all text-center leading-relaxed pr-8">{pixGerado}</p>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-wedding-gold text-lg opacity-40 group-hover:opacity-100 transition-opacity">📋</span>
                      </div>
                      <p className="text-[9px] text-center text-[#462F29]/30 mt-3 italic">Toque no código acima ou no botão abaixo para copiar.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopiarPixCode(modalPresenteAberto)}
                    disabled={carregandoRegistro || pixCopiado}
                    className={`w-full py-5 rounded-xl font-bold uppercase tracking-[0.25em] text-[13px] transition-all duration-250 shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${
                      pixCopiado ? 'bg-green-600 text-white' : 'bg-[#D4AF37] text-[#462F29] hover:bg-[#462F29] hover:text-white'
                    }`}
                  >
                    {carregandoRegistro ? (
                      <span className="animate-spin text-lg">⏳</span>
                    ) : pixCopiado ? (
                      <>
                        <span className="text-xl">✓</span>
                        <span>PIX COPIADO!</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">📋</span>
                        <span>COPIAR PIX</span>
                      </>
                    )}
                  </button>
                  
                  {pixCopiado && (
                    <p className="text-[11px] text-green-600 font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
                      Agora basta colar no app do seu banco!
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setModalPresenteAberto(null);
                      setValorSelecionado(null);
                      setOutroValor("");
                      setPixGerado(null);
                    }}
                    className="w-full text-[#462F29]/40 py-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#462F29] transition-all"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
