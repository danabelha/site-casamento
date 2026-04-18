/*
 * Página de Confirmação — Versão Final Otimizada
 * Restaura lógica original de acompanhantes e manual do convidado
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
  { nome: "Lua de Mel", descricao: "Contribua para nossa viagem dos sonhos", valor: "Qualquer valor", pix: "casamento@danielemariana.com", emoji: "✈️" },
  { nome: "Jantar Romântico", descricao: "Um jantar especial para celebrarmos juntos", valor: "R$ 350", pix: "casamento@danielemariana.com", emoji: "🍷" },
  { nome: "Kit Cozinha", descricao: "Utensílios para nossa nova casa", valor: "R$ 280", pix: "casamento@danielemariana.com", emoji: "🏠" },
  { nome: "Noite em Hotel", descricao: "Uma noite especial em nosso destino", valor: "R$ 500", pix: "casamento@danielemariana.com", emoji: "🌙" },
  { nome: "Sessão de Fotos", descricao: "Memórias eternas do nosso amor", valor: "R$ 600", pix: "casamento@danielemariana.com", emoji: "📸" },
  { nome: "Contribuição Livre", descricao: "Qualquer valor é bem-vindo com amor", valor: "Livre", pix: "casamento@danielemariana.com", emoji: "💝" },
];

// ===== COMPONENTES AUXILIARES =====

function SectionDivider({ number, title }: { number: string; title: string } ) {
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {children}
    </div>
  );
}

function Carrossel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    if (isRightSwipe) setCurrentIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  return (
    <div className="relative w-full mb-6 overflow-hidden pb-8" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-center gap-2 sm:gap-4 perspective-[1000px] min-h-[300px] md:min-h-[450px]">
        <div className="flex-[0_0_90%] sm:flex-[0_0_380px] z-10 transition-all duration-500">
          <img src={GALLERY_IMAGES[currentIndex]} className="w-full h-auto rounded-sm shadow-xl object-cover pointer-events-none" alt="Galeria" />
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {GALLERY_IMAGES.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? "w-6 bg-wedding-terracotta" : "w-2 bg-wedding-terracotta/30"}`} />
        ))}
      </div>
    </div>
  );
}

export default function Confirmacao() {
  const [nomeBusca, setNomeBusca] = useState("");
  const [convidadoSelecionado, setConvidadoSelecionado] = useState<any>(null);
  const [resposta, setResposta] = useState<"Confirmado" | "Não Irá" | "Talvez" | null>(null);
  const [adultos, setAdultos] = useState<{ nome: string }[]>([]);
  const [criancas, setCriancas] = useState<{ nome: string; idade: string }[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pixVisivel, setPixVisivel] = useState<Record<number, boolean>>({});

  const searchConvidados = trpc.searchConvidados.useMutation();
  const confirmarPresenca = trpc.confirmarPresenca.useMutation();

  const buscarConvidado = async () => {
    if (!nomeBusca.trim()) return;
    try {
      const resultado = await searchConvidados.mutateAsync({ nome: nomeBusca });
      if (resultado && (resultado as any).length > 0) {
        setConvidadoSelecionado((resultado as any)[0]);
      } else {
        alert("Convite não encontrado.");
      }
    } catch (error) {
      alert("Erro ao buscar.");
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
        menores8: criancas.filter((c) => (Number(c.idade) || 0) < 8).length,
        mensagem,
        acompanhanteDetalhes: [...adultos.map(a => a.nome), ...criancas.map(c => `${c.nome} (${c.idade} anos)`)].join("\n"),
      });
      setSucesso(true);
    } catch (error) {
      alert("Erro ao confirmar.");
    }
  };

  return (
    <div className="bg-wedding-cream min-h-screen font-lato text-wedding-charcoal">
      {/* Header com correção de Zoom */}
      <header className="sticky top-0 z-[100] bg-wedding-cream/90 backdrop-blur-md border-b border-wedding-blush/30 py-4 px-6 text-center">
        <Link href="/">
          <span className="font-halimun text-[22px] md:text-[32px] cursor-pointer whitespace-nowrap">Mariana & Daniel</span>
        </Link>
        <p className="font-montserrat text-[10px] tracking-[0.2em] text-wedding-gold uppercase mt-1">05 · 12 · 2026</p>
      </header>

      <main className="max-w-[900px] mx-auto px-4 md:px-6">
        {!convidadoSelecionado ? (
          <FadeSection className="min-h-[80vh] flex flex-col justify-center text-center">
            <SectionDivider number="01" title="Confirme sua Presença" />
            <div className="max-w-[400px] mx-auto w-full">
              <input
                type="text"
                placeholder="Nome e Sobrenome..."
                className="wedding-input text-center mb-4 !text-[16px]" // !text-[16px] mata o zoom do iOS
                value={nomeBusca}
                onChange={(e) => setNomeBusca(e.target.value)}
              />
              <button onClick={buscarConvidado} className="w-full bg-wedding-charcoal text-wedding-cream py-4 tracking-[0.2em] uppercase text-[12px]">
                {searchConvidados.isPending ? "Buscando..." : "Verificar Convite"}
              </button>
            </div>
          </FadeSection>
        ) : (
          <div className="py-12">
            <FadeSection className="text-center mb-16">
              <h2 className="font-halimun text-[28px] md:text-[48px] text-wedding-terracotta mb-4">Olá, {convidadoSelecionado.nome}!</h2>
              {convidadoSelecionado.limite > 0 && (
                <p className="text-wedding-gold uppercase text-[12px] tracking-widest">Você pode levar até {convidadoSelecionado.limite} acompanhantes</p>
              )}
            </FadeSection>

            {/* HISTÓRIA E GALERIA */}
            <FadeSection className="mb-20"><SectionDivider number="02" title="Nossa História" /><Carrossel /></FadeSection>

            {/* PRESENTES */}
            <FadeSection className="mb-20">
              <SectionDivider number="03" title="Lista de Presentes" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRESENTES.map((p, i) => (
                  <div key={i} className="border border-wedding-blush/30 p-6 text-center bg-white/50">
                    <span className="text-2xl block mb-2">{p.emoji}</span>
                    <h3 className="font-cormorant text-[18px] mb-1">{p.nome}</h3>
                    <p className="text-wedding-terracotta font-bold mb-4">{p.valor}</p>
                    <button onClick={() => setPixVisivel({...pixVisivel, [i]: !pixVisivel[i]})} className="text-[10px] border border-wedding-charcoal px-4 py-2 uppercase">
                      {pixVisivel[i] ? "Fechar" : "Presentear"}
                    </button>
                    {pixVisivel[i] && <div className="mt-4 p-4 bg-wedding-blush/10 font-mono text-[12px] break-all">{p.pix}</div>}
                  </div>
                ))}
              </div>
            </FadeSection>

            {/* RSVP ORIGINAL RESTAURADO */}
            <FadeSection className="mb-20 bg-white/30 p-6 border border-wedding-blush/30">
              <SectionDivider number="04" title="Confirmação (RSVP)" />
              {sucesso ? (
                <div className="text-center">
                  <h3 className="font-halimun text-[32px] text-wedding-terracotta mb-6">Obrigado!</h3>
                  {resposta === "Confirmado" && (
                    <div className="animate-in fade-in duration-1000">
                      <p className="text-wedding-gold italic mb-4">Manual do Convidado</p>
                      <img src="https://i.pinimg.com/736x/e5/00/3f/e5003ff83e060a19dc7d81ad98f52fa7.jpg" className="w-full max-w-[400px] mx-auto rounded-sm" alt="Manual" />
                    </div>
                   )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {["Confirmado", "Não Irá", "Talvez"].map((op) => (
                      <button key={op} onClick={() => setResposta(op as any)} className={`flex-1 py-3 text-[10px] uppercase border ${resposta === op ? "bg-wedding-charcoal text-white" : "border-wedding-blush/30"}`}>{op}</button>
                    ))}
                  </div>
                  
                                    {resposta === "Confirmado" && (
                    <div className="space-y-6 animate-in slide-in-from-top-2">
                      {/* Mensagem para os Noivos */}
                      <textarea 
                        placeholder="Deixe uma mensagem carinhosa para nós..." 
                        className="wedding-input h-24 !text-[16px]" 
                        value={mensagem} 
                        onChange={(e) => setMensagem(e.target.value)} 
                      />

                      {/* Gestão de Acompanhantes (Adultos) */}
                      <div className="space-y-4">
                        <p className="text-[12px] uppercase tracking-widest text-wedding-gold">Acompanhantes Adultos</p>
                        {adultos.map((a, i) => (
                          <div key={i} className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder={`Nome do acompanhante ${i + 1}`}
                              className="wedding-input !text-[16px]"
                              value={a.nome}
                              onChange={(e) => {
                                const newAdultos = [...adultos];
                                newAdultos[i].nome = e.target.value;
                                setAdultos(newAdultos);
                              }}
                            />
                            <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-red-400 px-2">✕</button>
                          </div>
                        ))}
                        {adultos.length + criancas.length < (convidadoSelecionado?.limite || 0) && (
                          <button 
                            onClick={() => setAdultos([...adultos, { nome: "" }])}
                            className="text-[11px] uppercase tracking-tighter text-wedding-terracotta border border-wedding-terracotta/30 px-4 py-2"
                          >
                            + Adicionar Adulto
                          </button>
                        )}
                      </div>

                      {/* Gestão de Crianças */}
                      <div className="space-y-4">
                        <p className="text-[12px] uppercase tracking-widest text-wedding-gold">Crianças</p>
                        {criancas.map((c, i) => (
                          <div key={i} className="grid grid-cols-[1fr_80px_40px] gap-2">
                            <input 
                              type="text" 
                              placeholder="Nome da criança"
                              className="wedding-input !text-[16px]"
                              value={c.nome}
                              onChange={(e) => {
                                const newCriancas = [...criancas];
                                newCriancas[i].nome = e.target.value;
                                setCriancas(newCriancas);
                              }}
                            />
                            <input 
                              type="number" 
                              placeholder="Idade"
                              className="wedding-input !text-[16px]"
                              value={c.idade}
                              onChange={(e) => {
                                const newCriancas = [...criancas];
                                newCriancas[i].idade = e.target.value;
                                setCriancas(newCriancas);
                              }}
                            />
                            <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="text-red-400">✕</button>
                          </div>
                        ))}
                        {adultos.length + criancas.length < (convidadoSelecionado?.limite || 0) && (
                          <button 
                            onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                            className="text-[11px] uppercase tracking-tighter text-wedding-terracotta border border-wedding-terracotta/30 px-4 py-2"
                          >
                            + Adicionar Criança
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <button onClick={handleSubmit} disabled={!resposta} className="w-full bg-wedding-terracotta text-white py-4 uppercase text-[12px] disabled:opacity-50">Enviar Confirmação</button>
                </div>
              )}
            </FadeSection>
          </div>
        )}
      </main>
    </div>
  );
}
