/*
 * Design Philosophy: Minimalismo Japonês Contemporâneo (Wabi-Sabi + Editorial Japonês)
 * Página inicial — Hero fullscreen com contador regressivo e botão de confirmação
 * Paleta: Cream (#FDFAF6), Blush (#D4A5A5), Terracotta (#C4876A), Charcoal (#2C2C2C), Gold (#C9A96E)
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";

const HERO_IMAGE = "https://i.pinimg.com/736x/e5/23/2a/e5232aef9f2e9267bb121ea3bb7fc768.jpg";

interface TimeLeft {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function calcularTempoRestante(): TimeLeft {
  const dataCasamento = new Date("Dec 5, 2026 19:00:00").getTime();
  const agora = new Date().getTime();
  const distancia = dataCasamento - agora;

  if (distancia < 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  return {
    dias: Math.floor(distancia / (1000 * 60 * 60 * 24)),
    horas: Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((distancia % (1000 * 60)) / 1000),
  };
}

export default function Home() {
  const [tempoRestante, setTempoRestante] = useState<TimeLeft>(calcularTempoRestante());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTempoRestante(calcularTempoRestante());
    }, 1000);

    setTimeout(() => setLoaded(true), 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
  className="relative min-h-screen flex items-center justify-center overflow-hidden"
  style={{
    backgroundColor: "#2C2C2C",
    maxWidth: "2000px",
    margin: "0 auto",
  }}
>
      {/* Background Image */}
      <div
  className="absolute inset-0"
  style={{
    backgroundImage: `url(${HERO_IMAGE})`,
    backgroundSize: "cover",
    backgroundPosition: "center 45%",
    backgroundRepeat: "no-repeat",
    filter: "brightness(0.55)",
  }}
/>

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
        }}
      >
        {/* Pre-title */}
        <p
          className="mb-6"
          style={{
            fontFamily: "'Montserrat', serif",
            fontSize: "33px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#C9A96E",
            fontWeight: 400,
            marginBottom: "32px",
          }}
        >
          E enfim, o nosso casamento
        </p>

        {/* Couple Name */}
        <h1
          style={{
            fontFamily: "'Halimun', cursive",
            fontSize: "clamp(48px, 12vw, 110px)",
            letterSpacing: "1px",
            fontWeight: "normal",
            color: "#FDFAF6",
            lineHeight: 1.1,
            marginBottom: "32px",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          Mariana & Daniel
        </h1>

        {/* Date */}
        <p
          style={{
            fontFamily: "'Montserrat', serif",
            fontSize: "clamp(20px, 3vw, 3px)",
            color: "rgba(253, 250, 246, 0.85)",
            letterSpacing: "0.25em",
            marginBottom: "28px",
            fontWeight: 400,
          }}
        >
          05 de Dezembro de 2026 &nbsp;·&nbsp; São Paulo
        </p>

        {/* Countdown */}
        <div
          className="inline-flex gap-0 mb-12"
          style={{
            borderTop: "3px solid rgba(201, 169, 110, 0.4)",
            borderBottom: "3px solid rgba(201, 169, 110, 0.4)",
            padding: "14px 0",
          }}
        >
          {[
            { valor: tempoRestante.dias, label: "Dias" },
            { valor: tempoRestante.horas, label: "Horas" },
            { valor: tempoRestante.minutos, label: "Min" },
            { valor: tempoRestante.segundos, label: "Seg" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex flex-col items-center"
              style={{
                padding: "0 24px",
                borderRight: i < 3 ? "3px solid rgba(201, 169, 110, 0.3)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', serif",
                  fontSize: "clamp(33px, 5vw, 48px)",
                  color: "#FDFAF6",
                  fontWeight: 300,
                  lineHeight: 1,
                  minWidth: "50px",
                  display: "block",
                  textAlign: "center",
                }}
              >
                {String(item.valor).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: "'Montserrat', serif",
                  fontSize: "28px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C9A96E",
                  marginTop: "6px",
                  fontWeight: 400,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div>
          <Link href="/confirmacao">
            <span
              style={{
                display: "inline-block",
                border: "1px solid rgba(253, 250, 246, 0.7)",
                color: "#FDFAF6",
                padding: "18px 48px",
                fontFamily: "'Montserrat', serif",
                fontSize: "14px",
                fontWeight: 400,
                letterSpacing: "0.9em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.4s ease",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                background: "rgba(253, 250, 246, 0.08)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "rgba(253, 250, 246, 0.2)";
                (e.target as HTMLElement).style.borderColor = "#FDFAF6";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "rgba(253, 250, 246, 0.08)";
                (e.target as HTMLElement).style.borderColor = "rgba(253, 250, 246, 0.7)";
              }}
            >
              Confirmar Presença
            </span>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ animation: "bounce 2s infinite" }}
        >
          <div
            style={{
              width: "5px",
              height: "40px",
              background: "linear-gradient(to bottom, rgba(201,169,110,0.8), transparent)",
              margin: "0 auto",
            }}
          />
        </div>
      </div>

      {/* Link discreto para painel admin */}
      <Link href="/admin">
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            fontSize: "10px",
            color: "rgba(201, 169, 110, 0.4)",
            cursor: "pointer",
            fontFamily: "'Montserrat', serif",
            letterSpacing: "0.1em",
            textDecoration: "none",
            transition: "color 0.3s ease",
            zIndex: 50,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(201, 169, 110, 0.8)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(201, 169, 110, 0.4)";
          }}
        >
          admin
        </div>
      </Link>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          50% { transform: translateX(-50%) translateY(8px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
