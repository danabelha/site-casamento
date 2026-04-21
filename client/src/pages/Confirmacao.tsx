/*
 * Design Philosophy: Minimalismo Japonês Contemporâneo (Wabi-Sabi + Editorial Japonês)
 * Página de Confirmação — Verificação de convidados, história, galeria, local, presentes e RSVP
 * Versão Final: Estrutura do Backup com melhorias de Tokens de Tema, Swipe e Correção de Zoom do Novo.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";

// ===== CONSTANTES =====

const GALLERY_IMAGES = [
  "https://i.pinimg.com/736x/c0/bc/f8/c0bcf84c9b1f88e70d63f72a3ab87f44.jpg",
  "https://i.pinimg.com/736x/d6/31/ae/d631aeb49b7fb2104f804c9f4da05042.jpg",
  "https://i.pinimg.com/736x/25/40/70/254070ff05550f897f4a850e6786c884.jpg",
  "https://i.pinimg.com/736x/a3/94/f2/a394f25f3491c43b14e44cee714aae35.jpg",
];

const PRESENTES = [
  {
    nome: "Lua de Mel",
    descricao: "Contribua para nossa viagem dos sonhos",
    valor: "Qualquer valor",
    pix: "casamento@danielemariana.com",
    emoji: "✈️",
  },
  {
    nome: "Jantar Romântico",
    descricao: "Um jantar especial para celebrarmos juntos",
    valor: "R$ 350",
    pix: "casamento@danielemariana.com",
    emoji: "🍷",
  },
  {
    nome: "Kit Cozinha",
    descricao: "Utensílios para nossa nova casa",
    valor: "R$ 280",
    pix: "casamento@danielemariana.com",
    emoji: "🏠",
  },
  {
    nome: "Noite em Hotel",
    descricao: "Uma noite especial em nosso destino",
    valor: "R$ 500",
    pix: "casamento@danielemariana.com",
    emoji: "🌙",
  },
  {
    nome: "Sessão de Fotos",
    descricao: "Memórias eternas do nosso amor",
    valor: "R$ 600",
    pix: "casamento@danielemariana.com",
    emoji: "📸",
  },
  {
    nome: "Contribuição Livre",
    descricao: "Qualquer valor é bem-vindo com amor",
    valor: "Livre",
    pix: "casamento@danielemariana.com",
    emoji: "💝",
  },
];


// ===== COMPONENTES AUXILIARES =====

function SectionDivider({ number, title }: { number: string; title: string }) {
  return (
    <div className="text-center mb-8 md:mb-12 px-4">
      <p className="font-lato text-[10px] tracking-[0.4em] text-wedding-gold font-normal uppercase mb-3">
        {number}
      </p>
      <h2 className="font-cormorant text-[28px] md:text-[42px] font-light text-wedding-charcoal leading-tight mb-4">
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {children}
    </div>
  );
}

// ===== GALERIA PREMIUM CENTER MODE (3-UP) COM SWIPE =====

function Carrossel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    setAutoplay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    setAutoplay(false);
  };

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setAutoplay(false);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  return (
    <div 
      className="relative w-full mb-6 overflow-hidden pb-8" 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
    >
      {/* Container do Carrossel */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 perspective-[1000px] min-h-[300px] md:min-h-[450px]">
        {/* Foto Esquerda */}
        <div 
          className="hidden sm:block flex-[0_0_140px] opacity-60 cursor-pointer transition-all duration-500 scale-85"
          onClick={() => handleImageClick((currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
        >
          <img src={GALLERY_IMAGES[(currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length]} alt="Foto anterior" className="w-full h-auto object-cover rounded-sm" />
        </div>

        {/* Foto Central (Destaque) */}
        <div className="flex-[0_0_90%] sm:flex-[0_0_380px] z-10 transition-all duration-500">
          <img src={GALLERY_IMAGES[currentIndex]} alt={`Foto ${currentIndex + 1}`} className="w-full h-auto object-cover rounded-sm shadow-xl pointer-events-none" />
        </div>

        {/* Foto Direita */}
        <div 
          className="hidden sm:block flex-[0_0_140px] opacity-60 cursor-pointer transition-all duration-500 scale-85"
          onClick={() => handleImageClick((currentIndex + 1) % GALLERY_IMAGES.length)}
        >
          <img src={GALLERY_IMAGES[(currentIndex + 1) % GALLERY_IMAGES.length]} alt="Próxima foto" className="w-full h-auto object-cover rounded-sm" />
        </div>
      </div>

      {/* Setas de Navegação (Visíveis apenas no desktop ou onde o swipe não é o foco principal) */}
      <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white border-none w-10 h-10 rounded-sm cursor-pointer text-xl z-20 hover:bg-black/70 transition-all hidden md:block" title="Foto anterior">
        ‹
      </button>
      <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white border-none w-10 h-10 rounded-sm cursor-pointer text-xl z-20 hover:bg-black/70 transition-all hidden md:block" title="Próxima foto">
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-15">
        {GALLERY_IMAGES.map((_, i) => (
          <div 
            key={i} 
            onClick={() => handleImageClick(i)} 
            className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === i ? "w-6 bg-wedding-terracotta" : "w-2 bg-wedding-terracotta/30"}`}
            title={`Foto ${i + 1}`} 
          />
        ))}
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====

export default function Confirmacao() {
  const [nomeBusca, setNomeBusca] = useState("");
  const [convidadoSelecionado, setConvidadoSelecionado] = useState<any>(null);
  const [resposta, setResposta] = useState<"Confirmado" | "Não Irá" | "Talvez" | null>(null);
  const [adultos, setAdultos] = useState<{ nome: string }[]>([]);
  const [criancas, setCriancas] = useState<{ nome: string; idade: string }[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pixVisivel, setPixVisivel] = useState<Record<number, boolean>>({});
  const [mostrarLembrete, setMostrarLembrete] = useState(false);

  const searchConvidados = trpc.searchConvidados.useMutation();
  const confirmarPresenca = trpc.confirmarPresenca.useMutation();

  const toNumber = (v: any) => Number(v) || 0;

  const montarDetalhes = () =>
    [
      ...adultos.map((a) => a.nome).filter(Boolean),
      ...criancas
        .filter((c) => c.nome && c.idade)
        .map((c) => `${c.nome} (${c.idade} anos)`),
    ].join("\n");

  const buscarConvidado = async () => {
    if (!nomeBusca.trim()) return;
    try {
      const resultado = await searchConvidados.mutateAsync({ nome: nomeBusca });
      if (resultado && (resultado as any).length > 0) {
        setConvidadoSelecionado((resultado as any)[0]);
      } else {
        alert("Nenhum convidado encontrado. Verifique se o nome está correto (exatamente como no convite).");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar convidado. Tente novamente.");
    }
  };

  const handleRespostaChange = (novaResposta: any) => {
    setResposta(novaResposta);
    if (novaResposta === "Confirmado" && convidadoSelecionado?.limite > 0) {
      setMostrarLembrete(true);
      setTimeout(() => setMostrarLembrete(false), 5000);
    } else {
      setMostrarLembrete(false);
    }
  };

  const handleSubmit = async () => {
    if (!convidadoSelecionado || !resposta) return;
    try {
      await confirmarPresenca.mutateAsync({
        id: convidadoSelecionado.id,
        status: resposta,
        acompanhantes: adultos.length,
        criancas: criancas.length,
        menores8: criancas.filter((c) => toNumber(c.idade) < 8).length,
        mensagem,
        acompanhanteDetalhes: montarDetalhes(),
      });
      setSucesso(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao confirmar presença. Tente novamente.");
    }
  };

  const togglePix = (index: number) => {
    setPixVisivel((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Lógica de limite de acompanhantes
  const totalAcompanhantesAtuais = adultos.length + criancas.length;
  const podeAdicionarAcompanhante = totalAcompanhantesAtuais < (convidadoSelecionado?.limite || 0);

  return (
    <div className="bg-wedding-cream min-h-screen font-lato text-wedding-charcoal">
      {/* Header - Sticky e Otimizado */}
      <header className="sticky top-0 z-[100] bg-wedding-cream/90 backdrop-blur-md border-b border-wedding-blush/30 py-4 px-6 text-center">
        <Link href="/">
          <span className="font-halimun text-[22px] md:text-[32px] cursor-pointer whitespace-nowrap text-wedding-charcoal">
            Mariana & Daniel
          </span>
        </Link>
        <p className="font-montserrat text-[10px] tracking-[0.2em] text-wedding-gold uppercase mt-1">
          05 · 12 · 2026
        </p>
      </header>

      <div className="max-w-[900px] mx-auto px-4 md:px-6">
        
        {/* SEÇÃO 1: VERIFICAÇÃO */}
        {!convidadoSelecionado ? (
          <FadeSection 
            className="min-h-[80vh] flex flex-col justify-center text-center"
          >
            <div className="pb-10">
              <SectionDivider number="01" title="Confirme sua Presença" />
              <p className="font-montserrat text-[16px] text-gray-400 mb-8 font-light">
                Digite seu nome completo para localizar seu convite.
              </p>
              <div className="max-w-[400px] mx-auto w-full">
                <input
                  type="text"
                  placeholder="Nome e Sobrenome..."
                  value={nomeBusca}
                  onChange={(e) => setNomeBusca(e.target.value)}
                  className="wedding-input text-center mb-4 !text-[16px]"
                />
                <button 
                  onClick={buscarConvidado} 
                  disabled={searchConvidados.isPending} 
                  className="w-full bg-wedding-charcoal text-wedding-cream py-4 tracking-[0.2em] uppercase text-[12px] transition-all hover:bg-wedding-terracotta disabled:bg-gray-300"
                >
                  {searchConvidados.isPending ? "Buscando..." : "Verificar Convite"}
                </button>
              </div>
            </div>
          </FadeSection>
        ) : (
          <div className="pt-10">
            <FadeSection>
              <div className="text-center mb-16">
                <h2 className="font-halimun text-[32px] md:text-[48px] text-wedding-terracotta mb-3">
                  Olá, {convidadoSelecionado.nome}!
                </h2>
                <p className="font-montserrat text-[16px] text-gray-400 font-light">Nossa história também tem você, por isso queremos viver esse momento único ao seu lado.</p>
                {convidadoSelecionado.limite > 0 && (
                  <p className="font-montserrat text-[14px] text-wedding-gold mt-2 uppercase tracking-widest">
                    Você pode convidar até {convidadoSelecionado.limite} acompanhante(s).
                  </p>
                )}
              </div>
            </FadeSection>

            {/* SEÇÃO 2: HISTÓRIA */}
            <FadeSection>
              <section className="mb-20">
                <SectionDivider number="02" title="Nossa História" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div>
                    <p className="font-cormorant text-[20px] italic text-wedding-terracotta mb-4 leading-relaxed">"Nos conhecemos por acaso, mas acreditamos que foi o destino."</p>
                    <p className="font-lato text-[14px] text-gray-600 font-light leading-loose">Tudo começou em uma tarde comum que se tornou extraordinária. Um encontro inesperado, um sorriso tímido, e a certeza de que algo especial havia começado.</p>
                  </div>
                  <div className="flex flex-col gap-5">
                    {[{ ano: "2020", evento: "Primeiro encontro" }, { ano: "2021", evento: "Primeira viagem juntos" }, { ano: "2023", evento: "Pedido de casamento" }, { ano: "2026", evento: "O grande dia" }].map((item) => (
                      <div key={item.ano} className="flex items-center gap-4">
                        <span className="font-cormorant text-[13px] text-wedding-gold font-semibold min-w-[40px]">{item.ano}</span>
                        <div className="w-[1px] h-4 bg-wedding-blush" />
                        <span className="font-lato text-[13px] text-gray-600 font-light">{item.evento}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </FadeSection>

            {/* SEÇÃO 3: GALERIA COM CARROSSEL E SWIPE */}
            <FadeSection>
              <section className="mb-20">
                <SectionDivider number="03" title="Galeria de Fotos" />
                <Carrossel />
              </section>
            </FadeSection>

            {/* SEÇÃO 4: LOCALIZAÇÃO */}
            <FadeSection>
              <section className="mb-20">
                <SectionDivider number="04" title="Localização" />
                <div className="text-center mb-6">
                  <p className="font-cormorant text-[20px] text-wedding-charcoal mb-1">Celeiro Quintal</p>
                  <p className="font-montserrat text-[15px] text-gray-400 font-light">R. Cônego Eugênio Leite, 1098 — Pinheiros, São Paulo — SP</p>
                  <p className="font-montserrat text-[15px] text-wedding-terracotta mt-1">05 de Dezembro de 2026</p>
                </div>
                <div className="rounded-sm overflow-hidden border border-wedding-blush/30 mb-5">
                  <iframe width="100%" height="300" src="https://maps.google.com/maps?q=R.+C%C3%B4nego+Eug%C3%AAnio+Leite%2C+1098+-+Pinheiros%2C+S%C3%A3o+Paulo+-+SP&t=&z=15&ie=UTF8&iwloc=&output=embed" className="border-0 block" title="Localização" loading="lazy" />
                </div>
                </section>
            </FadeSection>

            {/* SEÇÃO 5: PRESENTES */}
            <FadeSection>
              <section className="mb-20">
                <SectionDivider number="05" title="Lista de Presentes" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {PRESENTES.map((presente, i) => (
                    <div key={i} className="border border-wedding-blush/30 p-7 text-center bg-white/50 transition-all duration-300 hover:shadow-md">
                      <span className="text-[28px] block mb-3">{presente.emoji}</span>
                      <h3 className="font-cormorant text-[18px] text-wedding-charcoal mb-2">{presente.nome}</h3>
                      <p className="font-lato text-[12px] text-gray-400 mb-3 leading-relaxed">{presente.descricao}</p>
                      <p className="font-cormorant text-[16px] text-wedding-terracotta mb-4">{presente.valor}</p>
                      <button className="text-[10px] border border-wedding-charcoal px-6 py-2 uppercase tracking-widest hover:bg-wedding-charcoal hover:text-white transition-all" onClick={() => togglePix(i)}>{pixVisivel[i] ? "Ocultar PIX" : "Presentear"}</button>
                      {pixVisivel[i] && (
                        <div className="mt-4 p-3 bg-wedding-blush/10 border border-wedding-blush/30 rounded-sm">
                          <div className="bg-yellow-50 border border-yellow-200 p-2 mb-3 text-left">
                            <p className="font-lato text-[10px] text-yellow-800 m-0 leading-tight">
                              ⚠️ <strong>Segurança:</strong> Antes de realizar a transferência, confirme o nome do destinatário.
                            </p>
                          </div>
                          <p className="font-lato text-[11px] text-gray-400 mb-1 uppercase">CHAVE PIX</p>
                          <p className="font-lato text-[13px] text-wedding-charcoal break-all bg-white p-2 border border-wedding-blush/30">{presente.pix}</p>
                          <p className="font-lato text-[10px] text-gray-400 mt-2 italic">Destinatário: <strong>Daniel & Mariana</strong></p>
                          <button onClick={() => navigator.clipboard.writeText(presente.pix)} className="mt-2 font-lato text-[10px] text-wedding-terracotta bg-none border-none cursor-pointer uppercase tracking-widest">Copiar chave</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </FadeSection>

            {/* SEÇÃO 6: RSVP */}
            <FadeSection>
              <section className="mb-16">
                <SectionDivider number="06" title="Confirmação de Presença" />
                {sucesso ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-[48px] mb-4">💌</p>
                    <h3 className="font-halimun text-[32px] md:text-[38px] text-wedding-terracotta mb-4">Obrigado!</h3>
                    <p className="font-lato text-[14px] text-gray-600 font-light leading-relaxed">Sua resposta foi registrada com sucesso.<br />Estamos ansiosos para celebrar com você!</p>
                    {resposta === "Confirmado" && (
                      <div className="mt-8 p-8 bg-wedding-blush/5 border border-wedding-blush/30 animate-in fade-in duration-1000 text-center">
                        <h4 className="font-cormorant text-[24px] text-wedding-charcoal mb-1">Manual do Convidado</h4>
                        <p className="font-lato text-[12px] text-wedding-gold mb-6 italic tracking-wider">Consciente</p>
                        <img src="https://i.pinimg.com/736x/e5/00/3f/e5003ff83e060a19dc7d81ad98f52fa7.jpg" alt="Manual do Convidado" className="w-full max-w-[500px] h-auto object-contain block mx-auto rounded-sm" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[500px] mx-auto bg-white/30 p-6 border border-wedding-blush/30">
                    <p className="font-lato text-[13px] text-gray-600 mb-5 text-center">Você irá comparecer?</p>
                    
                    {/* BALÃO DE LEMBRETE */}
                    {mostrarLembrete && (
                      <div className="bg-wedding-terracotta text-white p-3 rounded-lg text-[13px] text-center mb-4 relative animate-bounce">
                        ✨ Não esqueça de informar seus acompanhantes abaixo!
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-wedding-terracotta" />
                      </div>
                    )}

                    <div className="flex justify-center gap-2 mb-8">
                      {["Confirmado", "Não Irá", "Talvez"].map((op) => (
                        <button 
                          key={op} 
                          onClick={() => handleRespostaChange(op as any)} 
                          className={`flex-1 py-3 text-[10px] uppercase tracking-widest border transition-all ${resposta === op ? "bg-wedding-charcoal text-white border-wedding-charcoal" : "border-wedding-blush/30 text-wedding-charcoal hover:border-wedding-gold"}`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>

                    {resposta === "Confirmado" && (
                      <div className="space-y-8 animate-in slide-in-from-top-2 duration-500">
                        {/* ACOMPANHANTES ADULTOS */}
                        <div className="space-y-4">
                          <p className="font-lato text-[12px] text-wedding-gold uppercase tracking-widest">Acompanhantes Adultos</p>
                          {adultos.map((a, i) => (
                            <div key={i} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2">
                              <input
                                type="text"
                                placeholder={`Nome do acompanhante ${i + 1}`}
                                value={a.nome}
                                onChange={(e) => {
                                  const newAdultos = [...adultos];
                                  newAdultos[i].nome = e.target.value;
                                  setAdultos(newAdultos);
                                }}
                                className="wedding-input !text-[16px]"
                              />
                              <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-wedding-blush hover:text-wedding-terracotta transition-colors text-lg">✕</button>
                            </div>
                          ))}
                          {podeAdicionarAcompanhante && (
                            <button onClick={() => setAdultos([...adultos, { nome: "" }])} className="w-full font-lato text-[11px] text-wedding-terracotta bg-none border border-dashed border-wedding-terracotta/50 p-3 uppercase tracking-widest hover:bg-wedding-terracotta/5 transition-all">+ Adicionar Adulto</button>
                          )}
                        </div>

                        {/* ACOMPANHANTES CRIANÇAS */}
                        <div className="space-y-4">
                          <p className="font-lato text-[12px] text-wedding-gold uppercase tracking-widest">Crianças</p>
                          {criancas.map((c, i) => (
                            <div key={i} className="grid grid-cols-[1fr_80px_40px] gap-2 items-center animate-in fade-in slide-in-from-left-2">
                              <input
                                type="text"
                                placeholder="Nome"
                                value={c.nome}
                                onChange={(e) => {
                                  const newCriancas = [...criancas];
                                  newCriancas[i].nome = e.target.value;
                                  setCriancas(newCriancas);
                                }}
                                className="wedding-input !text-[16px]"
                              />
                              <input
                                type="number"
                                placeholder="Idade"
                                value={c.idade}
                                onChange={(e) => {
                                  const newCriancas = [...criancas];
                                  newCriancas[i].idade = e.target.value;
                                  setCriancas(newCriancas);
                                }}
                                className="wedding-input !text-[16px]"
                              />
                              <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="text-wedding-blush hover:text-wedding-terracotta transition-colors text-lg">✕</button>
                            </div>
                          ))}
                          {podeAdicionarAcompanhante && (
                            <button onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])} className="w-full font-lato text-[11px] text-wedding-terracotta bg-none border border-dashed border-wedding-terracotta/50 p-3 uppercase tracking-widest hover:bg-wedding-terracotta/5 transition-all">+ Adicionar Criança</button>
                          )}
                        </div>
                      </div>
                    )}

                    {(resposta === "Confirmado" || resposta === "Não Irá") && (
                      <div className="mt-8 space-y-3 animate-in fade-in duration-500">
                        <p className="font-lato text-[12px] text-wedding-gold uppercase tracking-widest">Mensagem para os noivos</p>
                        <textarea 
                          placeholder="Deixe uma mensagem carinhosa..." 
                          value={mensagem} 
                          onChange={(e) => setMensagem(e.target.value)} 
                          className="wedding-input h-24 !text-[16px] resize-none"
                        />
                      </div>
                    )}

                    {resposta && (
                      <button 
                        onClick={handleSubmit} 
                        disabled={confirmarPresenca.isPending} 
                        className="w-full bg-wedding-charcoal text-wedding-cream py-5 mt-8 tracking-[0.2em] uppercase text-[12px] transition-all hover:bg-wedding-terracotta disabled:bg-gray-300"
                      >
                        {confirmarPresenca.isPending ? "Enviando..." : "Enviar Resposta"}
                      </button>
                    )}
                  </div>
                )}
              </section>
            </FadeSection>
          </div>
        )}
      </div>

      <footer className="text-center py-10 px-5 border-t border-wedding-blush/30">
        <p className="font-lato text-[10px] text-gray-400 tracking-[0.2em] uppercase">Feito com amor para Daniel & Mariana</p>
      </footer>

      {/* Estilos Globais e Animações (Alguns mantidos para compatibilidade, outros migrados para Tailwind) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap');
        
        /* Animações customizadas que o Tailwind padrão pode não ter */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease forwards; }
      `}</style>
    </div>
  );
}
