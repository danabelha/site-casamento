/*
 * Página de Confirmação — Otimizada para Mobile First com Tailwind 4
 */

import { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";

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
  { nome: "Lua de Mel", descricao: "Contribua para nossa viagem dos sonhos", valor: "Qualquer valor", pix: "casamento@danielemariana.com", emoji: "✈️" },
  { nome: "Jantar Romântico", descricao: "Um jantar especial para celebrarmos juntos", valor: "R$ 350", pix: "casamento@danielemariana.com", emoji: "🍷" },
  { nome: "Kit Cozinha", descricao: "Utensílios para nossa nova casa", valor: "R$ 280", pix: "casamento@danielemariana.com", emoji: "🏠" },
  { nome: "Noite em Hotel", descricao: "Uma noite especial em nosso destino", valor: "R$ 500", pix: "casamento@danielemariana.com", emoji: "🌙" },
  { nome: "Sessão de Fotos", descricao: "Memórias eternas do nosso amor", valor: "R$ 600", pix: "casamento@danielemariana.com", emoji: "📸" },
  { nome: "Contribuição Livre", descricao: "Qualquer valor é bem-vindo com amor", pix: "casamento@danielemariana.com", emoji: "💝" },
];

const ENDERECO_CURTO = "R. Cônego Eugênio Leite, 1098 - Pinheiros, São Paulo - SP";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Celeiro Quintal " + ENDERECO_CURTO)}`;

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
      <main className="max-w-6xl mx-auto pt-20 pb-20">
        {/* Cabeçalho (Nomes do Casal) - Sempre visível */}
        <FadeSection className="px-6 text-center mb-20">
          <p className="font-lato text-[10px] tracking-[0.6em] text-wedding-gold uppercase mb-6">05 de Dezembro de 2026</p>
          <h1 className="font-halimun text-[42px] md:text-[60px] text-wedding-terracotta leading-tight">Mariana & Daniel</h1>
        </FadeSection>

        {/* Seção de Busca de Convidado - Oculta após verificação */}
        {!convidadoSelecionado && (
          <FadeSection className="max-w-[500px] mx-auto px-6 text-center mb-24">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* Boas-vindas Personalizada */}
            <FadeSection className="text-center mb-24 md:mb-32 px-6">
              <h2 className="font-halimun text-[32px] md:text-[48px] text-wedding-terracotta mb-6">
                Olá, {convidadoSelecionado.nome}!
              </h2>
              <p className="font-montserrat text-[14px] md:text-[18px] text-wedding-charcoal/70 leading-relaxed max-w-[600px] mx-auto">
                Nossa história também tem você, por isso queremos viver esse momento único ao seu lado.
              </p>
            </FadeSection>

            {/* Sticky Stacking Gallery Section */}
            <section className="relative px-4 sm:px-6 mb-16 md:mb-32">
              <SectionDivider title="Nossa História" />
              <div className="relative max-w-5xl mx-auto">
                {GALLERY_ITEMS.map((item, index) => (
                  <div 
                    key={index} 
                    className="sticky top-0 min-h-[80vh] md:min-h-screen flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 py-10 md:py-20"
                  >
                    <div className="flex-1 text-center md:text-left order-2 md:order-1 max-w-[400px] z-30 bg-wedding-cream p-6 md:p-4 rounded-sm">
                      <h3 className="font-cormorant text-[24px] md:text-[36px] text-wedding-terracotta mb-4 md:mb-6">
                        {item.titulo}
                      </h3>
                      <p className="font-montserrat text-[13px] md:text-[16px] text-wedding-charcoal/65 leading-relaxed">
                        {item.texto}
                      </p>
                    </div>

                    <div className="flex-1 flex justify-center order-1 md:order-2 z-10">
                      <div 
                        className="bg-white p-1.5 pb-6 md:p-3 md:pb-12 shadow-xl md:shadow-2xl transform transition-transform duration-500"
                        style={{ 
                          transform: `rotate(${index % 2 === 0 ? '-2' : '2'}deg)`,
                        }}
                      >
                        <div className="relative w-[240px] h-[300px] sm:w-[320px] sm:h-[400px] overflow-hidden">
                          <img 
                            src={item.url} 
                            alt={item.titulo} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Localização */}
            <FadeSection className="mb-24 md:mb-32 px-6">
              <SectionDivider title="Localização" />
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                <div className="text-center md:text-right space-y-4">
                  <h3 className="font-cormorant text-[28px] text-wedding-terracotta">Celeiro Quintal</h3>
                  <p className="text-[14px] font-light text-wedding-charcoal/70 leading-relaxed">
                    R. Cônego Eugênio Leite, 1098<br />
                    Pinheiros, São Paulo - SP
                  </p>
                  <a 
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-b border-wedding-gold text-wedding-gold py-1 text-[10px] uppercase tracking-[0.2em] hover:text-wedding-terracotta hover:border-wedding-terracotta transition-all"
                  >
                    Ver no Mapa
                  </a>
                </div>
                <div className="h-[300px] bg-gray-100 rounded-sm shadow-lg overflow-hidden">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent("Celeiro Quintal " + ENDERECO_CURTO)}&z=17&output=embed`} 
                  />
                </div>
              </div>
            </FadeSection>

            {/* Presentes - CARROSSEL MOBILE E AVISO PIX CONTEXTUAL */}
            <FadeSection className="mb-24 md:mb-32">
              <SectionDivider title="Presentes" />
              
              {/* Carrossel Mobile / Grade Desktop */}
              <div className="relative px-4 md:px-6">
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 scrollbar-hide snap-x snap-mandatory max-w-5xl mx-auto">
                  {PRESENTES.map((p, i) => (
                    <div 
                      key={i} 
                      className="min-w-[280px] md:min-w-0 snap-center p-8 border border-wedding-blush/20 bg-white/50 hover:bg-white transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-3xl">{p.emoji}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-wedding-gold font-bold">{p.valor}</span>
                        </div>
                        <h4 className="font-cormorant text-xl text-wedding-charcoal mb-2">{p.nome}</h4>
                        <p className="text-[12px] text-[#888] leading-relaxed mb-6">{p.descricao}</p>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => setPixVisivel({ ...pixVisivel, [i]: !pixVisivel[i] })}
                          className="text-[10px] uppercase tracking-[0.2em] text-wedding-terracotta border-b border-wedding-terracotta/30 pb-1 hover:border-wedding-terracotta transition-all"
                        >
                          {pixVisivel[i] ? "Ocultar Chave" : "Presentear via PIX"}
                        </button>
                        
                        {pixVisivel[i] && (
                          <div className="mt-4 p-4 bg-wedding-terracotta/5 border border-wedding-terracotta/10 text-[11px] animate-in fade-in zoom-in duration-300 rounded-sm">
                            <div className="flex items-start gap-2 mb-3 text-wedding-terracotta/80">
                              <span className="text-xs">⚠️</span>
                              <p className="font-montserrat leading-tight">
                                Confirme o destinatário:<br/>
                                <strong>Daniel e Mariana</strong>
                              </p>
                            </div>
                            <p className="text-[#888] uppercase mb-1 tracking-widest text-[9px]">Chave PIX</p>
                            <p className="font-mono break-all bg-white p-2 border border-wedding-blush/30">{p.pix}</p>
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
                {/* Indicador de scroll apenas no mobile */}
                <div className="flex justify-center gap-1 mt-4 md:hidden">
                  {PRESENTES.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-wedding-gold/30" />
                  ))}
                </div>
              </div>
            </FadeSection>

            {/* Formulário de Confirmação */}
            <FadeSection className="max-w-[500px] mx-auto px-6 text-center mb-32">
              <SectionDivider title="Sua Confirmação" />
              {sucesso ? (
                <div className="p-12 bg-wedding-blush/10 border border-wedding-blush/30 text-wedding-charcoal">
                  <h3 className="font-halimun text-3xl mb-4 text-wedding-terracotta">Obrigado!</h3>
                  <p className="font-montserrat text-sm text-wedding-charcoal/70">Sua presença é o nosso maior presente.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="font-montserrat text-sm text-[#888]">Olá, {convidadoSelecionado.nome}! Por favor, confirme sua presença e de seus acompanhantes.</p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setResposta("Confirmado")}
                      className={`py-4 px-8 border text-[12px] tracking-widest uppercase transition-all ${resposta === "Confirmado" ? "bg-wedding-terracotta text-white border-wedding-terracotta shadow-lg" : "border-wedding-blush/50 text-wedding-charcoal hover:border-wedding-terracotta"}`}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setResposta("Não Irá")}
                      className={`py-4 px-8 border text-[12px] tracking-widest uppercase transition-all ${resposta === "Não Irá" ? "bg-wedding-terracotta text-white border-wedding-terracotta shadow-lg" : "border-wedding-blush/50 text-wedding-charcoal hover:border-wedding-terracotta"}`}
                    >
                      Não Irá
                    </button>
                  </div>

                  {resposta === "Confirmado" && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
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
                        </div>
                      ))}

                      {/* Crianças */}
                      <h4 className="font-cormorant text-2xl mt-12 text-wedding-terracotta">Crianças</h4>
                      {criancas.map((crianca, index) => (
                        <div key={index} className="flex items-center gap-2 animate-in slide-in-from-left duration-300">
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
                            className="text-red-400 text-[10px] uppercase tracking-tighter"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                        className="text-wedding-gold text-[10px] uppercase tracking-[0.2em] border-b border-wedding-gold/30 pb-1"
                      >
                        + Adicionar Criança
                      </button>

                      <textarea
                        placeholder="Deixe uma mensagem para os noivos (opcional)"
                        rows={4}
                        className="wedding-input !text-[16px] mt-8"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                      ></textarea>

                      <button
                        onClick={handleSubmit}
                        className="w-full bg-wedding-charcoal text-white py-5 tracking-[0.4em] uppercase text-[12px] shadow-xl hover:bg-wedding-terracotta transition-all"
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
