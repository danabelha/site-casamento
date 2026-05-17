/*
 * Página de Confirmação — Otimizada para Mobile First com Tailwind 4
 */

import React, { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";

// Importar imagens
import manualImg from "../assets/images/manual.png";

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
      <h2 className={`font-cormorant font-light text-[#462F29] leading-tight mb-4 whitespace-nowrap
        ${isVerification ? 'text-[22px] sm:text-[28px] md:text-[42px]' : 'text-[28px] md:text-[42px]'}`}>
        {title}
      </h2>
      {!isVerification && <div className="w-10 h-[1px] bg-wedding-gold mx-auto" />}
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

  const searchConvidadosMutation = trpc.searchConvidados.useMutation();
  const confirmarPresencaMutation = trpc.confirmarPresenca.useMutation();

  const buscarConvidado = async () => {
    if (!nomeBusca.trim() || carregandoBusca) return;
    try {
      setCarregandoBusca(true);
      const resultado = await searchConvidadosMutation.mutateAsync({ nome: nomeBusca });
      if (resultado) {
        setConvidadoSelecionado(resultado);
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

      await confirmarPresencaMutation.mutateAsync({
        id: convidadoSelecionado.id,
        status: resposta,
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
    <div className="min-h-screen bg-wedding-cream text-wedding-charcoal relative overflow-hidden">
      {/* Efeito de Envelope no Topo */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#462F29]/5 to-transparent z-20 pointer-events-none" />

      <main className="max-w-6xl mx-auto pt-20 pb-20 relative z-10">
        {/* Cabeçalho (Nomes do Casal) */}
        <FadeSection className="px-6 text-center mb-20">
          <p className="font-lato text-[10px] tracking-[0.6em] text-wedding-gold uppercase mb-6">05 de Dezembro de 2026</p>
          <h1 className="font-halimun text-[42px] md:text-[60px] text-[#462F29] leading-tight">Mariana & Daniel</h1>
        </FadeSection>

        {/* Divisor Minimalista */}
        <div className="text-center my-10 md:my-16">
          <div className="w-16 h-[1px] bg-wedding-gold mx-auto" />
        </div>

        {!convidadoSelecionado && (
          <FadeSection className="max-w-[500px] mx-auto px-6 text-center mb-24">
            <SectionDivider title="Verificação de Convidado" isVerification={true} />
            <p className="font-light text-[#888] mb-8 text-sm">Informe seu Nome e Sobrenome</p>
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
              className={`w-full bg-[#462F29] text-white py-4 tracking-[0.2em] uppercase text-[12px] transition-opacity ${carregandoBusca ? 'opacity-50' : 'opacity-100'}`}
            >
              {carregandoBusca ? "Verificando..." : "Verificar Convite"}
            </button>
          </FadeSection>
        )}

        {convidadoSelecionado && (
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
                    <div className="flex-1 text-center md:text-left order-2 md:order-1 max-w-[400px] z-30 bg-[#462F29] p-8 md:p-10 rounded-sm shadow-xl">
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
            <FadeSection className="mb-24 md:mb-32 px-6">
              <SectionDivider title="Localização" />
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                <div className="text-center md:text-left">
                  <h3 className="font-cormorant text-[28px] text-[#462F29] mb-4">Celeiro Quintal</h3>
                  <p className="font-montserrat text-[14px] md:text-[16px] text-wedding-charcoal/70 leading-relaxed mb-2">
                    05 de Dezembro de 2026
                  </p>
                  <p className="font-montserrat text-[14px] md:text-[16px] text-wedding-charcoal/70 leading-relaxed mb-2">
                    Início: 18:00h
                  </p>
                  <p className="font-montserrat text-[14px] md:text-[16px] text-wedding-charcoal/70 leading-relaxed mb-6">
                    {ENDERECO_CURTO}
                  </p>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#462F29] text-white px-8 py-4 font-montserrat text-[12px] uppercase tracking-[0.2em] transition-colors hover:bg-[#462F29]/90">
                    Ver no Mapa
                  </a>
                </div>

                <div className="w-full h-[300px] md:h-[400px] overflow-hidden shadow-lg rounded-sm">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent("Celeiro Quintal " + ENDERECO_CURTO)}`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>
            </FadeSection>

            {/* Presentes */}
            <FadeSection className="mb-24 md:mb-32">
              <SectionDivider title="Presentes" />
              <div className="relative px-4 md:px-6">
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 scrollbar-hide snap-x snap-mandatory max-w-5xl mx-auto">
                  {PRESENTES.map((p, i) => (
                    <div key={i} className="min-w-[280px] md:min-w-0 snap-center p-8 border border-wedding-blush/20 bg-white/50 hover:bg-white transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-3xl">{p.emoji}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-wedding-gold font-bold">{p.valor}</span>
                        </div>
                        <h4 className="font-cormorant text-xl text-wedding-charcoal mb-2">{p.nome}</h4>
                        <p className="text-[12px] text-[#888] leading-relaxed mb-6">{p.descricao}</p>
                      </div>
                      <div>
                        <button onClick={() => setPixVisivel({ ...pixVisivel, [i]: !pixVisivel[i] })} className="text-[10px] uppercase tracking-[0.2em] text-[#462F29] border-b border-[#462F29]/30 pb-1 hover:border-[#462F29] transition-all">
                          {pixVisivel[i] ? "Ocultar Chave" : "Presentear via PIX"}
                        </button>
                        {pixVisivel[i] && (
                          <div className="mt-4 p-4 bg-wedding-cream border border-wedding-gold/20 text-[11px] animate-in fade-in zoom-in duration-300 rounded-sm">
                            <div className="flex items-start gap-2 mb-3 text-[#462F29]">
                              <span className="text-xs">⚠️</span>
                              <p className="font-montserrat leading-tight font-bold">Confirme o destinatário:<br/>Daniel e Mariana</p>
                            </div>
                            <p className="text-[#888] uppercase mb-1 tracking-widest text-[9px]">Chave PIX</p>
                            <p className="font-mono break-all bg-white p-2 border border-wedding-blush/30">{p.pix}</p>
                            <button onClick={() => copiarPix(i, p.pix)} className={`mt-3 w-full py-2 uppercase tracking-widest transition-all text-[9px] border border-wedding-gold/20 ${pixCopiado === i ? 'bg-green-50 text-green-600 border-green-200 font-bold' : 'bg-white text-[#462F29] hover:bg-[#462F29] hover:text-white'}`}>
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
            <FadeSection className="max-w-[600px] mx-auto px-6 text-center mb-32">
              <SectionDivider title="Confirmação de Presença" />
              
              {sucesso ? (
                <div className="space-y-12">
                  <div className="p-12 bg-white border border-wedding-blush/30 text-wedding-charcoal shadow-sm">
                    <h3 className="font-halimun text-3xl mb-4 text-[#462F29]">Obrigado!</h3>
                    <p className="font-montserrat text-sm text-wedding-charcoal/70">Sua resposta foi enviada com carinho.</p>
                  </div>
                  
                  {/* Manual do Convidado */}
                  <FadeSection className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="w-10 h-[1px] bg-wedding-gold mx-auto mb-8" />
                    <h4 className="font-cormorant text-3xl text-[#462F29]">Manual do Convidado</h4>
                    <div className="max-w-[500px] mx-auto overflow-hidden">
                      <img 
                        src={manualImg} 
                        alt="Manual do Convidado" 
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="font-montserrat text-[10px] text-wedding-charcoal/50 uppercase tracking-widest">
                      Tire um print para não esquecer os detalhes!
                    </p>
                  </FadeSection>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-2">
                    <p className="font-cormorant text-xl text-wedding-charcoal">
                      {convidadoSelecionado.nome}, por favor, confirme sua presença.
                    </p>
                    {convidadoSelecionado.limite > 0 && (
                      <p className="font-montserrat text-[12px] text-wedding-gold uppercase tracking-widest">
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
                        className={`p-4 border text-[11px] uppercase tracking-widest transition-all h-full flex items-center justify-center text-center
                          ${resposta === opt.id 
                            ? "bg-[#462F29] text-white border-[#462F29] shadow-md" 
                            : "bg-white text-wedding-charcoal border-wedding-blush/30 hover:border-wedding-gold"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Seção de Acompanhantes */}
                  {resposta === "Confirmado" && convidadoSelecionado.limite > 0 && (
                    <div className="space-y-6 pt-6 border-t border-wedding-blush/20 animate-in fade-in slide-in-from-top-4">
                      <h4 className="font-cormorant text-2xl text-[#462F29]">Seus Acompanhantes</h4>
                      
                      <div className="space-y-4">
                        {adultos.map((a, i) => (
                          <div key={`a-${i}`} className="flex gap-2 items-center bg-white p-2 border border-wedding-blush/10">
                            <input
                              type="text"
                              placeholder="Nome e Sobrenome (Adulto)"
                              className="wedding-input flex-grow !border-none !p-2 !text-[14px]"
                              value={a.nome}
                              onChange={(e) => {
                                const n = [...adultos];
                                n[i].nome = e.target.value;
                                setAdultos(n);
                              }}
                            />
                            <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-red-300 text-[10px] px-2">Remover</button>
                          </div>
                        ))}
                        {criancas.map((c, i) => (
                          <div key={`c-${i}`} className="flex gap-2 items-center bg-white p-2 border border-wedding-blush/10">
                            <input
                              type="text"
                              placeholder="Nome e Sobrenome (Criança)"
                              className="wedding-input flex-grow !border-none !p-2 !text-[14px]"
                              value={c.nome}
                              onChange={(e) => {
                                const n = [...criancas];
                                n[i].nome = e.target.value;
                                setCriancas(n);
                              }}
                            />
                            <input
                              type="number"
                              placeholder="Idade"
                              className="wedding-input w-16 !border-none !p-2 !text-[14px]"
                              value={c.idade}
                              onChange={(e) => {
                                const n = [...criancas];
                                n[i].idade = e.target.value;
                                setCriancas(n);
                              }}
                            />
                            <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="text-red-300 text-[10px] px-2">Remover</button>
                          </div>
                        ))}
                      </div>

                      {!limiteAtingido && (
                        <div className="flex justify-center gap-4">
                          <button 
                            onClick={() => setAdultos([...adultos, { nome: "" }])}
                            className="text-[10px] uppercase tracking-widest text-wedding-gold border-b border-wedding-gold/30 pb-1"
                          >
                            + Adulto
                          </button>
                          <button 
                            onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])}
                            className="text-[10px] uppercase tracking-widest text-wedding-gold border-b border-wedding-gold/30 pb-1"
                          >
                            + Criança
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mensagem e Botão Final */}
                  {resposta && (
                    <div className="space-y-6 pt-6 border-t border-wedding-blush/20 animate-in fade-in duration-500">
                      {(resposta === "Confirmado" || resposta === "Não Irá") && (
                        <textarea
                          placeholder="Deixe uma mensagem carinhosa para os noivos..."
                          rows={4}
                          className="wedding-input !text-[16px]"
                          value={mensagem}
                          onChange={(e) => setMensagem(e.target.value)}
                        />
                      )}
                      
                      <button
                        onClick={handleSubmit}
                        disabled={confirmarPresencaMutation.isPending}
                        className="w-full bg-[#462F29] text-white py-5 tracking-[0.4em] uppercase text-[12px] shadow-xl hover:bg-[#462F29]/90 transition-all disabled:opacity-50"
                      >
                        {confirmarPresencaMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </FadeSection>
          </div>
        )}

        {/* Efeito de Envelope no Rodapé */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#462F29]/5 to-transparent z-20 pointer-events-none" />
      </main>
    </div>
  );
}
