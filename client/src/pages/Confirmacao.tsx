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
    nome: "👑 Manutenção da Princesa", 
    descricao: "Ajude Mariana a manter os altos padrões de realeza pelos próximos 50 anos.", 
    valor: "Qualquer valor", 
    pix: "casamento@danielemariana.com", 
    foto: princesaImg
  },
  { 
    nome: "🚜 Projeto Fazenda", 
    descricao: "Daniel ainda acredita que um dia terá uma fazenda com cavalos, vacas e um apiário.", 
    valor: "Qualquer valor", 
    pix: "casamento@danielemariana.com", 
    foto: fazendeiroImg
  },
  { 
    nome: "👕 Reabilitação Fashion", 
    descricao: "Ajude Mariana nesta importante missão social.", 
    valor: "Qualquer valor", 
    pix: "casamento@danielemariana.com", 
    foto: camisaTimeImg
  },
  { 
    nome: "🏖️ Pool Party Pós-Casamento", 
    descricao: "A festa acaba, mas a ressaca emocional continua.", 
    valor: "Qualquer valor", 
    pix: "casamento@danielemariana.com", 
    foto: poolPartyImg
  },
  { 
    nome: "🏥 Plano de Saúde Premium", 
    descricao: "Nem a ciência explica como alguém consegue gostar tanto de hospital.", 
    valor: "Qualquer valor", 
    pix: "casamento@danielemariana.com", 
    foto: planoSaudeImg
  },
  { 
    nome: "🎶 Fundo do Cavaco", 
    descricao: '"MANDEEEEEEI MEU CAVACO CHORAR"', 
    valor: "Qualquer valor", 
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
  const [pixVisivel, setPixVisivel] = useState<Record<number, boolean>>({});
  const [pixCopiado, setPixCopiado] = useState<number | null>(null);
  const [carregandoBusca, setCarregandoBusca] = useState(false);

  const searchMutation = trpc.searchConvidados.useMutation();
  const confirmarMutation = trpc.confirmarPresenca.useMutation();

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

  return (
    <div className="min-h-screen bg-[#FDFAF6] text-wedding-charcoal">
      <main className="max-w-6xl mx-auto pt-20 pb-20">
        {/* Cabeçalho (Logo do Casal) */}
        <FadeSection className="px-4 flex justify-center mb-12 md:mb-16">
          <img 
            src={headerLogo} 
            alt="Mariana & Daniel - 05 de Dezembro de 2026" 
            className="w-full max-w-[380px] md:max-w-[650px] h-auto object-contain"
          />
        </FadeSection>

        {!convidadoSelecionado ? (
          <FadeSection className="max-w-[500px] mx-auto px-6 text-center mb-24 p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <p className="font-light text-[#888] mb-8 text-sm">Informe seu Nome e Sobrenome</p>
            <input 
              type="text" 
              placeholder="Digite seu nome completo aqui" 
              className="wedding-input mb-6 !text-[16px]"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={carregandoBusca}
              className={`w-full bg-[#462F29] text-white py-4 tracking-[0.2em] uppercase text-[12px] transition-opacity ${carregandoBusca ? 'opacity-50' : 'opacity-100'}`}
            >
              {carregandoBusca ? "Verificando..." : "Verificar Convite"}
            </button>
          </FadeSection>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Boas-vindas */}
            <FadeSection className="text-center mb-24 md:mb-32 px-6">
              <h2 className="font-halimun text-[32px] md:text-[48px] text-[#462F29] mb-6">
                Olá, {convidadoSelecionado.nome}!
              </h2>
              <p className="font-montserrat text-[14px] md:text-[18px] text-wedding-charcoal/70 leading-relaxed max-w-[600px] mx-auto">
                Nossa história também tem você, por isso queremos viver esse momento único ao seu lado.
              </p>
            </FadeSection>

            {/* Galeria */}
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

            {/* Localização */}
            <div className="bg-[#462F29] py-20 md:py-32 mb-24 md:mb-32">
              <FadeSection className="px-6">
                <div className="text-center mb-12">
                  <h2 className="font-cormorant font-light text-white text-[28px] md:text-[42px] leading-tight mb-4">Localização</h2>
                  <div className="w-10 h-[1px] bg-wedding-gold mx-auto" />
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                  <div className="text-center md:text-right space-y-6">
                    <h3 className="font-halimun text-[32px] text-wedding-gold">Celeiro Quintal</h3>
                    <div className="space-y-2">
                      <p className="text-[16px] font-light text-white/90 tracking-wide">05 de Dezembro de 2026, 18:00</p>
                      <p className="text-[14px] font-light text-white/70 leading-relaxed">R. Cônego Eugênio Leite, 1098<br />Pinheiros, São Paulo - SP</p>
                    </div>
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-block bg-wedding-gold text-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-[#462F29] transition-all shadow-lg">Ver no Mapa</a>
                  </div>
                  <div className="h-[350px] bg-white p-2 rounded-sm shadow-2xl overflow-hidden transform md:rotate-1">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ filter: 'grayscale(0.2) contrast(1.1)' }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent("Celeiro Quintal " + ENDERECO_CURTO)}&output=embed`} 
                    />
                  </div>
                </div>
              </FadeSection>
            </div>

            {/* Presentes */}
            <FadeSection className="mb-24 md:mb-32">
              <SectionDivider title="Presentes" />
              <div className="relative px-4 md:px-6">
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 scrollbar-hide snap-x snap-mandatory max-w-5xl mx-auto">
                  {PRESENTES.map((p, i) => (
                    <div 
                      key={i} 
                      className="min-w-[280px] md:min-w-0 snap-center bg-white p-3 pb-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                      style={{ 
                        transform: `rotate(${i % 2 === 0 ? '-1.5' : '1.5'}deg)`,
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
                        <h4 className="font-['Montserrat'] font-semibold text-[13px] text-[#462F29] mb-2 uppercase tracking-[0.15em] leading-tight">
                          {p.nome}
                        </h4>
                        <p className="text-[10px] text-[#462F29]/60 font-montserrat leading-relaxed mb-5 h-8 flex items-center justify-center max-w-[90%]">
                          {p.descricao}
                        </p>
                        
                        <div className="text-[8px] font-bold text-[#462F29]/30 mb-5 tracking-[0.25em] uppercase">
                          {p.valor}
                        </div>

                        <button 
                          onClick={() => setPixVisivel({ ...pixVisivel, [i]: !pixVisivel[i] })} 
                          className="w-full bg-[#462F29] text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-all duration-500 shadow-md rounded-sm"
                        >
                          {pixVisivel[i] ? "Ocultar Chave" : "Presentear via PIX"}
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

            {/* Confirmação de Presença */}
            <div className="bg-[#462F29] py-20 md:py-32">
              <FadeSection className="max-w-[700px] mx-auto px-6 text-center">
                <div className="text-center mb-12">
                  <h2 className="font-cormorant font-light text-white text-[28px] md:text-[42px] leading-tight mb-4">Confirmação de Presença</h2>
                  <div className="w-10 h-[1px] bg-wedding-gold mx-auto" />
                </div>
                
                {sucesso ? (
                  <div className="space-y-12">
                    <div className="p-12 bg-white/5 border border-white/10 text-white">
                      <h3 className="font-halimun text-4xl mb-4 text-wedding-gold">Obrigado!</h3>
                      <p className="font-montserrat text-sm text-white/70">Sua resposta foi enviada com carinho.</p>
                    </div>
                    
                    {/* Manual do Convidado — Exibição Condicional */}
                    {resposta === "Confirmado" && (
                      <FadeSection className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
                        <div className="w-10 h-[1px] bg-wedding-gold mx-auto mb-8" />
                        <h4 className="font-halimun text-3xl text-wedding-gold">Manual do Convidado</h4>
                        <div className="max-w-[500px] mx-auto">
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
                    <div className="space-y-2">
                      <p className="font-cormorant text-2xl text-white">
                        {convidadoSelecionado.nome}, por favor, confirme sua presença.
                      </p>
                      {convidadoSelecionado.limite > 0 && (
                        <p className="font-montserrat text-[12px] text-wedding-gold uppercase tracking-[0.2em] font-bold">
                          Você pode levar até {convidadoSelecionado.limite} acompanhante(s).
                        </p>
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
                          className={`p-5 border text-[11px] uppercase tracking-widest transition-all h-full flex items-center justify-center text-center
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
                        <h4 className="font-halimun text-[32px] text-wedding-gold">Seus Acompanhantes</h4>
                        
                        {/* Lista de Acompanhantes */}
                        <div className="space-y-4">
                          {adultos.map((a, i) => (
                            <div key={`a-${i}`} className="flex gap-2 items-center bg-white p-2 border border-wedding-gold/20 shadow-inner">
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
                            <div key={`c-${i}`} className="flex gap-2 items-center bg-white p-2 border border-wedding-gold/20 shadow-inner">
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

                        {/* Botões de Adicionar */}
                        {!limiteAtingido && (
                          <div className="flex justify-center gap-6">
                            <button 
                              onClick={() => setAdultos([...adultos, { nome: "" }])}
                              className="text-[11px] uppercase tracking-[0.2em] text-wedding-gold border border-wedding-gold/30 px-6 py-2 hover:bg-wedding-gold hover:text-white transition-all"
                            >
                              + Adulto
                            </button>
                            <button 
                              onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                              className="text-[11px] uppercase tracking-[0.2em] text-wedding-gold border border-wedding-gold/30 px-6 py-2 hover:bg-wedding-gold hover:text-white transition-all"
                            >
                              + Criança
                            </button>
                          </div>
                        )}
                        {limiteAtingido && (
                          <p className="text-[10px] text-wedding-terracotta/60 italic">Limite de acompanhantes atingido.</p>
                        )}
                      </div>
                    )}

                    {/* Mensagem e Botão Final */}
                    {resposta && (
                      <div className="space-y-6 pt-10 border-t border-white/10 animate-in fade-in duration-500">
                        {(resposta === "Confirmado" || resposta === "Não Irá") && (
                        <textarea
                          placeholder="Deixe uma mensagem carinhosa para os noivos..."
                          rows={4}
                          className="wedding-input !text-[16px] !bg-white !text-[#462F29] !border-wedding-gold/20 shadow-inner placeholder:text-[#462F29]/40"
                          value={mensagem}
                          onChange={(e) => setMensagem(e.target.value)}
                        />
                        )}
                        
                        <button
                          onClick={handleSubmit}
                          disabled={confirmarMutation.isPending}
                          className="w-full bg-wedding-gold text-white py-5 tracking-[0.4em] uppercase text-[12px] shadow-2xl hover:bg-white hover:text-[#462F29] transition-all disabled:opacity-50 font-bold"
                        >
                          {confirmarMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </FadeSection>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
