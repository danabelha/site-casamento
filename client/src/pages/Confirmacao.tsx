/*
 * Página de Confirmação — Otimizada para Mobile First com Tailwind 4
 */

import { useEffect, useRef, useState } from "react";
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

function Carrossel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
  };

  return (
    <div className="relative w-full mb-6 overflow-hidden pb-8">
      <div className="flex items-center justify-center gap-2 sm:gap-4 perspective-[1000px] min-h-[300px] md:min-h-[450px]">
        {/* Foto Esquerda (Oculta em Mobile) */}
        <div 
          className="flex-[0_0_60px] sm:flex-[0_0_140px] opacity-40 cursor-pointer transition-all duration-500 scale-90 hidden sm:block"
          onClick={() => handleImageClick((currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
        >
          <img src={GALLERY_IMAGES[(currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length]} className="w-full h-auto rounded-sm object-cover" alt="Anterior" />
        </div>

        {/* Foto Central (Principal no Mobile) */}
        <div className="flex-[0_0_90%] sm:flex-[0_0_380px] z-10 transition-all duration-500">
          <img src={GALLERY_IMAGES[currentIndex]} className="w-full h-auto rounded-sm shadow-xl object-cover" alt="Atual" />
        </div>

        {/* Foto Direita (Oculta em Mobile) */}
        <div 
          className="flex-[0_0_60px] sm:flex-[0_0_140px] opacity-40 cursor-pointer transition-all duration-500 scale-90 hidden sm:block"
          onClick={() => handleImageClick((currentIndex + 1) % GALLERY_IMAGES.length)}
        >
          <img src={GALLERY_IMAGES[(currentIndex + 1) % GALLERY_IMAGES.length]} className="w-full h-auto rounded-sm object-cover" alt="Próxima" />
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {GALLERY_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleImageClick(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              currentIndex === i ? "bg-wedding-gold w-4" : "bg-wedding-gold/30"
            }`}
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
  const [resposta, setResposta] = useState<"Confirmado" | "Não Irá" | null>(null);
  const [adultos, setAdultos] = useState<{ nome: string }[]>([]);
  const [criancas, setCriancas] = useState<{ nome: string; idade: string }[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pixVisivel, setPixVisivel] = useState<Record<number, boolean>>({});
  const [pixCopiado, setPixCopiado] = useState<number | null>(null);

  const searchConvidados = trpc.searchConvidados.useMutation();
  const confirmarPresenca = trpc.confirmarPresenca.useMutation();

  const buscarConvidado = async () => {
    if (!nomeBusca.trim()) return;
    try {
      const resultado = await searchConvidados.mutateAsync({ nome: nomeBusca });
      if (resultado && (resultado as any).length > 0) {
        setConvidadoSelecionado((resultado as any)[0]);
      } else {
        alert("Convidado não encontrado. Verifique o nome.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar convidado.");
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

      await confirmarPresenca.mutateAsync({
        id: convidadoSelecionado.id,
        status: resposta,
        acompanhantes: adultos.length,
        criancas: criancas.length,
        menores8: criancas.filter(c => Number(c.idade) < 8).length,
        mensagem,
        acompanhanteDetalhes: detalhes,
      });
      setSucesso(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao confirmar presença.");
    }
  };

  return (
    <div className="min-h-screen bg-wedding-cream text-wedding-charcoal">
      <main className="max-w-4xl mx-auto pt-20 pb-20">
        <FadeSection className="px-6 text-center mb-20">
          <p className="font-lato text-[10px] tracking-[0.6em] text-wedding-gold uppercase mb-6">20 de Setembro de 2025</p>
          <h1 className="font-halimun text-[42px] md:text-[60px] text-wedding-terracotta leading-tight">Daniele & Mariana</h1>
        </FadeSection>

        <FadeSection className="mb-24">
          <SectionDivider number="01" title="Galeria" />
          <Carrossel />
        </FadeSection>

        {!convidadoSelecionado ? (
          <FadeSection className="max-w-[500px] mx-auto px-6 text-center">
            <SectionDivider number="02" title="Confirmar Presença" />
            <p className="font-light text-[#888] mb-8 text-sm">Informe seu nome conforme o convite</p>
            <input 
              type="text" 
              placeholder="Nome do Convidado" 
              className="wedding-input mb-6"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarConvidado()}
            />
            <button 
              onClick={buscarConvidado}
              className="w-full bg-wedding-charcoal text-white py-4 tracking-[0.2em] uppercase text-[12px]"
            >
              Verificar Convite
            </button>
          </FadeSection>
        ) : (
          <div className="px-6">
            <FadeSection className="mb-24">
              <SectionDivider number="02" title="Localização" />
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-right space-y-4">
                  <h3 className="font-cormorant text-2xl text-wedding-terracotta">Espaço das Águas</h3>
                  <p className="text-sm font-light text-[#888]">Rua das Palmeiras, 123 — São Paulo</p>
                  <a href="#" className="inline-block border-b border-wedding-gold text-wedding-gold py-1 text-[10px] uppercase tracking-widest">Abrir no Maps</a>
                </div>
                <div className="h-[300px] bg-gray-100 rounded-sm grayscale">
                  <iframe width="100%" height="100%" frameBorder="0" src="https://maps.google.com/maps?q=-23.5505,-46.6333&z=15&output=embed" />
                </div>
              </div>
            </FadeSection>

            <FadeSection className="mb-24">
              <SectionDivider number="03" title="Presentes" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRESENTES.map((p, i) => (
                  <div key={i} className="p-6 border border-wedding-blush/20 bg-white/50 hover:bg-white transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-[10px] uppercase tracking-widest text-wedding-gold font-bold">{p.valor}</span>
                    </div>
                    <h4 className="font-cormorant text-xl text-wedding-charcoal">{p.nome}</h4>
                    <p className="text-[11px] text-[#888] mt-1 mb-4">{p.descricao}</p>
                    <button 
                      onClick={() => setPixVisivel({ ...pixVisivel, [i]: !pixVisivel[i] })}
                      className="text-[10px] uppercase tracking-widest text-wedding-terracotta border-b border-wedding-terracotta/30 pb-1"
                    >
                      {pixVisivel[i] ? "Ocultar Chave" : "Presentear via PIX"}
                    </button>
                    {pixVisivel[i] && (
                      <div className="mt-4 p-4 bg-wedding-blush/10 text-[11px] animate-in fade-in zoom-in duration-300">
                        <p className="text-[#888] uppercase mb-1">Chave PIX</p>
                        <p className="font-mono break-all bg-white p-2 border border-wedding-blush/30">{p.pix}</p>
                        <button 
                          onClick={() => copiarPix(i, p.pix)}
                          className={`mt-2 uppercase tracking-tighter transition-all ${pixCopiado === i ? 'text-green-500 font-bold' : 'text-wedding-terracotta'}`}
                        >
                          {pixCopiado === i ? "✓ Chave Copiada!" : "Copiar Chave"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FadeSection>

            <FadeSection className="mb-20 bg-white/30 p-8 md:p-12 border border-wedding-blush/30">
              <SectionDivider number="04" title="RSVP" />
              {sucesso ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-4">💌</p>
                  <h3 className="font-halimun text-[32px] text-wedding-terracotta">Obrigado!</h3>
                  <p className="text-[#555] font-light mt-4">Sua resposta foi registrada com sucesso.</p>
                </div>
              ) : (
                <div className="max-w-[500px] mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <p className="font-cormorant text-xl">Olá, {convidadoSelecionado.nome}</p>
                    <p className="text-[10px] uppercase tracking-widest text-wedding-gold mt-1">Confirme sua presença abaixo</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    {["Confirmado", "Não Irá"].map((op) => (
                      <button
                        key={op}
                        onClick={() => setResposta(op as any)}
                        className={`px-6 py-3 text-[12px] tracking-widest uppercase border transition-all ${
                          resposta === op ? "bg-wedding-charcoal text-white border-wedding-charcoal" : "border-wedding-blush/30 text-[#888]"
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  {resposta === "Confirmado" && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="p-4 bg-wedding-gold/5 border border-wedding-gold/10 text-center">
                        <p className="text-[10px] text-wedding-gold uppercase tracking-widest">Limite de acompanhantes: {convidadoSelecionado.limite}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-[#888]">Acompanhantes Adultos</label>
                        {adultos.map((a, i) => (
                          <div key={i} className="flex gap-2">
                            <input type="text" placeholder="Nome" className="wedding-input text-xs" value={a.nome} onChange={(e) => {
                              const n = [...adultos]; n[i].nome = e.target.value; setAdultos(n);
                            }} />
                            <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-red-300">×</button>
                          </div>
                        ))}
                        {adultos.length + criancas.length < convidadoSelecionado.limite && (
                          <button onClick={() => setAdultos([...adultos, { nome: "" }])} className="text-[10px] uppercase text-wedding-gold">+ Adicionar Adulto</button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-[#888]">Crianças</label>
                        {criancas.map((c, i) => (
                          <div key={i} className="flex gap-2">
                            <input type="text" placeholder="Nome" className="wedding-input text-xs flex-1" value={c.nome} onChange={(e) => {
                              const n = [...criancas]; n[i].nome = e.target.value; setCriancas(n);
                            }} />
                            <input type="number" placeholder="Idade" className="wedding-input text-xs w-20" value={c.idade} onChange={(e) => {
                              const n = [...criancas]; n[i].idade = e.target.value; setCriancas(n);
                            }} />
                            <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="text-red-300">×</button>
                          </div>
                        ))}
                        {adultos.length + criancas.length < convidadoSelecionado.limite && (
                          <button onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])} className="text-[10px] uppercase text-wedding-gold">+ Adicionar Criança</button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#888]">Mensagem</label>
                        <textarea className="wedding-input text-xs h-24 p-2" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Deixe um recado..." />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={handleSubmit}
                      disabled={!resposta}
                      className="flex-1 bg-wedding-terracotta text-white py-4 tracking-[0.2em] uppercase text-[12px] hover:bg-wedding-terracotta/90 transition-colors"
                    >
                      Enviar Resposta
                    </button>
                    <button onClick={() => setConvidadoSelecionado(null)} className="px-4 border border-wedding-blush/30 text-[10px] uppercase">Voltar</button>
                  </div>
                </div>
              )}
            </FadeSection>
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-wedding-blush/30 text-center opacity-40 text-[10px] tracking-[0.3em] uppercase">
        Mariana & Daniel &copy; 2026
      </footer>
    </div>
  );
}
