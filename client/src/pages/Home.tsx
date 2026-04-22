import { useEffect, useState } from "react";
import { Link } from "wouter";
import heroImage from "../assets/images/home.webp";

<div
  className="absolute inset-0 bg-cover bg-no-repeat brightness-[0.55]"
  style={{
    backgroundImage: `url(${heroImage})`, 
    backgroundPosition: "center 45%",
  }}
/>

interface TimeLeft {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function calcularTempoRestante( ): TimeLeft {
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-wedding-charcoal max-w-[2000px] mx-auto">
      
      {/* BackGround Image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat brightness-[0.55]"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center 45%",
        }}
      />

      {/* Textura de Grão */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise )' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Conteúdo Principal */}
      <div
        className={`relative z-10 text-center px-4 transition-all duration-[1200ms] ease-out ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {/* Pré-título */}
        <p className="font-montserrat text-[14px] md:text-[28px] tracking-[0.15em] uppercase text-wedding-gold font-normal mb-6">
          E enfim, o nosso casamento
        </p>

        {/* Nomes do Casal */}
        <h1 className="font-halimun text-[32px] sm:text-[42px] md:text-[80px] lg:text-[110px] whitespace-nowrap leading-tight text-wedding-cream mb-8 drop-shadow-2xl">
          Mariana & Daniel
        </h1>

        {/* Data e Local */}
        <p className="font-montserrat text-[12px] md:text-[20px] text-wedding-cream/85 tracking-[0.2em] font-normal mb-10">
          05 de Dezembro de 2026 &nbsp;·&nbsp; São Paulo
        </p>

        {/* Contador Regressivo */}
        <div className="inline-flex items-center justify-center gap-2 sm:gap-4 md:gap-0 mb-12 py-3 border-y border-wedding-gold/40 w-full sm:w-auto">
          {[
            { valor: tempoRestante.dias, label: "Dias" },
            { valor: tempoRestante.horas, label: "Horas" },
            { valor: tempoRestante.minutos, label: "Min" },
            { valor: tempoRestante.segundos, label: "Seg" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center px-2 sm:px-4 md:px-8 ${
                i < 3 ? "border-r border-wedding-gold/30" : ""
              }`}
            >
              <span className="font-montserrat text-[22px] sm:text-[28px] md:text-[48px] text-wedding-cream font-light leading-none">
                {String(item.valor).padStart(2, "0")}
              </span>
              <span className="font-montserrat text-[9px] sm:text-[11px] md:text-[18px] tracking-[0.2em] uppercase text-wedding-gold mt-1 font-normal">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Botão CTA */}
        <div className="mt-4">
          <Link href="/confirmacao">
            <span className="inline-block border border-wedding-cream/70 text-wedding-cream px-8 sm:px-12 py-4 font-montserrat text-[12px] md:text-[14px] font-normal tracking-[0.4em] md:tracking-[0.8em] uppercase cursor-pointer backdrop-blur-sm bg-wedding-cream/10 transition-all hover:bg-wedding-cream/20 hover:border-wedding-cream">
              Confirmar Presença
            </span>
          </Link>
        </div>
      </div>

      {/* Link Admin */}
      <Link href="/admin">
        <div className="fixed bottom-4 right-4 text-[9px] text-wedding-gold/30 cursor-pointer font-montserrat tracking-widest uppercase hover:text-wedding-gold/70 transition-colors z-50">
          admin
        </div>
      </Link>
    </div>
  );
}
