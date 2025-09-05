import Navigation from "@/components/Navigation";
import { ArrowRight, CheckCircle, Zap, TrendingUp, Users, DollarSign, Brain, Gift, Headphones, Trophy, Rocket, Target, Wrench, Building, Heart, Stethoscope, Calendar, Shield, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const targetPartners = [
  {
    title: "Consultórios e Clínicas Médicas",
    description: "Que desejam automatizar agendamentos, triagem de pacientes e atendimento inicial."
  },
  {
    title: "Profissionais de TI em Saúde", 
    description: "Especializados em tecnologia para área médica e hospitalar."
  },
  {
    title: "Empresas de Telemedicina",
    description: "Que buscam integrar soluções de IA para otimizar atendimentos remotos."
  },
  {
    title: "Desenvolvedores de HealthTech",
    description: "Focados em construir o futuro da saúde digital no Brasil."
  }
];

export default function Partnership() {
  
  useEffect(() => {
    // Script para mobile flip cards
    const flipCards = document.querySelectorAll('.flip-card');
    
    const handleCardClick = (card: Element) => {
      return function(e: Event) {
        // Só ativar no mobile
        if (window.innerWidth <= 768) {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      };
    };

    flipCards.forEach(card => {
      card.addEventListener('click', handleCardClick(card));
    });

    // Cleanup
    return () => {
      flipCards.forEach(card => {
        card.removeEventListener('click', handleCardClick(card));
      });
    };
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#003440] via-[#002832] to-[#001e28] text-white">
      <Navigation />
      {/* Hero Section adaptado para saúde */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Estetoscópio */}
          <svg className="animate-float-slow" style={{position:'absolute', left:60, top:80, width:160, height:160, opacity:0.12}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3v4.5a9 9 0 0 0 9 9 9 9 0 0 0 9-9V3M3 3h18M3 3l1.5 1.5M21 3l-1.5 1.5M12 21v-4.5" stroke="#00849d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="18.5" r="2.5" stroke="#00849d" strokeWidth="2"/>
          </svg>
          {/* Coração */}
          <svg className="animate-float-medium" style={{position:'absolute', right:80, bottom:60, width:120, height:120, opacity:0.12}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#00849d"/>
          </svg>
          {/* Cruz médica */}
          <svg className="animate-float-slower" style={{position:'absolute', left:'50%', top:40, width:110, height:110, opacity:0.10, transform:'translateX(-50%)'}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 12h20" stroke="#00849d" strokeWidth="3" strokeLinecap="round"/>
            <rect x="9" y="9" width="6" height="6" fill="#00849d" opacity="0.8"/>
          </svg>
        </div>
        <style>{`
          @keyframes float-slow { 0%{transform:translateY(0);} 50%{transform:translateY(-18px);} 100%{transform:translateY(0);} }
          @keyframes float-medium { 0%{transform:translateY(0);} 50%{transform:translateY(12px);} 100%{transform:translateY(0);} }
          @keyframes float-slower { 0%{transform:translateY(0);} 50%{transform:translateY(10px);} 100%{transform:translateY(0);} }
          .animate-float-slow { animation: float-slow 9s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 13s ease-in-out infinite; }
          .animate-float-slower { animation: float-slower 17s ease-in-out infinite; }
        `}</style>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/logo_nome.png"
              alt="Conciarge Saúde"
              className="h-16 drop-shadow-lg"
              onError={e => {
                const fallback = "/logo.png";
                const img = e.target as HTMLImageElement;
                if (img && img.src && !img.src.endsWith(fallback)) {
                  img.src = fallback;
                }
              }}
            />
          </div>
          <h2 className="text-5xl lg:text-7xl font-extrabold mb-8 leading-[1.08] bg-gradient-to-r from-white via-[#00849d] to-white bg-clip-text text-transparent drop-shadow-glow" style={{overflowWrap:'anywhere'}}>
              Transforme sua<br />
            <span className="text-[#00849d] font-black">Clínica ou Consultório</span><br />
            com Inteligência Artificial
          </h2>
          <p className="text-2xl mb-12 opacity-95 max-w-4xl mx-auto text-white font-medium">
            Automatize agendamentos, triagem de pacientes e atendimento inicial. 
            Libere tempo para focar no que realmente importa: cuidar dos seus pacientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild variant="hero" size="lg" className="text-xl px-10 py-7 bg-[#00849d] hover:bg-white hover:text-[#00849d] text-white font-bold shadow-2xl shadow-[#00849d]/40 border-2 border-[#00849d] hover:border-[#00849d] transition-all duration-300">
              <Link to="/parceria/cadastro">
                Tornar-se Parceiro
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-16">
            <div className="p-8 rounded-2xl bg-white/5 border-2 border-[#00849d]/30 shadow-2xl shadow-[#00849d]/20 hover:scale-105 hover:border-[#00849d]/60 transition-all duration-300 backdrop-blur-sm">
              <div className="text-5xl font-black text-[#00849d] mb-3 drop-shadow-glow">25%</div>
              <h3 className="text-xl font-bold mb-2 text-white">Comissão por Venda</h3>
              <p className="text-white/90 font-medium">Em todas as vendas e renovações</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border-2 border-[#00849d]/30 shadow-2xl shadow-[#00849d]/20 hover:scale-105 hover:border-[#00849d]/60 transition-all duration-300 backdrop-blur-sm">
              <div className="text-5xl font-black text-[#00849d] mb-3 drop-shadow-glow">60%</div>
              <h3 className="text-xl font-bold mb-2 text-white">Desconto na Plataforma</h3>
              <p className="text-white/90 font-medium">Para demonstrações aos clientes</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border-2 border-[#00849d]/30 shadow-2xl shadow-[#00849d]/20 hover:scale-105 hover:border-[#00849d]/60 transition-all duration-300 backdrop-blur-sm">
              <div className="text-5xl font-black text-[#00849d] mb-3 drop-shadow-glow">24/7</div>
              <h3 className="text-xl font-bold mb-2 text-white">Suporte Técnico</h3>
              <p className="text-white/90 font-medium">Para você e seus clientes médicos</p>
            </div>
          </div>
        </div>
      </section>
      

      {/* BenefitsSection adaptada para saúde */}
      <section className="py-20 bg-gradient-to-b from-[#002832]/95 to-[#001e28]/95">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              As Vantagens de Ser um <span className="text-[#00849d] font-black">Parceiro Conciarge Saúde</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-medium">
              Ao se juntar ao programa, você entra em um ecossistema projetado para gerar lucro, crescimento e liderança no nicho de tecnologia em saúde.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefits Cards com efeito flip adaptados para saúde */}
            {[
              { icon: DollarSign, title: "Ganhos Exponenciais", description: "Comissão de 25% em todas as vendas e renovações. Ao atingir R$ 40.000 em faturamento, sua comissão sobe para 35%, garantindo uma receita passiva e crescente. Além disso, ganhe comissões em todos os novos produtos e cross-sells que oferecermos.", badge: "Receita Recorrente" },
              { icon: Heart, title: "Monetização da Expertise", description: "Você não é apenas um revendedor. Ofereça serviços de alto valor como configuração de fluxos de triagem médica, criação de scripts de agendamento inteligente e treinamento de equipes de saúde. Defina seus próprios preços e fique com 100% dessa receita.", badge: "100% Seu Lucro" },
              { icon: UserCheck, title: "Leads Médicos Qualificados", description: "Nós investimos no seu sucesso. Fornecemos acesso a uma base de médicos, clínicas e consultórios que já demonstraram interesse na Conciarge Saúde, mas precisam de um especialista para implementar a solução.", badge: "Leads Prontos" },
              { icon: Gift, title: "60% de Desconto na Plataforma", description: "Domine a plataforma com 60% de desconto. Receba acesso à Conciarge Saúde com desconto especial para demonstrações aos clientes, permitindo que você explore todo o potencial da ferramenta e apresente com confiança.", badge: "Acesso com Desconto" },
              { icon: Headphones, title: "Suporte e Ferramentas", description: "Tenha acesso a uma equipe de parcerias dedicada para orientação estratégica, além de suporte técnico 24/7. Fornecemos kits de vendas, materiais de marketing, demonstrações e documentação técnica focada no universo da saúde.", badge: "Suporte 24/7" },
              { icon: Shield, title: "Crescimento de Marca", description: "Ganhe credibilidade instantânea com o selo oficial de Parceiro Certificado Conciarge Saúde. Seja destaque em nossos canais e tenha sua empresa listada em nosso diretório de parceiros especializados em healthtech.", badge: "Certificação Oficial" }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 [perspective:1000px] group">
                  <div className="flip-card relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] md:group-hover:[transform:rotateY(180deg)] cursor-pointer">
                    {/* Frente do card: ícone, título e badge */}
                    <div className="card-front absolute inset-0 flex flex-col items-center justify-center bg-white/10 border-2 border-[#00849d]/40 shadow-2xl shadow-[#00849d]/30 rounded-2xl [backface-visibility:hidden] p-4 md:p-6 backdrop-blur-sm hover:border-[#00849d]/70 transition-all duration-300">
                      <Icon className="w-12 h-12 md:w-14 md:h-14 text-[#00849d] drop-shadow mb-4" />
                      <span className="text-lg md:text-2xl font-bold text-white drop-shadow-glow text-center mb-2 px-2">{benefit.title}</span>
                      <Badge variant="secondary" className="bg-[#00849d] text-white border-2 border-[#00849d] mt-2 text-xs md:text-sm px-3 py-1 font-bold">
                        {benefit.badge}
                      </Badge>
                      {/* Botão para mobile */}
                      <button className="md:hidden mt-3 text-white/80 text-xs underline tap-button">
                        Toque para ver mais
                      </button>
                    </div>
                    {/* Verso do card: conteúdo completo */}
                    <div className="card-back absolute inset-0 flex flex-col justify-between bg-white/10 border-2 border-[#00849d]/40 shadow-2xl shadow-[#00849d]/30 rounded-2xl p-3 md:p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-1 md:mb-2">
                        <Icon className="w-5 h-5 md:w-8 md:h-8 text-[#00849d] drop-shadow flex-shrink-0" />
                        <Badge variant="secondary" className="bg-[#00849d] text-white border-2 border-[#00849d] text-xs font-bold">
                          {benefit.badge}
                        </Badge>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="block text-sm md:text-lg font-bold text-white mb-1 md:mb-2">{benefit.title}</span>
                        <p className="text-white/90 text-xs md:text-sm leading-tight md:leading-relaxed font-medium">{benefit.description}</p>
                      </div>
                      {/* Botão para voltar no mobile */}
                      <button className="md:hidden mt-2 text-white/80 text-xs underline tap-button flex-shrink-0">
                        Toque para voltar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* CSS personalizado para mobile */}
          <style>{`
            @media (max-width: 768px) {
              .flip-card.flipped {
                transform: rotateY(180deg) !important;
              }
              .flip-card .card-front,
              .flip-card .card-back {
                transition: transform 0.7s ease-in-out;
              }
              .card-back {
                padding: 0.75rem !important;
              }
              .card-back .text-base {
                font-size: 0.8rem !important;
                line-height: 1.3 !important;
                margin-bottom: 0.5rem !important;
              }
              .card-back p {
                font-size: 0.7rem !important;
                line-height: 1.3 !important;
                margin: 0 !important;
              }
              .card-back .w-6 {
                width: 1.25rem !important;
                height: 1.25rem !important;
              }
              .card-back .text-xs {
                font-size: 0.65rem !important;
              }
            }
          `}</style>
        </div>
      </section>
      {/* HowItWorksSection + CTA adaptados para saúde */}
      <section className="py-20 bg-gradient-to-b from-[#001e28]/95 to-[#003440]/95">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Como Funciona <span className="text-[#00849d] font-black">na Prática</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 font-medium">
              Um programa estruturado para maximizar seus ganhos e construir um negócio sustentável no setor de tecnologia em saúde.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Steps Cards - visual mais leve adaptado para saúde */}
            {[
              {
                icon: DollarSign,
                number: "01",
                title: "Ganhe com Cada Venda",
                summary: "Comissão de 25% em todas as vendas. Ao atingir R$ 40.000 em vendas, sua comissão sobe para 35%. Renovações e novos produtos também geram receita.",
                note: "Acompanhe tudo pelo Portal de Parceiros."
              },
              {
                icon: Stethoscope,
                number: "02",
                title: "Monetize sua Expertise",
                summary: "Ofereça serviços de implementação, integração e treinamento para clínicas e consultórios médicos. Defina seu preço e fique com 100% do valor.",
                note: "Você é dono do seu lucro."
              },
              {
                icon: Calendar,
                number: "03",
                title: "Acesso a Inovações",
                summary: "Tenha acesso antecipado a novos produtos e automações médicas. Ofereça novidades aos clientes e aproveite 60% de desconto para demonstrações.",
                note: "Seja referência em tecnologia médica."
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center bg-white/10 border-2 border-[#00849d]/40 rounded-2xl shadow-2xl shadow-[#00849d]/30 p-8 hover:scale-[1.03] hover:border-[#00849d]/70 transition-all duration-300 backdrop-blur-sm">
                  <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-[#00849d] mb-3 shadow-xl shadow-[#00849d]/40">
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <span className="text-[#00849d] font-black text-xl mb-1">Passo {step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/90 text-base mb-3 font-medium">{step.summary}</p>
                  <span className="text-white/80 text-sm font-bold bg-[#00849d]/20 border border-[#00849d]/40 rounded-full px-4 py-2 mt-auto">{step.note}</span>
                </div>
              );
            })}
          </div>
          {/* CTA Final */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Pronto para Revolucionar a Saúde Digital?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto font-medium">
              Junte-se ao programa de parceiros da Conciarge Saúde e comece a construir um negócio lucrativo no futuro da medicina.
            </p>
            <Button asChild variant="hero" size="lg" className="text-xl px-10 py-7 bg-[#00849d] hover:bg-white hover:text-[#00849d] text-white font-bold shadow-2xl shadow-[#00849d]/40 border-2 border-[#00849d] hover:border-[#00849d] transition-all duration-300">
              <Link to="/parceria/cadastro">
                Começar Agora
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}