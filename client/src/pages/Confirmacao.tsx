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
  { nome: "Contribuição Livre", descricao: "Qualquer valor é bem-vindo com amor", pix: "casamento@danielemariana.com", emoji: "💝" },
];

// ===== COMPONENTES AUXILIARES =====

function SectionDivider({ title, isVerification = false }: { title: string; isVerification?: boolean } ) {
  return (
    <div className="text-center mb-8 md:mb-12 px-4">
      <h2 className={`font-cormorant font-light text-wedding-charcoal leading-tight mb-4 whitespace-nowrap
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
  const [carregandoBusca, setCarregandoBusca] = useState(false);

  const searchConvidados = trpc.searchConvidados.useMutation();
  const confirmarPresenca = trpc.confirmarPresenca.useMutation();

  const buscarConvidado = async () => {
    if (!nomeBusca.trim() || carregandoBusca) return;
    try {
      setCarregandoBusca(true);
      const resultado = await searchConvidados.mutateAsync({ nome: nomeBusca });
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
        {/* Cabeçalho (Nomes do Casal) - Sempre visível */}
        <FadeSection className="px-6 text-center mb-20">
          <p className="font-lato text-[10px] tracking-[0.6em] text-wedding-gold uppercase mb-6">05 de Dezembro de 2026</p>
          <h1 className="font-halimun text-[42px] md:text-[60px] text-wedding-terracotta leading-tight">Mariana & Daniel</h1>
        </FadeSection>

        {/* Seção de Busca de Convidado - Oculta após verificação */}
        {!convidadoSelecionado && (
          <FadeSection className="max-w-[500px] mx-auto px-6 text-center mb-24 animate-out fade-out duration-500">
            <SectionDivider title="Verificação de Convidado" isVerification={true} />
            <p className="font-light text-[#888] mb-8 text-sm">Informe seu nome conforme o convite</p>
            <input 
              type="text" 
              placeholder="Nome do Convidado" 
              className="wedding-input mb-6 !text-[16px]"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarConvidado()}
            />
            <button 
              onClick={buscarConvidado}
              disabled={carregandoBusca}
              className={`w-full bg-wedding-charcoal text-white py-4 tracking-[0.2em] uppercase text-[12px] transition-opacity ${carregandoBusca ? 'opacity-50' : 'opacity-100'}`}
            >
              {carregandoBusca ? "Verificando..." : "Verificar Convite"}
            </button>
          </FadeSection>
        )}

        {/* Conteúdo adicional - Visível apenas após o convidado ser selecionado */}
        {convidadoSelecionado && (
          <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* Boas-vindas Personalizada (Segmento #02) */}
            <FadeSection className="text-center mb-24 px-6">
              <h2 className="font-halimun text-[32px] md:text-[48px] text-wedding-terracotta mb-6">
                Olá, {convidadoSelecionado.nome}!
              </h2>
              <p className="font-montserrat text-[14px] md:text-[18px] text-wedding-charcoal/70 leading-relaxed max-w-[600px] mx-auto">
                Nossa história também tem você, por isso queremos viver esse momento único ao seu lado.
              </p>
            </FadeSection>

            <FadeSection className="mb-24">
              <SectionDivider title="Galeria" />
              <Carrossel />
            </FadeSection>

            <FadeSection className="mb-24">
              <SectionDivider title="Localização" />
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
              <SectionDivider title="Presentes" />
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

            {/* Formulário de Confirmação */}
            <FadeSection className="max-w-[500px] mx-auto px-6 text-center mb-24">
              <SectionDivider title="Sua Confirmação" />
              {sucesso ? (
                <div className="p-8 bg-wedding-blush/10 text-wedding-charcoal">
                  <h3 className="font-cormorant text-2xl mb-4">Obrigado por confirmar, {convidadoSelecionado.nome}!</h3>
                  <p className="font-lato text-sm">Sua presença é muito importante para nós.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="font-lato text-sm text-[#888]">Olá, {convidadoSelecionado.nome}! Por favor, confirme sua presença e de seus acompanhantes.</p>

                  {/* Resposta Principal */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setResposta("Confirmado")}
                      className={`py-3 px-6 border ${resposta === "Confirmado" ? "bg-wedding-terracotta text-white border-wedding-terracotta" : "border-wedding-blush/50 text-wedding-charcoal"} transition-all`}
                    >
                      Confirmar Presença
                    </button>
                    <button
                      onClick={() => setResposta("Não Irá")}
                      className={`py-3 px-6 border ${resposta === "Não Irá" ? "bg-wedding-terracotta text-white border-wedding-terracotta" : "border-wedding-blush/50 text-wedding-charcoal"} transition-all`}
                    >
                      Não Poderei Ir
                    </button>
                  </div>

                  {resposta === "Confirmado" && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                      {/* Acompanhantes Adultos */}
                      {Array.from({ length: convidadoSelecionado.limite || 0 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Nome do Acompanhante ${index + 1}`}
                            className="wedding-input flex-grow !text-[16px]"
                            value={adultos[index]?.nome || ""}
                            onChange={(e) => {
                              const newAdultos = [...adultos];
                              newAdultos[index] = { nome: e.target.value };
                              setAdultos(newAdultos);
                            }}
                          />
                          <button
                            onClick={() => {
                              const newAdultos = adultos.filter((_, i) => i !== index);
                              setAdultos(newAdultos);
                            }}
                            className="text-red-500 text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setAdultos([...adultos, { nome: "" }])}
                        className="text-wedding-terracotta text-sm border-b border-wedding-terracotta/50"
                      >
                        + Adicionar Acompanhante
                      </button>

                      {/* Crianças */}
                      <h4 className="font-cormorant text-xl mt-8">Crianças (opcional)</h4>
                      {criancas.map((crianca, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nome da Criança"
                            className="wedding-input flex-grow !text-[16px]"
                            value={crianca.nome}
                            onChange={(e) => {
                              const newCriancas = [...criancas];
                              newCriancas[index] = { ...newCriancas[index], nome: e.target.value };
                              setCriancas(newCriancas);
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Idade"
                            className="wedding-input w-20 !text-[16px]"
                            value={crianca.idade}
                            onChange={(e) => {
                              const newCriancas = [...criancas];
                              newCriancas[index] = { ...newCriancas[index], idade: e.target.value };
                              setCriancas(newCriancas);
                            }}
                          />
                          <button
                            onClick={() => {
                              const newCriancas = criancas.filter((_, i) => i !== index);
                              setCriancas(newCriancas);
                            }}
                            className="text-red-500 text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                        className="text-wedding-terracotta text-sm border-b border-wedding-terracotta/50"
                      >
                        + Adicionar Criança
                      </button>

                      {/* Mensagem */}
                      <textarea
                        placeholder="Deixe uma mensagem para os noivos (opcional)"
                        rows={4}
                        className="wedding-input !text-[16px]"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                      ></textarea>

                      <button
                        onClick={handleSubmit}
                        className="w-full bg-wedding-charcoal text-white py-4 tracking-[0.2em] uppercase text-[12px]"
                      >
                        Finalizar Confirmação
                      </button>
                    </div>
                  )}
                </div>
              )}
            </FadeSection>
          </div>
        )}
      </main>
    </div>
  );
}
