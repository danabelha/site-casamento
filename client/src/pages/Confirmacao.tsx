/*
 * Design Philosophy: Minimalismo Japonês Contemporâneo (Wabi-Sabi + Editorial Japonês)
 * Página de Confirmação — Otimizada para Mobile First
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
      <p className="font-['Lato'] text-[10px] tracking-[0.4em] text-[#C9A96E] font-normal uppercase mb-3">
        {number}
      </p>
      <h2 className="font-['Cormorant_Garamond'] text-[28px] md:text-[42px] font-light text-[#2C2C2C] leading-tight mb-4">
        {title}
      </h2>
      <div className="w-10 h-[1px] bg-[#C9A96E] mx-auto" />
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
        {/* Foto Esquerda */}
        <div 
          className="flex-[0_0_60px] sm:flex-[0_0_140px] opacity-40 cursor-pointer transition-all duration-500 scale-90 hidden sm:block"
          onClick={() => handleImageClick((currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
        >
          <img src={GALLERY_IMAGES[(currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length]} className="w-full h-auto rounded-sm object-cover" alt="Anterior" />
        </div>

        {/* Foto Central */}
        <div className="flex-[0_0_85%] sm:flex-[0_0_380px] z-10 transition-all duration-500">
          <img src={GALLERY_IMAGES[currentIndex]} className="w-full h-auto rounded-sm shadow-xl object-cover" alt="Atual" />
        </div>

        {/* Foto Direita */}
        <div 
          className="flex-[0_0_60px] sm:flex-[0_0_140px] opacity-40 cursor-pointer transition-all duration-500 scale-90 hidden sm:block"
          onClick={() => handleImageClick((currentIndex + 1) % GALLERY_IMAGES.length)}
        >
          <img src={GALLERY_IMAGES[(currentIndex + 1) % GALLERY_IMAGES.length]} className="w-full h-auto rounded-sm object-cover" alt="Próxima" />
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {GALLERY_IMAGES.map((_, i) => (
          <div 
            key={i} 
            onClick={() => handleImageClick(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === i ? "w-6 bg-[#C4876A]" : "w-2 bg-[#C4876A]/30"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Confirmacao() {
  const [nomeBusca, setNomeBusca] = useState("");
  const [convidadoSelecionado, setConvidadoSelecionado] = useState<any>(null);
  const [resposta, setResposta] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pixVisivel, setPixVisivel] = useState<Record<number, boolean>>({});

  const searchConvidados = trpc.searchConvidados.useMutation();
  const confirmarPresenca = trpc.confirmarPresenca.useMutation();

  const buscarConvidado = async () => {
    if (!nomeBusca.trim()) return;
    try {
      const resultado = await searchConvidados.mutateAsync({ nome: nomeBusca });
      if (resultado && resultado.length > 0) {
        setConvidadoSelecionado(resultado[0]);
      } else {
        alert("Convite não encontrado. Verifique o nome digitado.");
      }
    } catch (error) {
      alert("Erro ao buscar. Tente novamente.");
    }
  };

  return (
    <div className="bg-[#FDFAF6] min-h-screen font-['Lato'] text-[#2C2C2C]">
      {/* Header Fixo e Responsivo */}
      <header className="sticky top-0 z-[100] bg-[#FDFAF6]/80 backdrop-blur-md border-b border-[#E8CECE] py-4 px-6 text-center">
        <Link href="/">
          <span className="font-['Halimun'] text-[24px] md:text-[32px] cursor-pointer whitespace-nowrap">
            Mariana & Daniel
          </span>
        </Link>
        <p className="font-['Montserrat'] text-[10px] tracking-[0.2em] text-[#C9A96E] uppercase mt-1">
          05 · 12 · 2026
        </p>
      </header>

      <main className="max-w-[900px] mx-auto px-4 md:px-6">
        
        {/* BUSCA DE CONVITE */}
        {!convidadoSelecionado ? (
          <FadeSection className="min-h-[80vh] flex flex-col justify-center text-center">
            <SectionDivider number="01" title="Confirme sua Presença" />
            <p className="text-[#888] font-light mb-8">Digite seu nome completo para localizar seu convite.</p>
            <div className="max-w-[400px] mx-auto w-full">
              <input
                type="text"
                placeholder="Nome e Sobrenome..."
                className="w-full p-4 bg-transparent border border-[#E8CECE] text-center mb-4 outline-none focus:border-[#C4876A] transition-colors"
                value={nomeBusca}
                onChange={(e) => setNomeBusca(e.target.value)}
              />
              <button 
                onClick={buscarConvidado} 
                className="w-full bg-[#2C2C2C] text-[#FDFAF6] py-4 tracking-[0.2em] uppercase text-[12px] hover:bg-[#444] transition-colors"
              >
                {searchConvidados.isPending ? "Buscando..." : "Verificar Convite"}
              </button>
            </div>
          </FadeSection>
        ) : (
          <div className="py-12">
            {/* BOAS VINDAS */}
            <FadeSection className="text-center mb-16">
              <h2 className="font-['Halimun'] text-[32px] md:text-[48px] text-[#C4876A] mb-4">
                Olá, {convidadoSelecionado.nome.split(' ')[0]}!
              </h2>
              <p className="text-[#888] font-light max-w-[600px] mx-auto">
                Nossa história também tem você, por isso queremos viver esse momento único ao seu lado.
              </p>
            </FadeSection>

            {/* HISTÓRIA */}
            <FadeSection className="mb-20">
              <SectionDivider number="02" title="Nossa História" />
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="text-center md:text-left">
                  <p className="font-['Cormorant_Garamond'] text-[20px] italic text-[#C4876A] mb-4 leading-relaxed">
                    "Nos conhecemos por acaso, mas acreditamos que foi o destino."
                  </p>
                  <p className="text-[14px] text-[#555] leading-relaxed font-light">
                    Tudo começou em uma tarde comum que se tornou extraordinária. Um encontro inesperado, um sorriso tímido, e a certeza de que algo especial havia começado.
                  </p>
                </div>
                <div className="space-y-4">
                  {[{ ano: "2020", e: "Primeiro encontro" }, { ano: "2023", e: "Pedido de casamento" }, { ano: "2026", e: "O grande dia" }].map((item) => (
                    <div key={item.ano} className="flex items-center gap-4 justify-center md:justify-start">
                      <span className="font-bold text-[#C9A96E] w-10 text-[13px]">{item.ano}</span>
                      <div className="w-[1px] h-4 bg-[#D4A5A5]" />
                      <span className="text-[13px] text-[#555] font-light">{item.e}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>

            {/* GALERIA */}
            <FadeSection className="mb-20">
              <SectionDivider number="03" title="Galeria de Fotos" />
              <Carrossel />
            </FadeSection>

            {/* LOCALIZAÇÃO */}
            <FadeSection className="mb-20">
              <SectionDivider number="04" title="Localização" />
              <div className="text-center mb-6">
                <p className="font-['Cormorant_Garamond'] text-[22px] text-[#2C2C2C]">Celeiro Quintal</p>
                <p className="text-[14px] text-[#888] font-light">R. Cônego Eugênio Leite, 1098 — Pinheiros, São Paulo</p>
              </div>
              <div className="rounded-sm overflow-hidden border border-[#E8CECE] h-[250px] md:h-[400px]">
                <iframe 
                  width="100%" height="100%" 
                  src="https://maps.google.com/maps?q=Celeiro+Quintal+Pinheiros&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  className="border-0" title="Mapa" loading="lazy" 
                />
              </div>
            </FadeSection>

            {/* PRESENTES */}
            <FadeSection className="mb-20">
              <SectionDivider number="05" title="Lista de Presentes" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESENTES.map((p, i ) => (
                  <div key={i} className="border border-[#E8CECE] p-8 text-center bg-white/50 hover:shadow-md transition-shadow">
                    <span className="text-3xl block mb-4">{p.emoji}</span>
                    <h3 className="font-['Cormorant_Garamond'] text-[18px] mb-2">{p.nome}</h3>
                    <p className="text-[12px] text-[#888] mb-4 h-10">{p.descricao}</p>
                    <p className="text-[#C4876A] font-bold mb-6">{p.valor}</p>
                    <button 
                      onClick={() => setPixVisivel({ ...pixVisivel, [i]: !pixVisivel[i] })}
                      className="text-[10px] tracking-widest uppercase border border-[#2C2C2C] px-6 py-2 hover:bg-[#2C2C2C] hover:text-[#FDFAF6] transition-all"
                    >
                      {pixVisivel[i] ? "Fechar" : "Presentear"}
                    </button>
                    {pixVisivel[i] && (
                      <div className="mt-4 p-4 bg-[#F5E8E8] text-[11px] animate-in fade-in zoom-in duration-300">
                        <p className="text-[#888] uppercase mb-1">Chave PIX</p>
                        <p className="font-mono break-all bg-white p-2 border border-[#D4A5A5]">{p.pix}</p>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(p.pix); alert("Copiado!"); }}
                          className="mt-2 text-[#C4876A] uppercase tracking-tighter"
                        >
                          Copiar Chave
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FadeSection>

            {/* RSVP FORM */}
            <FadeSection className="mb-20 bg-white/30 p-8 md:p-12 border border-[#E8CECE]">
              <SectionDivider number="06" title="RSVP" />
              {sucesso ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-4">💌</p>
                  <h3 className="font-['Halimun'] text-[32px] text-[#C4876A]">Obrigado!</h3>
                  <p className="text-[#555] font-light mt-4">Sua resposta foi registrada com sucesso.</p>
                </div>
              ) : (
                <div className="max-w-[500px] mx-auto space-y-6">
                  <div className="flex justify-center gap-4">
                    {["Confirmado", "Não Irá"].map((op) => (
                      <button
                        key={op}
                        onClick={() => setResposta(op)}
                        className={`px-6 py-3 text-[12px] tracking-widest uppercase border transition-all ${
                          resposta === op ? "bg-[#2C2C2C] text-white border-[#2C2C2C]" : "border-[#E8CECE] text-[#888]"
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                  {resposta && (
                    <button 
                      onClick={() => setSucesso(true)}
                      className="w-full bg-[#C4876A] text-white py-4 tracking-[0.2em] uppercase text-[12px] hover:bg-[#B37555] transition-colors mt-6"
                    >
                      Enviar Resposta
                    </button>
                  )}
                </div>
              )}
            </FadeSection>
          </div>
        )}
      </main>

      {/* Footer Simples */}
      <footer className="py-10 border-t border-[#E8CECE] text-center opacity-40 text-[10px] tracking-[0.3em] uppercase">
        Mariana & Daniel &copy; 2026
      </footer>
    </div>
  );
}
