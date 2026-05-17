import { useState } from 'react';
import { trpc } from '../lib/trpc';
import manualImg from '../assets/images/manual.png';

const GALLERY_ITEMS = [
  {
    titulo: "Como tudo começou",
    texto: "Era uma vez um encontro inesperado que mudaria nossas vidas para sempre. O que começou com um simples 'oi' se transformou em uma jornada extraordinária de amor e cumplicidade.",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80"
  },
  {
    titulo: "Nossas Aventuras",
    texto: "Cada viagem, cada risada e cada desafio superado nos trouxe até aqui. Descobrimos que o mundo é muito mais bonito quando explorado de mãos dadas.",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80"
  },
  {
    titulo: "O Pedido",
    texto: "Um momento mágico, cercado de emoção, onde dissemos 'sim' para o nosso futuro juntos. Foi o início do capítulo mais lindo de nossas vidas.",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80"
  }
];

const PRESENTES = [
  {
    nome: "Jantar Romântico",
    descricao: "Um jantar especial para os noivos em sua lua de mel.",
    pix: "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5920Daniel e Mariana6009SAO PAULO62070503***6304ABCD",
    emoji: "🍽️"
  },
  {
    nome: "Passeio de Barco",
    descricao: "Um passeio inesquecível pelas águas cristalinas.",
    pix: "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5920Daniel e Mariana6009SAO PAULO62070503***6304EFGH",
    emoji: "⛵"
  },
  {
    nome: "Spa para o Casal",
    descricao: "Um momento de relaxamento e renovação.",
    pix: "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5920Daniel e Mariana6009SAO PAULO62070503***6304IJKL",
    emoji: "💆‍♂️"
  }
];

const ENDERECO_CURTO = "R. Cônego Eugênio Leite, 1098 - Pinheiros, São Paulo - SP";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Celeiro+Quintal+R.+Cônego+Eugênio+Leite,+1098+-+Pinheiros,+São+Paulo+-+SP";

const SectionDivider = ({ title, isVerification = false }: { title: string, isVerification?: boolean }) => (
  <div className="text-center mb-12">
    <h2 className="font-cormorant text-[32px] md:text-[42px] text-[#462F29] uppercase tracking-[0.1em] mb-4">
      {title}
    </h2>
    {!isVerification && <div className="w-12 h-[1px] bg-wedding-gold mx-auto" />}
  </div>
);

const FadeSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`transition-all duration-1000 ${className}`}>
    {children}
  </div>
);

export default function Confirmacao() {
  const [nomeBusca, setNomeBusca] = useState('');
  const [convidadoSelecionado, setConvidadoSelecionado] = useState<any>(null);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [resposta, setResposta] = useState<'Confirmado' | 'Talvez' | 'Não Irá' | null>(null);
  const [adultos, setAdultos] = useState<{ nome: string }[]>([]);
  const [criancas, setCriancas] = useState<{ nome: string; idade: string }[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [pixVisivel, setPixVisivel] = useState<{ [key: number]: boolean }>({});
  const [pixCopiado, setPixCopiado] = useState<number | null>(null);

  const utils = trpc.useContext();
  const buscarMutation = trpc.buscarConvidado.useMutation();
  const confirmarPresenca = trpc.confirmarPresenca.useMutation({
    onSuccess: () => {
      setSucesso(true);
      utils.getConvidados.invalidate();
    }
  });

  const buscarConvidado = async () => {
    if (!nomeBusca.trim()) return;
    setCarregandoBusca(true);
    try {
      const res = await buscarMutation.mutateAsync({ nome: nomeBusca });
      if (res) {
        setConvidadoSelecionado(res);
      } else {
        alert("Convidado não encontrado. Por favor, verifique se digitou conforme o convite.");
      }
    } catch (error) {
      alert("Erro ao buscar convidado. Tente novamente.");
    } finally {
      setCarregandoBusca(false);
    }
  };

  const copiarPix = (index: number, pix: string) => {
    navigator.clipboard.writeText(pix);
    setPixCopiado(index);
    setTimeout(() => setPixCopiado(null), 2000);
  };

  const handleSubmit = async () => {
    if (!resposta || !convidadoSelecionado) return;

    const menores8 = criancas.filter(c => parseInt(c.idade) <= 7).length;
    const acompanhantesNormais = adultos.length + criancas.filter(c => parseInt(c.idade) > 7).length;
    
    const detalhes = [
      ...adultos.map(a => a.nome),
      ...criancas.map(c => `${c.nome} (${c.idade} anos)`)
    ].join(', ');

    await confirmarPresenca.mutateAsync({
      id: convidadoSelecionado.id,
      status: resposta,
      acompanhantes: acompanhantesNormais,
      criancas: criancas.length,
      menores8: menores8,
      acompanhanteDetalhes: detalhes,
      mensagem: mensagem
    });
  };

  return (
    <div className="min-h-screen bg-wedding-cream relative overflow-hidden">
      <main className="max-w-6xl mx-auto pt-20 pb-20 relative z-10">
        {/* Cabeçalho (Nomes do Casal) */}
        <FadeSection className="px-6 text-center mb-20">
          <p className="font-lato text-[10px] tracking-[0.6em] text-wedding-gold uppercase mb-6">05 de Dezembro de 2026</p>
          <h1 className="font-halimun text-[42px] md:text-[60px] text-[#462F29] leading-tight">Mariana & Daniel</h1>
        </FadeSection>

        {/* Efeito de Envelope no Topo */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-wedding-cream to-transparent z-20 pointer-events-none" />

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
                    <div className="flex-1 text-center md:text-left order-2 md:order-1 max-w-[400px] z-30 bg-[#462F29] p-6 md:p-4 rounded-sm shadow-sm md:shadow-none">
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
                  <p className="font-montserrat text-[14px] md:text-[16px] text-wedding-charcoal/70 leading-relaxed mb-2">
                    05 de Dezembro de 2026
                  </p>
                  <p className="font-montserrat text-[14px] md:text-[16px] text-wedding-charcoal/70 leading-relaxed mb-4">
                    Início: 18:00h
                  </p>
                  <p className="font-montserrat text-[14px] md:text-[16px] text-wedding-charcoal/70 leading-relaxed mb-4">
                    {ENDERECO_CURTO}
                  </p>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-block bg-wedding-gold text-white px-6 py-3 font-montserrat text-[12px] uppercase tracking-[0.2em] transition-colors hover:bg-wedding-gold/80">
                    Ver no Mapa
                  </a>
                </div>
                <div className="w-full h-[300px] md:h-[400px] overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent("Celeiro Quintal " + ENDERECO_CURTO)}`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>
            </FadeSection>

            {/* Presentes */}
            <FadeSection className="mb-24 md:mb-32 px-6">
              <SectionDivider title="Presentes" />
              <div className="max-w-5xl mx-auto overflow-x-auto pb-8 md:overflow-visible">
                <div className="flex md:grid md:grid-cols-3 gap-6 min-w-[300px] md:min-w-0">
                  {PRESENTES.map((presente, index) => (
                    <div key={index} className="flex-shrink-0 w-[280px] md:w-auto bg-white p-6 rounded-lg shadow-md text-center relative">
                      <div className="text-5xl mb-4">{presente.emoji}</div>
                      <h3 className="font-cormorant text-2xl text-wedding-charcoal mb-2">{presente.nome}</h3>
                      <p className="font-montserrat text-sm text-wedding-charcoal/70 mb-4 h-12 overflow-hidden">{presente.descricao}</p>
                      <button
                        onClick={() => setPixVisivel(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="bg-wedding-gold text-white px-6 py-2 rounded-full font-montserrat text-xs uppercase tracking-wider hover:bg-wedding-gold/80 transition-colors"
                      >
                        {pixVisivel[index] ? "Esconder PIX" : "Presentear via PIX"}
                      </button>
                      {pixVisivel[index] && (
                        <div className="mt-4 p-4 bg-wedding-cream rounded-md border border-wedding-gold/30">
                          <p className="font-montserrat text-xs text-wedding-charcoal/80 mb-2 font-bold">Confirme o destinatário: Daniel e Mariana</p>
                          <p className="font-montserrat text-sm text-wedding-charcoal break-all mb-2">{presente.pix}</p>
                          <button
                            onClick={() => copiarPix(index, presente.pix)}
                            className="w-full bg-wedding-charcoal text-white py-2 rounded-full font-montserrat text-xs uppercase tracking-wider hover:bg-wedding-charcoal/80 transition-colors"
                          >
                            {pixCopiado === index ? "Copiado!" : "Copiar Chave PIX"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>

            {/* Confirmação de Presença */}
            <FadeSection className="mb-24 md:mb-32 px-6">
              <SectionDivider title="Confirmação de Presença" />
              {!sucesso ? (
                <div className="max-w-3xl mx-auto">
                  <p className="font-montserrat text-lg text-[#462F29] text-center mb-8">
                    {convidadoSelecionado.limite > 0
                      ? `${convidadoSelecionado.nome}, por favor, confirme sua presença e de seus acompanhantes (limite: ${convidadoSelecionado.limite}).`
                      : `${convidadoSelecionado.nome}, por favor, confirme sua presença.`}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[ "Confirmado", "Talvez", "Não Irá" ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setResposta(opt as any)}
                        className={`p-6 border-2 rounded-lg font-cormorant text-xl transition-all
                          ${resposta === opt
                            ? "border-wedding-gold bg-wedding-gold text-white shadow-md"
                            : "border-wedding-cream bg-white text-wedding-charcoal hover:border-wedding-gold/50"}`}
                      >
                        {opt === "Confirmado" ? "Confirmo minha presença" : opt === "Talvez" ? "Ainda não tenho certeza" : "Não poderei comparecer"}
                      </button>
                    ))}
                  </div>

                  {resposta === "Confirmado" && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                      <h3 className="font-cormorant text-2xl text-[#462F29] mb-4">Acompanhantes</h3>
                      <p className="font-montserrat text-sm text-wedding-charcoal/70 mb-4">
                        Você pode levar até {convidadoSelecionado.limite} acompanhantes.
                      </p>

                      {adultos.length + criancas.length < (convidadoSelecionado.limite || 0) && (
                        <div className="mb-4">
                          <input type="text" placeholder="Nome e Sobrenome do Adulto" className="wedding-input mb-2" id="adult-name-input" />
                          <button
                            onClick={() => {
                              const input = document.getElementById('adult-name-input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                setAdultos([...adultos, { nome: input.value.trim() }]);
                                input.value = '';
                              }
                            }}
                            className="bg-wedding-gold text-white px-4 py-2 rounded-full font-montserrat text-xs uppercase tracking-wider"
                          >
                            Adicionar Adulto
                          </button>
                        </div>
                      )}

                      {adultos.map((a, i) => (
                        <div key={i} className="flex justify-between items-center bg-wedding-cream p-2 rounded-md mb-1">
                          <span className="font-montserrat text-sm text-wedding-charcoal">{a.nome}</span>
                          <button onClick={() => setAdultos(adultos.filter((_, idx) => idx !== i))} className="text-red-500 text-xs">Remover</button>
                        </div>
                      ))}

                      {adultos.length + criancas.length < (convidadoSelecionado.limite || 0) && (
                        <div className="mb-4 mt-4">
                          <input type="text" placeholder="Nome e Sobrenome da Criança" className="wedding-input mb-2" id="child-name-input" />
                          <input type="number" placeholder="Idade da Criança" className="wedding-input mb-2" id="child-age-input" />
                          <button
                            onClick={() => {
                              const inputNome = document.getElementById('child-name-input') as HTMLInputElement;
                              const inputIdade = document.getElementById('child-age-input') as HTMLInputElement;
                              if (inputNome && inputNome.value.trim() && inputIdade && inputIdade.value.trim()) {
                                setCriancas([...criancas, { nome: inputNome.value.trim(), idade: inputIdade.value.trim() }]);
                                inputNome.value = '';
                                inputIdade.value = '';
                              }
                            }}
                            className="bg-wedding-gold text-white px-4 py-2 rounded-full font-montserrat text-xs uppercase tracking-wider"
                          >
                            Adicionar Criança
                          </button>
                        </div>
                      )}

                      {criancas.map((c, i) => (
                        <div key={i} className="flex justify-between items-center bg-wedding-cream p-2 rounded-md mb-1">
                          <span className="font-montserrat text-sm text-wedding-charcoal">{c.nome} ({c.idade} anos)</span>
                          <button onClick={() => setCriancas(criancas.filter((_, idx) => idx !== i))} className="text-red-500 text-xs">Remover</button>
                        </div>
                      ))}

                      <h3 className="font-cormorant text-2xl text-[#462F29] mt-6 mb-4">Mensagem para os Noivos</h3>
                      <textarea
                        placeholder="Deixe uma mensagem carinhosa..."
                        className="wedding-input h-32 mb-4"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                      />
                    </div>
                  )}

                  {(resposta === "Não Irá" || resposta === "Talvez") && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                      <h3 className="font-cormorant text-2xl text-[#462F29] mb-4">Mensagem para os Noivos</h3>
                      <textarea
                        placeholder="Deixe uma mensagem..."
                        className="wedding-input h-32 mb-4"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                      />
                    </div>
                  )}

                  {resposta && (
                    <button
                      onClick={handleSubmit}
                      disabled={confirmarPresenca.isPending}
                      className={`w-full bg-wedding-gold text-white py-4 tracking-[0.2em] uppercase text-[12px] transition-opacity ${confirmarPresenca.isPending ? 'opacity-50' : 'opacity-100'}`}
                    >
                      {confirmarPresenca.isPending ? "Enviando..." : "Enviar Resposta"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="font-halimun text-[32px] md:text-[48px] text-[#462F29] mb-6">
                    Obrigado, sua resposta foi salva com carinho!
                  </h2>
                  <p className="font-montserrat text-[14px] md:text-[18px] text-wedding-charcoal/70 leading-relaxed mb-8">
                    Estamos ansiosos para celebrar com você.
                  </p>
                  <div className="w-full max-w-md mx-auto mb-8">
                    <img src={manualImg} alt="Manual do Convidado" className="w-full h-auto" />
                    <p className="font-montserrat text-xs text-wedding-charcoal/60 mt-2">Tire um print para não esquecer os detalhes!</p>
                  </div>
                </div>
              )}
            </FadeSection>

            {/* Efeito de Envelope no Rodapé */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-wedding-cream to-transparent z-20 pointer-events-none" />
          </div>
        )}
      </main>
    </div>
  );
}
