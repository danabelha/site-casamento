/*
 * Design Philosophy: Minimalismo Japonês Contemporâneo (Wabi-Sabi + Editorial Japonês)
 * Página de Confirmação — Verificação de convidados, história, galeria, local, presentes e RSVP
 * Versão Final: Estrutura do Backup com melhorias de Tokens de Tema, Swipe e Correção de Zoom do Novo.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.webp";

// ===== CONSTANTES =====

const GALLERY_IMAGES = [img1, img2, img3, img4, img5, img6];

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

  // Função para pegar o index correto lidando com o loop
  const getIndex = (offset: number) => {
    return (currentIndex + offset + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
  };

  return (
    <div 
      className="relative w-full mb-12 overflow-hidden px-4" 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
    >
      {/* Container Principal do Carrossel */}
      <div className="relative flex items-center justify-center h-[300px] md:h-[500px] w-full max-w-6xl mx-auto">
        
        {/* Foto Esquerda (Preview) */}
        <div 
          className="absolute left-0 w-[20%] md:w-[25%] aspect-[3/4] opacity-40 scale-75 blur-[1px] transition-all duration-700 ease-in-out cursor-pointer z-0 hidden sm:block"
          onClick={handlePrev}
        >
          <img 
            src={GALLERY_IMAGES[getIndex(-1)]} 
            alt="Anterior" 
            className="w-full h-full object-cover rounded-sm shadow-md"
          />
        </div>

        {/* Foto Central (Destaque) */}
        <div className="relative w-[85%] sm:w-[50%] md:w-[45%] aspect-[3/4] z-20 transition-all duration-700 ease-in-out">
          <img 
            src={GALLERY_IMAGES[currentIndex]} 
            alt={`Foto ${currentIndex + 1}`} 
            className="w-full h-full object-cover rounded-sm shadow-2xl border border-white/10" 
          />
          
          {/* Gradiente suave sobre a foto principal para dar profundidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-sm pointer-events-none" />
        </div>

        {/* Foto Direita (Preview) */}
        <div 
          className="absolute right-0 w-[20%] md:w-[25%] aspect-[3/4] opacity-40 scale-75 blur-[1px] transition-all duration-700 ease-in-out cursor-pointer z-0 hidden sm:block"
          onClick={handleNext}
        >
          <img 
            src={GALLERY_IMAGES[getIndex(1)]} 
            alt="Próxima" 
            className="w-full h-full object-cover rounded-sm shadow-md"
          />
        </div>

        {/* Setas de Navegação Estilizadas */}
        <button 
          onClick={handlePrev} 
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/80 hover:bg-white text-wedding-charcoal rounded-full shadow-lg z-30 transition-all active:scale-95 group"
          title="Anterior"
        >
          <span className="text-2xl group-hover:-translate-x-0.5 transition-transform">‹</span>
        </button>
        
        <button 
          onClick={handleNext} 
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/80 hover:bg-white text-wedding-charcoal rounded-full shadow-lg z-30 transition-all active:scale-95 group"
          title="Próxima"
        >
          <span className="text-2xl group-hover:translate-x-0.5 transition-transform">›</span>
        </button>
      </div>

      {/* Indicadores Minimalistas */}
      <div className="flex justify-center gap-3 mt-8">
        {GALLERY_IMAGES.map((_, i) => (
          <button 
            key={i} 
            onClick={() => handleImageClick(i)} 
            className={`transition-all duration-500 rounded-full ${
              currentIndex === i 
                ? "w-8 h-1.5 bg-wedding-gold" 
                : "w-1.5 h-1.5 bg-wedding-gold/30 hover:bg-wedding-gold/50"
            }`}
            aria-label={`Ir para foto ${i + 1}`}
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
  const [pixCopiado, setPixCopiado] = useState<number | null>(null);
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

  const copiarPix = (index: number, pix: string) => {
    navigator.clipboard.writeText(pix);
    setPixCopiado(index);
    setTimeout(() => setPixCopiado(null), 3000);
  };

  // Lógica de limite de acompanhantes
  const totalAcompanhantesAtuais = adultos.length + criancas.length;
  const podeAdicionarAcompanhante = totalAcompanhantesAtuais < (convidadoSelecionado?.limite || 0);

  return (
    <div className="min-h-screen bg-wedding-cream text-wedding-charcoal selection:bg-wedding-blush/30">
      
      {/* 1. HERO / INTRO */}
      <FadeSection className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 text-center max-w-4xl mx-auto">
        <p className="font-lato text-[10px] md:text-[12px] tracking-[0.6em] text-wedding-gold uppercase mb-8 opacity-80">
          Nossa História • 20.09.2025
        </p>
        <h1 className="font-halimun text-[42px] md:text-[68px] text-wedding-terracotta leading-tight mb-12">
          Daniele & Mariana
        </h1>
        <div className="w-12 h-[1px] bg-wedding-gold mx-auto mb-12" />
        <p className="font-cormorant text-[18px] md:text-[24px] italic text-wedding-charcoal/80 leading-relaxed max-w-2xl mx-auto px-4">
          "O amor não consiste em olhar um para o outro, mas em olhar juntos na mesma direção."
        </p>
      </FadeSection>

      {/* 2. GALERIA */}
      <FadeSection className="py-16 md:py-24 bg-white/40">
        <SectionDivider number="01" title="Galeria de Fotos" />
        <Carrossel />
      </FadeSection>

      {/* 3. LOCALIZAÇÃO */}
      <FadeSection className="py-16 md:py-24 px-6 max-w-5xl mx-auto text-center">
        <SectionDivider number="02" title="Local e Hora" />
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="text-center md:text-right space-y-6">
            <h3 className="font-cormorant text-2xl md:text-3xl text-wedding-terracotta">A Cerimônia</h3>
            <p className="font-lato text-sm tracking-widest uppercase text-wedding-charcoal/60">Sábado, 20 de Setembro às 16:30h</p>
            <div className="space-y-2">
              <p className="font-cormorant text-xl">Espaço das Águas</p>
              <p className="font-lato text-[12px] text-wedding-charcoal/50 leading-relaxed">
                Av. das Palmeiras, 1500 — Jardim Botânico<br />
                São Paulo, SP
              </p>
            </div>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block border-b border-wedding-gold text-wedding-gold py-2 text-[10px] uppercase tracking-[0.3em] hover:text-wedding-terracotta hover:border-wedding-terracotta transition-all"
            >
              Ver no Google Maps
            </a>
          </div>
          <div className="h-[300px] md:h-[400px] bg-gray-100 rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 shadow-sm">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.685654523!2d-46.63!3d-23.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDM2JzAwLjAiUyA0NsKwMzcnNDguMCJX!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
            />
          </div>
        </div>
      </FadeSection>

      {/* 4. PRESENTES / PIX */}
      <FadeSection className="py-16 md:py-24 bg-white/60 px-6">
        <SectionDivider number="03" title="Lista de Presentes" />
        <p className="text-center font-cormorant text-lg text-wedding-charcoal/70 mb-12 max-w-xl mx-auto">
          Sua presença é nosso maior presente, mas se desejar nos presentear, criamos algumas sugestões:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PRESENTES.map((p, i) => (
            <div key={i} className="bg-white p-8 border border-wedding-blush/10 hover:border-wedding-gold/30 transition-all group relative overflow-hidden">
              <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-500">{p.emoji}</div>
              <h4 className="font-cormorant text-xl text-wedding-terracotta mb-2">{p.nome}</h4>
              <p className="font-lato text-[12px] text-wedding-charcoal/50 mb-6 leading-relaxed">{p.descricao}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="font-lato text-[11px] tracking-widest text-wedding-gold uppercase font-bold">{p.valor}</span>
                <button 
                  onClick={() => copiarPix(i, p.pix)}
                  className={`text-[10px] uppercase tracking-widest transition-all ${pixCopiado === i ? 'text-green-500 font-bold' : 'text-wedding-charcoal/40 hover:text-wedding-gold'}`}
                >
                  {pixCopiado === i ? "✓ Chave Copiada!" : "Copiar Chave PIX"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* 5. RSVP / CONFIRMAÇÃO */}
      <FadeSection className="py-16 md:py-32 px-6 bg-wedding-cream">
        <SectionDivider number="04" title="Confirmação de Presença" />
        
        <div className="max-w-xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-wedding-blush/10">
          {!sucesso ? (
            <div className="space-y-8">
              {!convidadoSelecionado ? (
                <div className="space-y-6">
                  <p className="font-cormorant text-center text-lg text-wedding-charcoal/60">
                    Por favor, informe seu nome conforme o convite para iniciarmos a confirmação.
                  </p>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Nome Completo" 
                      className="wedding-input pl-0"
                      value={nomeBusca}
                      onChange={(e) => setNomeBusca(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && buscarConvidado()}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-wedding-gold transition-all duration-500 group-focus-within:w-full" />
                  </div>
                  <button 
                    onClick={buscarConvidado}
                    disabled={searchConvidados.isPending}
                    className="w-full bg-wedding-charcoal text-white py-4 uppercase text-[10px] tracking-[0.4em] hover:bg-black transition-all active:scale-[0.98]"
                  >
                    {searchConvidados.isPending ? "Buscando..." : "Verificar Convite"}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center space-y-2">
                    <h3 className="font-halimun text-3xl text-wedding-terracotta">Olá, {convidadoSelecionado.nome}</h3>
                    <p className="font-lato text-[10px] uppercase tracking-widest text-wedding-gold">Ficamos muito felizes em ter você conosco!</p>
                  </div>

                  {/* Seleção de Resposta */}
                  <div className="grid grid-cols-3 gap-3">
                    {["Confirmado", "Não Irá", "Talvez"].map((opt: any) => (
                      <button 
                        key={opt}
                        onClick={() => handleRespostaChange(opt)}
                        className={`py-3 border text-[10px] uppercase tracking-widest transition-all ${resposta === opt ? 'bg-wedding-charcoal text-white border-wedding-charcoal' : 'bg-transparent text-wedding-charcoal/40 border-gray-100 hover:border-wedding-gold'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {resposta === "Confirmado" && (
                    <div className="space-y-8 pt-4 border-t border-gray-50 animate-fadeIn">
                      
                      {/* Lembrete de Limite */}
                      {mostrarLembrete && (
                        <div className="bg-wedding-gold/5 border border-wedding-gold/10 p-4 text-center animate-bounce">
                          <p className="text-[11px] text-wedding-gold font-bold uppercase tracking-widest">
                            ✨ Você pode levar até {convidadoSelecionado.limite} acompanhantes!
                          </p>
                        </div>
                      )}

                      {/* Adultos */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] uppercase tracking-widest text-wedding-gold font-bold">Acompanhantes Adultos</label>
                          <span className="text-[10px] text-gray-300 italic">{totalAcompanhantesAtuais}/{convidadoSelecionado.limite} total</span>
                        </div>
                        {adultos.map((a, i) => (
                          <div key={i} className="flex gap-2 animate-fadeIn">
                            <input 
                              type="text" 
                              placeholder="Nome do Adulto" 
                              className="wedding-input text-xs py-2"
                              value={a.nome}
                              onChange={(e) => {
                                const newArr = [...adultos];
                                newArr[i].nome = e.target.value;
                                setAdultos(newArr);
                              }}
                            />
                            <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 px-2">×</button>
                          </div>
                        ))}
                        {podeAdicionarAcompanhante && (
                          <button 
                            onClick={() => setAdultos([...adultos, { nome: "" }])}
                            className="text-[10px] uppercase tracking-widest text-wedding-gold/60 hover:text-wedding-gold transition-all"
                          >
                            + Adicionar Adulto
                          </button>
                        )}
                      </div>

                      {/* Crianças */}
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-wedding-gold font-bold block">Crianças</label>
                        {criancas.map((c, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 animate-fadeIn">
                            <input 
                              type="text" 
                              placeholder="Nome da Criança" 
                              className="col-span-8 wedding-input text-xs py-2"
                              value={c.nome}
                              onChange={(e) => {
                                const newArr = [...criancas];
                                newArr[i].nome = e.target.value;
                                setCriancas(newArr);
                              }}
                            />
                            <input 
                              type="number" 
                              placeholder="Idade" 
                              className="col-span-3 wedding-input text-xs py-2"
                              value={c.idade}
                              onChange={(e) => {
                                const newArr = [...criancas];
                                newArr[i].idade = e.target.value;
                                setCriancas(newArr);
                              }}
                            />
                            <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="col-span-1 text-gray-300 hover:text-red-400">×</button>
                          </div>
                        ))}
                        {podeAdicionarAcompanhante && (
                          <button 
                            onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                            className="text-[10px] uppercase tracking-widest text-wedding-gold/60 hover:text-wedding-gold transition-all"
                          >
                            + Adicionar Criança
                          </button>
                        )}
                      </div>

                      {/* Mensagem */}
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-wedding-gold font-bold block">Mensagem aos Noivos</label>
                        <textarea 
                          placeholder="Deixe uma mensagem especial..." 
                          className="wedding-input text-xs h-24 resize-none border p-3 focus:border-wedding-gold outline-none"
                          value={mensagem}
                          onChange={(e) => setMensagem(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handleSubmit}
                      disabled={confirmarPresenca.isPending || !resposta}
                      className="flex-1 bg-wedding-charcoal text-white py-4 uppercase text-[10px] tracking-[0.4em] hover:bg-black transition-all"
                    >
                      {confirmarPresenca.isPending ? "Enviando..." : "Confirmar Agora"}
                    </button>
                    <button 
                      onClick={() => {
                        setConvidadoSelecionado(null);
                        setResposta(null);
                        setAdultos([]);
                        setCriancas([]);
                        setMensagem("");
                      }}
                      className="px-6 border border-gray-100 text-gray-300 text-[10px] uppercase tracking-widest hover:text-wedding-charcoal hover:border-wedding-charcoal transition-all"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6 py-8 animate-fadeIn">
              <div className="text-5xl">💝</div>
              <h3 className="font-halimun text-3xl text-wedding-terracotta">Obrigado!</h3>
              <p className="font-cormorant text-xl text-wedding-charcoal/60 leading-relaxed">
                Sua resposta foi registrada com sucesso.<br />
                Mal podemos esperar para celebrar com você!
              </p>
              <button 
                onClick={() => setSucesso(false)}
                className="inline-block border-b border-wedding-gold text-wedding-gold py-2 text-[10px] uppercase tracking-[0.3em] hover:text-wedding-terracotta transition-all"
              >
                Fazer outra confirmação
              </button>
            </div>
          )}
        </div>
      </FadeSection>

      {/* FOOTER */}
      <footer className="py-16 text-center bg-white/40">
        <p className="font-halimun text-2xl text-wedding-terracotta mb-4">Daniele & Mariana</p>
        <p className="font-lato text-[10px] uppercase tracking-[0.5em] text-wedding-charcoal/30">
          Com amor • 2025
        </p>
      </footer>
    </div>
  );
}
