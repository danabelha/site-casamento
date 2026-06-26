/*
 * Página de Confirmação — Otimizada para Mobile First com Tailwind 4
 */

import { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";
// CalligraphicDivider removido conforme solicitado para limpar o visual do cabeçalho

// Importar imagens
import manualImg from "../assets/images/manual_final_v2.png";
import headerLogo from "../assets/images/header_logo_perfect.png";
import princesaImg from "../assets/images/princesa.jpg";
import fazendeiroImg from "../assets/images/fazendeiro.jpg";
import camisaTimeImg from "../assets/images/camisa_time.jpg";
import poolPartyImg from "../assets/images/pool_party.png";
import planoSaudeImg from "../assets/images/plano_saude.jpg";
import cavacoImg from "../assets/images/cavaco.jpg";

// ===== CONSTANTES =====
const GALLERY_ITEMS = [
  {
    url: "https://i.pinimg.com/736x/c0/bc/f8/c0bcf84c9b1f88e70d63f72a3ab87f44.jpg",
    titulo: "Como tudo começou",
    texto: "Era um dia comum que se tornou extraordinário. Nosso primeiro encontro foi o início de uma jornada que mudaria nossas vidas para sempre."
  },
  {
    url: "https://i.pinimg.com/736x/d6/31/ae/d631aeb49b7fb2104f804c9f4da05042.jpg",
    titulo: "Nossas Aventuras",
    texto: "Entre viagens, risadas e descobertas, cada quilômetro percorrido ao seu lado reforçou a certeza de que fomos feitos um para o outro."
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
    <div className="text-center mb-8 md:mb-12 px-4">
      <h2 className={`font-cormorant font-light text-[#462F29] leading-tight mb-4 whitespace-nowrap
        ${isVerification ? 'text-[22px] sm:text-[28px] md:text-[42px]' : 'text-[28px] md:text-[42px]'}`}>
        {title}
      </h2>
      <div className="w-10 h-[1px] bg-wedding-gold mx-auto" />
    </div>
  );
}

function FadeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
  const [nomeBusca, setNomeBusca] = useState("");
  const [convidadoSelecionado, setConvidadoSelecionado] = useState<any>(null);
  const [resposta, setResposta] = useState<"Confirmado" | "Talvez" | "Não Irá" | null>(null);
  const [adultos, setAdultos] = useState<{ nome: string }[]>([]);
  const [criancas, setCriancas] = useState<{ nome: string; idade: string }[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pixVisivel] = useState<Record<number, boolean>>({});
  const [pixCopiado, setPixCopiado] = useState<number | null>(null);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [modalPresenteAberto, setModalPresenteAberto] = useState<number | null>(null);
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [outroValor, setOutroValor] = useState<string>("");
  const [carregandoRegistro, setCarregandoRegistro] = useState(false);

  const searchMutation = trpc.searchConvidados.useMutation();
  const confirmarMutation = trpc.confirmarPresenca.useMutation();
  const registrarPresenteMutation = trpc.registrarPresente.useMutation();

  // Correção 1: Eliminar efeito de zoom / salto após localizar convidado
  useEffect(() => {
    if (convidadoSelecionado) {
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  }, [convidadoSelecionado]);

  const handleSearch = async () => {
    if (!nomeBusca.trim() || carregandoBusca) return;
    try {
      setCarregandoBusca(true);
      const resultado = await searchMutation.mutateAsync({ nome: nomeBusca });
      if (resultado && (resultado as any).length > 0) {
        setConvidadoSelecionado((resultado as any)[0]);
      } else {
        alert("Convidado não encontrado. Verifique o nome.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar convidado.");
    } finally {
      setCarregandoBusca(false);
    }
  };

  const copiarPix = (index: number, pix: string) => {
    navigator.clipboard.writeText(pix);
    setPixCopiado(index);
    setTimeout(() => setPixCopiado(null), 3000);
  };

  const handleRegistrarPresente = async (presenteIndex: number) => {
    if (!convidadoSelecionado) return;
    const presente = PRESENTES[presenteIndex];
    const valor = valorSelecionado || (outroValor ? parseFloat(outroValor) : null);
    
    if (!valor || valor <= 0) {
      alert("Por favor, selecione um valor válido.");
      return;
    }

    try {
      setCarregandoRegistro(true);
      await registrarPresenteMutation.mutateAsync({
        convidadoId: convidadoSelecionado.id,
        convidadoNome: convidadoSelecionado.nome,
        presenteNome: presente.nome,
        valor: valor,
        pix: presente.pix,
        status: "Pix copiado",
      });
      
      navigator.clipboard.writeText(presente.pix);
      alert(`Chave PIX copiada! Obrigado pelo carinho.\n\nPresente: ${presente.nome}\nValor: R$ ${valor.toFixed(2)}`);
      
      setModalPresenteAberto(null);
      setValorSelecionado(null);
      setOutroValor("");
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

  const totalAcompanhantes = adultos.length + criancas.length;
  const limiteAtingido = totalAcompanhantes >= (convidadoSelecionado?.limite || 0);

  const getSucessoMensagem = () => {
    if (resposta === "Confirmado") {
      return {
        titulo: "CONFIRMAÇÃO RECEBIDA",
        mensagem: (
          <>
            <p className="font-cormorant text-2xl text-wedding-gold mb-4">Que alegria ter você conosco!</p>
            <p className="text-white/80 font-light leading-relaxed">
              Sua presença foi registrada com sucesso e estamos ansiosos para celebrar este dia tão especial ao seu lado.
            </p>
          </>
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
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="w-12 h-[1px] bg-wedding-gold/30"></div>
      <h4 className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.2em] text-wedding-gold text-center">
        {title}
      </h4>
      <div className="w-12 h-[1px] bg-wedding-gold/30"></div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#FDFAF6] text-wedding-charcoal ${!convidadoSelecionado ? 'h-screen overflow-hidden' : ''}`}>
      <main className={`max-w-6xl mx-auto ${!convidadoSelecionado ? 'h-full flex flex-col items-center justify-center py-4' : 'pt-10 md:pt-20 pb-20'}`}>
        {/* Cabeçalho (Logo do Casal) */}
        <FadeSection className={`px-4 flex justify-center ${!convidadoSelecionado ? 'mb-6 md:mb-8' : 'mb-12 md:mb-16'}`}>
          <img 
            src={headerLogo} 
            alt="Mariana & Daniel - 05 de Dezembro de 2026" 
            className={`w-full h-auto object-contain transition-all duration-500 ${!convidadoSelecionado ? 'max-w-[300px] md:max-w-[450px]' : 'max-w-[380px] md:max-w-[650px]'}`}
          />
        </FadeSection>

        {!convidadoSelecionado ? (
          <FadeSection className="w-full max-w-[450px] mx-auto px-6 text-center p-6 md:p-8 bg-white shadow-xl rounded-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6 md:mb-8">
              <h2 className="font-montserrat text-[12px] md:text-[14px] font-bold tracking-[0.2em] text-[#462F29] uppercase mb-2">IDENTIFIQUE-SE</h2>
              <p className="font-light text-[#888] text-[11px] md:text-[13px]">Digite seu nome completo para localizar seu convite.</p>
            </div>
            
            <input 
              type="text" 
              placeholder="Ex.: Daniel Abelha" 
              className="wedding-input mb-6 !text-[15px] md:!text-[16px] !py-3 md:!py-4"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            <button 
              onClick={handleSearch}
              disabled={carregandoBusca}
              className={`w-full bg-[#462F29] text-white py-4 md:py-5 tracking-[0.3em] uppercase text-[11px] md:text-[12px] font-bold transition-all hover:bg-[#2d1e1a] shadow-lg active:scale-[0.98] ${carregandoBusca ? 'opacity-50' : 'opacity-100'}`}
            >
              {carregandoBusca ? "Verificando..." : "Verificar Convite"}
            </button>
          </FadeSection>
        ) : (
          <div className="">
            {/* 1. Boas-vindas */}
            <FadeSection className="text-center mb-16 md:mb-24 px-6">
              <h2 className="font-halimun text-[32px] md:text-[48px] text-[#462F29] mb-6">
                Olá, {convidadoSelecionado.nome}!
              </h2>
              <p className="font-montserrat text-[14px] md:text-[18px] text-wedding-charcoal/70 leading-relaxed max-w-[600px] mx-auto">
                Nossa história também tem você, por isso queremos viver esse momento único ao seu lado.
              </p>
            </FadeSection>

            {/* 2. Nossa História */}
            <section className="relative px-4 sm:px-6 mb-16 md:mb-32">
              <SectionDivider title="Nossa História" />
              <div className="relative max-w-5xl mx-auto">
                {GALLERY_ITEMS.map((item, index) => (
                  <div key={index} className="sticky top-0 min-h-[80vh] md:min-h-screen flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 py-10 md:py-20">
                    <div className="flex-1 text-center md:text-left order-2 md:order-1 max-w-[400px] z-30 bg-[#462F29] p-6 md:p-4 rounded-sm shadow-sm md:shadow-none">
                      <h3 className="font-cormorant text-[24px] md:text-[36px] text-white mb-4 md:mb-6">{item.titulo}</h3>
                      <p className="font-montserrat text-[13px] md:text-[16px] text-white/80 leading-relaxed">{item.texto}</p>
                    </div>
                    <div className="flex-1 flex justify-center order-1 md:order-2 z-10">
                      <div className="bg-white p-1.5 pb-6 md:p-3 md:pb-12 shadow-xl md:shadow-2xl transform transition-transform duration-500" style={{ transform: `rotate(${index % 2 === 0 ? '-2' : '2'}deg)` }}>
                        <div className="relative w-[240px] h-[300px] sm:w-[320px] sm:h-[400px] overflow-hidden">
                          <img src={item.url} alt={item.titulo} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Presentes */}
            <FadeSection className="mb-16 md:mb-32">
              <SectionDivider title="Presentes" />
              <div className="relative px-4 md:px-6">
                {/* Correção 2: Dica discreta de navegação horizontal */}
                <p className="text-center font-montserrat text-[10px] md:text-[12px] text-wedding-charcoal/40 uppercase tracking-[0.2em] mb-6 md:hidden">
                  Deslize para descobrir mais presentes →
                </p>
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 scrollbar-hide snap-x snap-mandatory max-w-[100vw] mx-auto px-4 md:px-0">
                  {PRESENTES.map((p, i) => (
                    <div 
                      key={i} 
                      className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center bg-white p-4 pb-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                      style={{ 
                        transform: `rotate(${i % 2 === 0 ? '-1' : '1'}deg)`,
                        transition: 'all 0.4s ease-out'
                      }}
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center mb-6 overflow-hidden rounded-sm relative group">
                        {p.foto && (
                          <img 
                            src={p.foto} 
                            alt={p.nome} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                        )}

                      </div>
                      
                      <div className="px-2 text-center flex flex-col items-center">
                        <h4 className="font-['Montserrat'] font-bold text-[12px] md:text-[13px] text-[#462F29] mb-3 uppercase tracking-[0.15em] leading-snug break-words max-w-full">
                          {p.nome}
                        </h4>
                        <p className="text-[10px] text-[#462F29]/60 font-montserrat leading-relaxed mb-6 h-auto min-h-[40px] flex items-center justify-center max-w-[90%]">
                          {p.descricao}
                        </p>
                        
                        {p.valor && (
                          <div className="text-[8px] font-bold text-[#462F29]/30 mb-5 tracking-[0.25em] uppercase">
                            {p.valor}
                          </div>
                        )}

                        <button 
                          onClick={() => setModalPresenteAberto(i)} 
                          className="w-full bg-[#462F29] text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-all duration-500 shadow-md rounded-sm"
                        >
                          Presentear via PIX
                        </button>

                        {pixVisivel[i] && (
                          <div className="mt-4 p-4 bg-wedding-terracotta/5 border border-wedding-terracotta/10 text-[11px] animate-in fade-in zoom-in duration-300 rounded-sm text-left">
                            <div className="flex items-start gap-2 mb-3 text-wedding-terracotta/80">
                              <span className="text-xs">⚠️</span>
                              <p className="font-montserrat leading-tight text-[10px]">Confirme o destinatário:<br/><strong>Daniel e Mariana</strong></p>
                            </div>
                            <p className="text-[#888] uppercase mb-1 tracking-widest text-[8px]">Chave PIX</p>
                            <p className="font-mono break-all bg-white p-2 border border-wedding-blush/30 text-[10px]">{p.pix}</p>
                            <button 
                              onClick={() => copiarPix(i, p.pix)} 
                              className={`mt-3 w-full py-2 uppercase tracking-widest transition-all text-[9px] border border-wedding-terracotta/20 ${pixCopiado === i ? 'bg-green-50 text-green-600 border-green-200 font-bold' : 'bg-white text-wedding-terracotta hover:bg-wedding-terracotta hover:text-white'}`}
                            >
                              {pixCopiado === i ? "✓ Chave Copiada!" : "Copiar Chave PIX"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>

            {/* 4. Localização */}
            <div className="bg-[#462F29] py-16 md:py-24 border-y border-white/5">
              <FadeSection className="px-6">
                <div className="text-center mb-8">
                  <h2 className="font-cormorant font-light text-white text-[28px] md:text-[42px] leading-tight mb-4 uppercase tracking-widest">Localização</h2>
                  <div className="w-10 h-[1px] bg-wedding-gold mx-auto" />
                </div>
                
                <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
                  <div className="space-y-6">
                    <h3 className="font-halimun text-[32px] md:text-[42px] text-wedding-gold">Celeiro Quintal</h3>
                    
                    <div className="space-y-4">
                      <p className="text-[16px] md:text-[18px] font-light text-white/90 tracking-[0.1em]">05 de Dezembro de 2026 • 18h</p>
                      <div className="text-[14px] md:text-[16px] font-light text-white/70 leading-relaxed uppercase tracking-widest">
                        <p>R. Cônego Eugênio Leite, 1098</p>
                        <p>Pinheiros • São Paulo</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                      <a 
                        href={MAPS_URL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-wedding-gold text-white px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-[#462F29] transition-all shadow-lg font-bold min-w-[200px]"
                      >
                        Ver no Mapa
                      </a>
                      <a 
                        href="https://www.instagram.com/celeiroquintal/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block border border-wedding-gold text-wedding-gold px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-wedding-gold hover:text-white transition-all shadow-lg font-bold min-w-[200px]"
                      >
                        Conhecer o Espaço
                      </a>
                    </div>
                  </div>
                </div>
              </FadeSection>
            </div>

            {/* 5. Confirmação de Presença */}
            <div className="bg-[#462F29] py-16 md:py-32">
              <FadeSection className="max-w-[700px] mx-auto px-6 text-center">
                <div className="text-center mb-12">
                  <p className="font-montserrat text-[10px] md:text-[12px] text-white/40 uppercase tracking-[0.25em] mb-4">
                    Esperamos você para celebrar conosco.
                  </p>
                  <h2 className="font-cormorant font-light text-white text-[28px] md:text-[42px] leading-tight mb-4">Confirmação de Presença</h2>
                  <div className="w-10 h-[1px] bg-wedding-gold mx-auto" />
                </div>
                
                {sucesso ? (
                  <div className="space-y-12">
                    <div className="text-center space-y-8 py-16 px-8 border border-wedding-gold/20 bg-white/5 rounded-sm animate-in fade-in duration-600 max-w-2xl mx-auto">
                      <PremiumTitle title={getSucessoMensagem().titulo} />
                      
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 text-white">
                        {getSucessoMensagem().mensagem}
                      </div>

                      <div className="pt-8">
                        <div className="w-12 h-12 bg-wedding-gold/10 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-xl">✨</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Manual do Convidado — Exibição Condicional */}
                    {resposta === "Confirmado" && (
                      <FadeSection className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
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
                      <div className="space-y-2">
                        <h2 className="font-cormorant text-[36px] md:text-[42px] font-medium text-wedding-gold leading-tight">
                          {convidadoSelecionado.nome}
                        </h2>
                        <p className="text-white text-base md:text-lg font-light tracking-wide">
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
                          className={`p-5 border text-[10px] md:text-[11px] uppercase tracking-widest transition-all h-full flex items-center justify-center text-center
                            ${resposta === opt.id 
                              ? "bg-wedding-gold text-white border-wedding-gold shadow-xl scale-105" 
                              : "bg-white/5 text-white/80 border-white/10 hover:border-wedding-gold hover:bg-white/10"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Seção de Acompanhantes (Apenas se Confirmado) */}
                    {resposta === "Confirmado" && convidadoSelecionado.limite > 0 && (
                      <div className="space-y-8 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-top-4">
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
                              <span className="text-[10px] text-white/40 mt-1 group-hover:text-white/70">Acompanhante adulto</span>
                            </button>
                            <button 
                              onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                              className="group flex flex-col items-center p-6 border border-wedding-gold/30 rounded-md transition-all duration-300 hover:bg-wedding-gold hover:-translate-y-1 hover:shadow-lg"
                            >
                              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👶</span>
                              <span className="font-montserrat text-[12px] font-semibold uppercase tracking-widest text-wedding-gold group-hover:text-white">Adicionar Criança</span>
                              <span className="text-[10px] text-white/40 mt-1 group-hover:text-white/70">Menor de idade</span>
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
                      <div className="space-y-8 pt-10 border-t border-white/10 animate-in fade-in duration-500">
                        {(resposta === "Confirmado" || resposta === "Não Irá") && (
                        <div className="space-y-6">
                          <PremiumTitle title="MENSAGEM PARA OS NOIVOS" />
                          <p className="text-[12px] text-white/60 font-light italic text-center -mt-6">
                            Compartilhe uma lembrança, um conselho ou uma mensagem carinhosa para os noivos.
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
                            className="w-full bg-wedding-gold text-white py-5 tracking-[0.4em] uppercase text-[12px] shadow-2xl hover:bg-white hover:text-[#462F29] transition-all disabled:opacity-50 font-bold"
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

        {/* Modal de Cotas de Presentes */}
        {modalPresenteAberto !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8 animate-in zoom-in duration-300">
              <h3 className="font-cormorant text-[28px] text-[#462F29] mb-2 text-center">
                {PRESENTES[modalPresenteAberto].nome}
              </h3>
              <p className="text-center text-[12px] text-[#462F29]/60 font-montserrat mb-6">
                {PRESENTES[modalPresenteAberto].descricao}
              </p>

              <div className="mb-6">
                <p className="text-[12px] font-montserrat font-semibold text-[#462F29] mb-3 uppercase tracking-[0.1em]">
                  Selecione um valor:
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[50, 100, 150, 200].map(valor => (
                    <button
                      key={valor}
                      onClick={() => {
                        setValorSelecionado(valor);
                        setOutroValor("");
                      }}
                      className={`py-2 px-3 rounded-sm text-[12px] font-bold uppercase tracking-[0.1em] transition-all ${
                        valorSelecionado === valor
                          ? 'bg-[#D4AF37] text-[#462F29]'
                          : 'bg-[#462F29]/10 text-[#462F29] hover:bg-[#462F29]/20'
                      }`}
                    >
                      R$ {valor}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Outro valor"
                    value={outroValor}
                    onChange={(e) => {
                      setOutroValor(e.target.value);
                      setValorSelecionado(null);
                    }}
                    className="flex-1 px-3 py-2 border border-[#462F29]/20 rounded-sm text-[12px] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-[12px] font-montserrat text-[#462F29]/60">R$</span>
                </div>
              </div>

              <button
                onClick={() => handleRegistrarPresente(modalPresenteAberto)}
                disabled={carregandoRegistro}
                className="w-full bg-[#462F29] text-white py-3 rounded-sm font-bold uppercase tracking-[0.1em] text-[12px] hover:bg-[#D4AF37] hover:text-[#462F29] transition-all disabled:opacity-50"
              >
                {carregandoRegistro ? "Registrando..." : "Confirmar e Copiar PIX"}
              </button>

              <button
                onClick={() => {
                  setModalPresenteAberto(null);
                  setValorSelecionado(null);
                  setOutroValor("");
                }}
                className="w-full mt-2 text-[#462F29] py-2 text-[12px] font-montserrat hover:text-[#D4AF37] transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
