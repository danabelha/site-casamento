/*
 * Design Philosophy: Minimalismo Japonês Contemporâneo (Wabi-Sabi + Editorial Japonês)
 * Página de Confirmação — Verificação de convidados, história, galeria, local, presentes e RSVP
 * Paleta: Cream (#FDFAF6), Blush (#D4A5A5), Terracotta (#C4876A), Charcoal (#2C2C2C), Gold (#C9A96E)
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
    <div className="text-center mb-8 md:mb-12">
      <p
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: "10px",
          letterSpacing: "0.4em",
          color: "#C9A96E",
          fontWeight: 400,
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {number}
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(24px, 5vw, 42px)",
          fontWeight: 300,
          color: "#2C2C2C",
          lineHeight: 1.2,
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: "40px",
          height: "1px",
          background: "#C9A96E",
          margin: "0 auto",
        }}
      />
    </div>
  );
}

function FadeSection({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
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
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ===== GALERIA PREMIUM CENTER MODE (3-UP) =====

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

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "24px", overflow: "hidden", paddingBottom: "20px" }}>
      {/* Container do Carrossel */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", perspective: "1000px", minHeight: "450px" }}>
        {/* Foto Esquerda */}
        <div style={{ flex: "0 0 clamp(80px, 15vw, 140px)", opacity: 0.6, cursor: "pointer", transition: "all 0.5s ease", transform: "scale(0.85)" }} onClick={() => handleImageClick((currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}>
          <img src={GALLERY_IMAGES[(currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length]} alt="Foto anterior" style={{ width: "100%", height: "auto", objectFit: "cover", display: "block", borderRadius: "2px" }} />
        </div>

        {/* Foto Central (Destaque) */}
        <div style={{ flex: "0 0 clamp(200px, 50vw, 380px)", zIndex: 10, transition: "all 0.5s ease" }}>
          <img src={GALLERY_IMAGES[currentIndex]} alt={`Foto ${currentIndex + 1}`} style={{ width: "100%", height: "auto", objectFit: "cover", display: "block", borderRadius: "2px", boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }} />
        </div>

        {/* Foto Direita */}
        <div style={{ flex: "0 0 clamp(80px, 15vw, 140px)", opacity: 0.6, cursor: "pointer", transition: "all 0.5s ease", transform: "scale(0.85)" }} onClick={() => handleImageClick((currentIndex + 1) % GALLERY_IMAGES.length)}>
          <img src={GALLERY_IMAGES[(currentIndex + 1) % GALLERY_IMAGES.length]} alt="Próxima foto" style={{ width: "100%", height: "auto", objectFit: "cover", display: "block", borderRadius: "2px" }} />
        </div>
      </div>

      {/* Setas de Navegação */}
      <button onClick={handlePrev} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "2px", cursor: "pointer", fontSize: "20px", transition: "all 0.3s ease", zIndex: 20 }} className="carousel-btn" title="Foto anterior">
        ‹
      </button>
      <button onClick={handleNext} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "2px", cursor: "pointer", fontSize: "20px", transition: "all 0.3s ease", zIndex: 20 }} className="carousel-btn" title="Próxima foto">
        ›
      </button>

      {/* Indicadores */}
      <div style={{ position: "absolute", bottom: "0px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 15 }}>
        {GALLERY_IMAGES.map((_, i) => (
          <div key={i} onClick={() => handleImageClick(i)} style={{ width: currentIndex === i ? "24px" : "8px", height: "8px", background: currentIndex === i ? "#C4876A" : "rgba(196,135,106,0.3)", borderRadius: "4px", cursor: "pointer", transition: "all 0.3s ease" }} title={`Foto ${i + 1}`} />
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
      if (resultado && resultado.length > 0) {
        setConvidadoSelecionado(resultado[0]);
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
    <div style={{ backgroundColor: "#FDFAF6", minHeight: "100vh" }}>
      {/* Header - Sticky e Responsivo */}
      <header
        style={{
          backgroundColor: "#FDFAF6",
          borderBottom: "1px solid #E8CECE",
          padding: "20px 16px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/">
          <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(24px, 4vw, 32px)", color: "#2C2C2C", cursor: "pointer", textDecoration: "none" }}>
            Mariana & Daniel
          </span>
        </Link>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "9px", letterSpacing: "0.3em", color: "#C9A96E", textTransform: "uppercase", marginTop: "4px" }}>
          05 · 12 · 2026
        </p>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* SEÇÃO 1: VERIFICAÇÃO */}
        {!convidadoSelecionado ? (
          <FadeSection 
            className="hero-section"
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center", 
              minHeight: "calc(100vh - 100px)", 
              textAlign: "center"
            }}
          >
            <div style={{ paddingBottom: "40px" }}>
              <SectionDivider number="01" title="Confirme sua Presença" />
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "14px", color: "#888", marginBottom: "32px", fontWeight: 300 }}>
                Digite seu nome completo para localizar seu convite.
              </p>
              <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                <input
                  type="text"
                  placeholder="Nome Completo..."
                  value={nomeBusca}
                  onChange={(e) => setNomeBusca(e.target.value)}
                  style={{ width: "100%", padding: "16px", backgroundColor: "transparent", border: "1px solid #E8CECE", fontFamily: "'Lato', sans-serif", fontSize: "14px", color: "#2C2C2C", outline: "none", textAlign: "center", marginBottom: "16px" }}
                />
                <button onClick={buscarConvidado} disabled={searchConvidados.isPending} className="wedding-btn" style={{ width: "100%" }}>
                  {searchConvidados.isPending ? "Buscando..." : "Verificar Convite"}
                </button>
              </div>
            </div>
          </FadeSection>
        ) : (
          <div style={{ paddingTop: "40px" }}>
            <FadeSection>
              <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <h2 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(32px, 6vw, 42px)", color: "#C4876A", marginBottom: "12px" }}>
                  Olá, {convidadoSelecionado.nome}!
                </h2>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "14px", color: "#888", fontWeight: 300 }}>Ficamos muito felizes em ter você conosco.</p>
                {convidadoSelecionado.limite > 0 && (
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#C9A96E", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Você pode convidar até {convidadoSelecionado.limite} acompanhante(s).
                  </p>
                )}
              </div>
            </FadeSection>

            {/* SEÇÃO 2: HISTÓRIA */}
            <FadeSection>
              <section style={{ marginBottom: "80px" }}>
                <SectionDivider number="02" title="Nossa História" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", alignItems: "center" }}>
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontStyle: "italic", color: "#C4876A", marginBottom: "16px", lineHeight: 1.5 }}>"Nos conhecemos por acaso, mas acreditamos que foi o destino."</p>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "14px", color: "#555", fontWeight: 300, lineHeight: 1.8 }}>Tudo começou em uma tarde comum que se tornou extraordinária. Um encontro inesperado, um sorriso tímido, e a certeza de que algo especial havia começado.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {[{ ano: "2020", evento: "Primeiro encontro" }, { ano: "2021", evento: "Primeira viagem juntos" }, { ano: "2023", evento: "Pedido de casamento" }, { ano: "2026", evento: "O grande dia" }].map((item) => (
                      <div key={item.ano} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "#C9A96E", fontWeight: 600, minWidth: "40px" }}>{item.ano}</span>
                        <div style={{ width: "1px", height: "16px", background: "#D4A5A5" }} />
                        <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "13px", color: "#555", fontWeight: 300 }}>{item.evento}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </FadeSection>

            {/* SEÇÃO 3: GALERIA COM CARROSSEL */}
            <FadeSection>
              <section style={{ marginBottom: "80px" }}>
                <SectionDivider number="03" title="Galeria de Fotos" />
                <Carrossel />
              </section>
            </FadeSection>

            {/* SEÇÃO 4: LOCALIZAÇÃO */}
            <FadeSection>
              <section style={{ marginBottom: "80px" }}>
                <SectionDivider number="04" title="Localização" />
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#2C2C2C", marginBottom: "4px" }}>Celeiro Quintal</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "13px", color: "#888", fontWeight: 300 }}>R. Cônego Eugênio Leite, 1098 — Pinheiros, São Paulo — SP</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "13px", color: "#C4876A", marginTop: "4px" }}>05 de Dezembro de 2026 · 19h00</p>
                </div>
                <div style={{ borderRadius: "2px", overflow: "hidden", border: "1px solid #E8CECE", marginBottom: "20px" }}>
                  <iframe width="100%" height="300" src="https://maps.google.com/maps?q=R.+C%C3%B4nego+Eug%C3%AAnio+Leite%2C+1098+-+Pinheiros%2C+S%C3%A3o+Paulo+-+SP&t=&z=15&ie=UTF8&iwloc=&output=embed" style={{ border: 0, display: "block" }} title="Localização" loading="lazy" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                  {[{ label: "Cerimônia", hora: "19h00" }, { label: "Recepção", hora: "20h00" }, { label: "Jantar", hora: "21h00" }, { label: "Festa", hora: "22h00" }].map((item) => (
                    <div key={item.label} style={{ textAlign: "center", padding: "16px", border: "1px solid #E8CECE" }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "#C4876A", marginBottom: "2px" }}>{item.hora}</p>
                      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            </FadeSection>

            {/* SEÇÃO 5: PRESENTES */}
            <FadeSection>
              <section style={{ marginBottom: "80px" }}>
                <SectionDivider number="05" title="Lista de Presentes" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                  {PRESENTES.map((presente, i) => (
                    <div key={i} style={{ border: "1px solid #E8CECE", padding: "28px 24px", textAlign: "center", backgroundColor: "#FDFAF6", transition: "all 0.3s ease" }} className="presente-card">
                      <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>{presente.emoji}</span>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#2C2C2C", marginBottom: "8px" }}>{presente.nome}</h3>
                      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#888", marginBottom: "12px", lineHeight: 1.6 }}>{presente.descricao}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "#C4876A", marginBottom: "16px" }}>{presente.valor}</p>
                      <button className="wedding-btn" onClick={() => togglePix(i)} style={{ fontSize: "10px", padding: "10px 24px" }}>{pixVisivel[i] ? "Ocultar PIX" : "Presentear"}</button>
                      {pixVisivel[i] && (
                        <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#F5E8E8", border: "1px solid #D4A5A5", borderRadius: "2px" }}>
                          <div style={{ backgroundColor: "#FFF3CD", border: "1px solid #FFE69C", padding: "10px 12px", marginBottom: "12px", textAlign: "left" }}>
                            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "10px", color: "#856404", margin: 0, lineHeight: 1.4 }}>
                              ⚠️ <strong>Segurança:</strong> Antes de realizar a transferência, confirme o nome do destinatário.
                            </p>
                          </div>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", color: "#888", marginBottom: "4px", textTransform: "uppercase" }}>CHAVE PIX</p>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "13px", color: "#2C2C2C", wordBreak: "break-all", backgroundColor: "#FDFAF6", padding: "8px", border: "1px solid #E8CECE" }}>{presente.pix}</p>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "10px", color: "#888", marginTop: "8px", fontStyle: "italic" }}>Destinatário: <strong>Daniel & Mariana</strong></p>
                          <button onClick={() => navigator.clipboard.writeText(presente.pix)} style={{ marginTop: "8px", fontFamily: "'Lato', sans-serif", fontSize: "10px", color: "#C4876A", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>Copiar chave</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </FadeSection>

            {/* SEÇÃO 6: RSVP */}
            <FadeSection>
              <section style={{ marginBottom: "60px" }}>
                <SectionDivider number="06" title="Confirmação de Presença" />
                {sucesso ? (
                  <div style={{ textAlign: "center", padding: "40px 16px" }}>
                    <p style={{ fontSize: "48px", marginBottom: "16px" }}>💌</p>
                    <h3 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "38px", color: "#C4876A", marginBottom: "16px" }}>Obrigado!</h3>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "14px", color: "#555", fontWeight: 300, lineHeight: 1.7 }}>Sua resposta foi registrada com sucesso.<br />Estamos ansiosos para celebrar com você!</p>
                    {resposta === "Confirmado" && (
                      <div style={{ marginTop: "32px", padding: "32px", backgroundColor: "#F5EEEB", border: "1px solid #E8CECE", animation: "fadeIn 0.8s ease", textAlign: "center" }}>
                        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#2C2C2C", marginBottom: "4px" }}>Manual do Convidado</h4>
                        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#C9A96E", marginBottom: "24px", fontStyle: "italic", letterSpacing: "0.05em" }}>Consciente</p>
                        <img src="https://i.pinimg.com/736x/e5/00/3f/e5003ff83e060a19dc7d81ad98f52fa7.jpg" alt="Manual do Convidado" style={{ width: "100%", maxWidth: "500px", height: "auto", objectFit: "contain", display: "block", margin: "0 auto", borderRadius: "2px" }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "13px", color: "#555", marginBottom: "20px", textAlign: "center" }}>Você irá comparecer?</p>
                    
                    {/* BALÃO DE LEMBRETE */}
                    {mostrarLembrete && (
                      <div style={{ backgroundColor: "#C4876A", color: "white", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", textAlign: "center", marginBottom: "16px", position: "relative", animation: "bounceIn 0.5s ease" }}>
                        ✨ Não esqueça de informar seus acompanhantes abaixo!
                        <div style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #C4876A" }} />
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                      {[{ v: "Confirmado", l: "Confirmo minha presença" }, { v: "Talvez", l: "Ainda não tenho certeza" }, { v: "Não Irá", l: "Não poderei comparecer" }].map((o) => (
                        <label key={o.v} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", border: `1px solid ${resposta === o.v ? "#C4876A" : "#E8CECE"}`, cursor: "pointer", backgroundColor: resposta === o.v ? "#FFF4F0" : "#FDFAF6", transition: "all 0.3s ease" }}>
                          <input type="radio" name="r" checked={resposta === o.v} onChange={() => handleRespostaChange(o.v)} style={{ accentColor: "#C4876A" }} />
                          <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "13px", color: "#2C2C2C" }}>{o.l}</span>
                        </label>
                      ))}
                    </div>

                    {resposta === "Confirmado" && (
                      <div style={{ animation: "fadeIn 0.5s ease" }}>
                        {/* ADULTOS */}
                        {convidadoSelecionado.limite > 0 && (
                          <div style={{ marginBottom: "24px" }}>
                            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#C9A96E", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Adultos Acompanhantes</p>
                            {adultos.map((a, i) => (
                              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input placeholder="Nome do adulto" value={a.nome} onChange={(e) => { const n = [...adultos]; n[i].nome = e.target.value; setAdultos(n); }} style={{ flex: 1, padding: "14px", border: "1px solid #E8CECE", fontSize: "13px", backgroundColor: "transparent", outline: "none" }} />
                                <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} style={{ color: "#D4A5A5", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
                              </div>
                            ))}
                            {podeAdicionarAcompanhante && (
                              <button onClick={() => setAdultos([...adultos, { nome: "" }])} className="wedding-add-btn">+ Adicionar Adulto</button>
                            )}
                          </div>
                        )}
                        {/* CRIANÇAS */}
                        {convidadoSelecionado.limite > 0 && (
                          <div style={{ marginBottom: "24px" }}>
                            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#C9A96E", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Crianças</p>
                            {criancas.map((c, i) => (
                              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input placeholder="Nome" value={c.nome} onChange={(e) => { const n = [...criancas]; n[i].nome = e.target.value; setCriancas(n); }} style={{ flex: 2, padding: "14px", border: "1px solid #E8CECE", fontSize: "13px", backgroundColor: "transparent", outline: "none" }} />
                                <input placeholder="Idade" value={c.idade} onChange={(e) => { const n = [...criancas]; n[i].idade = e.target.value; setCriancas(n); }} style={{ flex: 1, padding: "14px", border: "1px solid #E8CECE", fontSize: "13px", backgroundColor: "transparent", outline: "none" }} />
                                <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} style={{ color: "#D4A5A5", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
                              </div>
                            ))}
                            {podeAdicionarAcompanhante && (
                              <button onClick={() => setCriancas([...criancas, { nome: "", idade: "" }])} className="wedding-add-btn">+ Adicionar Criança</button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {(resposta === "Confirmado" || resposta === "Não Irá") && (
                      <div style={{ marginBottom: "32px", animation: "fadeIn 0.5s ease" }}>
                        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "#C9A96E", marginBottom: "12px", textTransform: "uppercase" }}>Mensagem para os noivos</p>
                        <textarea placeholder="Deixe uma mensagem carinhosa..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} style={{ width: "100%", padding: "16px", border: "1px solid #E8CECE", minHeight: "100px", backgroundColor: "transparent", outline: "none", resize: "none", fontFamily: "'Lato', sans-serif", fontSize: "13px" }} />
                      </div>
                    )}

                    {resposta && (
                      <button onClick={handleSubmit} disabled={confirmarPresenca.isPending} className="wedding-btn submit-btn" style={{ width: "100%", padding: "20px" }}>
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

      <footer style={{ textAlign: "center", padding: "40px 20px", borderTop: "1px solid #E8CECE" }}>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "10px", color: "#888", letterSpacing: "0.2em", textTransform: "uppercase" }}>Feito com amor para Daniel & Mariana</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap');
        
        .wedding-btn { background-color: #2C2C2C; color: #FDFAF6; border: none; padding: 14px 32px; font-family: 'Lato', sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; }
        .wedding-btn:hover { background-color: #C4876A; transform: translateY(-2px); }
        .wedding-btn:disabled { background-color: #ccc; cursor: not-allowed; transform: none; }

        .wedding-add-btn { width: 100%; font-family: 'Lato', sans-serif; font-size: 11px; color: #C4876A; background: none; border: 1px dashed #C4876A; padding: 12px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s ease; margin-top: 4px; }
        .wedding-add-btn:hover { background-color: #FFF4F0; }

        .carousel-btn:hover { background: rgba(0,0,0,0.7) !important; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }

        @media (max-width: 768px) {
          header { padding: 16px; }
          .wedding-btn { padding: 18px 24px !important; font-size: 13px !important; }
          h1 { font-size: 30px !important; }
          h2 { font-size: 34px !important; }
          p, span, label { font-size: 16px !important; }
          input, textarea { font-size: 16px !important; padding: 16px !important; }
          section { margin-bottom: 60px !important; }
          .presente-card { padding: 20px 16px !important; }
          .hero-section { min-height: calc(100vh - 80px) !important; }
          .submit-btn { font-size: 14px !important; padding: 22px !important; }
        }

        @media (max-width: 640px) {
          .carousel-container { gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}
