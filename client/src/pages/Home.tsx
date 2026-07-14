import { useEffect, useState } from "react";
import { Link } from "wouter";
import heroImage from "../assets/images/home.png";

interface TimeLeft {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function calcularTempoRestante(): TimeLeft {
  const dataCasamento = new Date("Dec 5, 2026 17:30:00").getTime();
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
    // Bloquear rolagem apenas na Home
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTempoRestante(calcularTempoRestante());
    }, 1000);
    setTimeout(() => setLoaded(true), 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-wedding-charcoal" style={{ height: '100dvh' }}>
      
      {/* BackGround Image - Valorização da fotografia com ajuste sutil de luminosidade */}
      <div
          className="fixed inset-0 w-full h-full bg-cover bg-no-repeat brightness-[0.65] bg-top md:bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
        }}
      />
      {/* Overlay sutil para garantir legibilidade mantendo detalhes da foto */}
      <div className="fixed inset-0 bg-black/15 pointer-events-none" />

      {/* Textura de Grão */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'%3E%3C/rect%3E%3C/svg%3E")`,
        }}
      />

      {/* Conteúdo Principal */}
      <div
        className={`relative z-10 text-center px-4 py-12 transition-all duration-[1200ms] ease-out 
          ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        {/* Pré-título */}
        <p 
          className={`font-montserrat text-[14px] md:text-[28px] tracking-[0.15em] uppercase text-wedding-gold font-extrabold mb-6 
            transition-all duration-700 ease-out ${loaded ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-5"}`}        >
          E enfim, o nosso casamento
        </p>

        {/* Nomes do Casal */}
        <h1 
          className={`font-halimun text-[32px] sm:text-[42px] md:text-[80px] lg:text-[110px] leading-tight text-wedding-cream mb-8 drop-shadow-2xl 
            transition-all duration-700 ease-out ${loaded ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-5"}`}
          style={{ whiteSpace: "normal", wordBreak: "break-word" }}
        >
          Mariana & Daniel
        </h1>

        {/* Data e Local */}
        <p 
          className={`font-montserrat text-[12px] md:text-[20px] text-wedding-cream/85 tracking-[0.2em] font-normal mb-10 
            transition-all duration-700 ease-out ${loaded ? "opacity-100 translate-y-0 delay-400" : "opacity-0 translate-y-5"}`}
        >
          05 de Dezembro de 2026 &nbsp;·&nbsp; São Paulo
        </p>

        {/* Contador Regressivo - Design Premium Editorial */}
        <div 
          className={`inline-flex items-center justify-center mb-12 py-6 w-full sm:w-auto px-4
            transition-all duration-700 ease-out ${loaded ? "opacity-100 translate-y-0 delay-500" : "opacity-0 translate-y-5"}`}
        >
          <div className="flex items-center justify-center">
            {[
              { valor: tempoRestante.dias, label: "Dias" },
              { valor: tempoRestante.horas, label: "Horas" },
              { valor: tempoRestante.minutos, label: "Min" },
              { valor: tempoRestante.segundos, label: "Seg" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center">
                <div className="flex flex-col items-center px-4 sm:px-6 md:px-10">
                  <span className="font-montserrat text-[28px] sm:text-[36px] md:text-[56px] text-wedding-cream font-light leading-none tracking-tighter">
                    {String(item.valor).padStart(2, "0")}
                  </span>
                  <span className="font-montserrat text-[8px] sm:text-[10px] md:text-[14px] tracking-[0.3em] uppercase text-wedding-gold mt-2 font-semibold">
                    {item.label}
                  </span>
                </div>
                {i < 3 && (
                  <div className="w-[1px] h-10 md:h-16 bg-wedding-gold/60"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botão CTA */}
        <div 
          className={`mt-4 
            transition-all duration-700 ease-out ${loaded ? "opacity-100 translate-y-0 delay-600" : "opacity-0 translate-y-5"}`}
        >
          <Link href="/confirmacao">
            <span className="inline-block border border-wedding-cream/70 text-wedding-cream px-8 sm:px-12 py-4 font-montserrat text-[12px] md:text-[14px] font-normal tracking-[0.4em] md:tracking-[0.8em] uppercase cursor-pointer backdrop-blur-sm bg-wedding-cream/10 transition-all hover:bg-wedding-cream/20 hover:border-wedding-cream">
              Confirmar Presença
            </span>
          </Link>
        </div>
      </div>

      {/* Link Admin - Oculto em produção, acessível via rota /admin */}
      {process.env.NODE_ENV === 'development' && (
        <Link href="/admin">
          <div className="fixed bottom-4 right-4 text-[9px] text-wedding-gold/30 cursor-pointer font-montserrat tracking-widest uppercase hover:text-wedding-gold/70 transition-colors z-50">
            admin
          </div>
        </Link>
      )}
    </div>
  );
}
