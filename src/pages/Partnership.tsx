import Navigation from "@/components/Navigation";
import { ArrowRight, CheckCircle } from "lucide-react";
import { CurrencyDollar, Heart, Shield, UserCheck, Clock, Robot, Buildings, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Partnership() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 lg:py-32 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#00849d] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#00849d] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#00849d] rounded-full blur-3xl opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <img
                src="/logo_nome.png"
                alt="Conciarge"
                className="h-12 md:h-16"
                onError={e => {
                  const fallback = "/logo.png";
                  const img = e.target as HTMLImageElement;
                  if (img && img.src && !img.src.endsWith(fallback)) {
                    img.src = fallback;
                  }
                }}
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Automatize sua{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00849d] to-blue-400">
                Clínica
              </span>{" "}
              com Inteligência Artificial
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolucione o atendimento ao paciente, qualifique agendamentos automaticamente e libere 
              tempo para focar no que realmente importa: o cuidado com a saúde.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-[#00849d] hover:bg-[#006b7d] text-white px-8 py-4 text-lg font-semibold">
                <Link to="/parceria/cadastro">
                  Tornar-se Parceiro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#00849d] mb-2">20%</div>
                <div className="text-gray-300 text-sm font-semibold">Comissão por Venda</div>
                <div className="text-gray-400 text-xs">Em todas as vendas e renovações</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#00849d] mb-2">70%</div>
                <div className="text-gray-300 text-sm font-semibold">Desconto na Plataforma</div>
                <div className="text-gray-400 text-xs">Para demonstrações aos clientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#00849d] mb-2">24/7</div>
                <div className="text-gray-300 text-sm font-semibold">Suporte Técnico</div>
                <div className="text-gray-400 text-xs">Para você e seus clientes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* As Vantagens de Ser um Parceiro Conciarge */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              As Vantagens de Ser um{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00849d] to-[#006b7d]">
                Parceiro Conciarge Saúde
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ao se juntar ao programa, você entra em um ecossistema projetado para gerar 
              lucro, crescimento e liderança no nicho de tecnologia em saúde.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CurrencyDollar,
                title: "Ganhos Exponenciais",
                description: "Receita Recorrente",
                details: "Comissão de 20% em todas as vendas e renovações. Ao atingir R$ 50.000 em vendas, sua comissão sobe para 30%, garantindo uma receita passiva e crescente."
              },
              {
                icon: Heart,
                title: "Monetização da Expertise",
                description: "100% Seu Lucro",
                details: "Ofereça serviços de configuração, treinamento e consultoria médico-digital. Defina seus próprios preços e fique com 100% dessa receita adicional."
              },
              {
                icon: UserCheck,
                title: "Leads Médicos Qualificados",
                description: "Leads Prontos",
                details: "Fornecemos acesso a uma base de clínicas e médicos que já demonstraram interesse na Conciarge, mas precisam de um especialista para implementar."
              },
              {
                icon: Buildings,
                title: "70% de Desconto na Plataforma",
                description: "Acesso com Desconto",
                details: "Domine a plataforma com 70% de desconto. Use para sua própria clínica e para demonstrações convincentes aos seus clientes."
              },
              {
                icon: Clock,
                title: "Suporte e Ferramentas",
                description: "Suporte 24/7",
                details: "Equipe dedicada para orientação estratégica, suporte técnico 24/7, kits de vendas, materiais de marketing e documentação técnica completa."
              },
              {
                icon: Shield,
                title: "Crescimento de Marca",
                description: "Certificação Oficial",
                details: "Ganhe credibilidade com o selo oficial de Parceiro Certificado Conciarge Saúde. Destaque em nossos canais e listagem no diretório de parceiros."
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-2 border-gray-200 hover:border-[#00849d] transition-colors group p-6">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00849d]/10 rounded-lg group-hover:bg-[#00849d]/20 transition-colors">
                        <Icon size={32} className="text-[#00849d]" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</CardTitle>
                    <Badge className="bg-[#00849d] text-white">{benefit.description}</Badge>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">{benefit.details}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* Como Funciona na Prática */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Como Funciona{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00849d] to-[#006b7d]">
                na Prática
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um programa estruturado para maximizar seus ganhos e construir um negócio 
              sustentável no setor de tecnologia em saúde.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: CurrencyDollar,
                step: "Passo 01",
                title: "Ganhe com Cada Venda",
                description: "Comissão de 20% em todas as vendas. Ao atingir R$ 50.000 em vendas, sua comissão sobe para 30%. Renovações e novos produtos também geram receita.",
                note: "Acompanhe tudo pelo Portal de Parceiros."
              },
              {
                icon: Robot,
                step: "Passo 02", 
                title: "Monetize sua Expertise",
                description: "Ofereça serviços de implementação, integração e treinamento para clínicas de saúde. Defina seu preço e fique com 100% do valor.",
                note: "Você é dono do seu lucro."
              },
              {
                icon: Star,
                step: "Passo 03",
                title: "Acesso a Inovações",
                description: "Tenha acesso antecipado a novos produtos e automações médicas. Ofereça novidades aos clientes e aproveite 70% de desconto para demonstrações.",
                note: "Seja referência em tecnologia médica."
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="text-center border-2 border-gray-200 hover:border-[#00849d] transition-colors p-8 group">
                  <CardHeader className="pb-6">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00849d] rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                        <Icon size={40} className="text-white" />
                      </div>
                    </div>
                    <Badge className="bg-[#00849d]/10 text-[#00849d] border border-[#00849d]/20 mb-4">
                      {step.step}
                    </Badge>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-3">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <div className="bg-[#00849d]/5 border border-[#00849d]/20 rounded-full px-4 py-2">
                      <span className="text-[#00849d] text-sm font-semibold">{step.note}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Revolucionar o Setor da Saúde?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se ao programa de parceiros da Conciarge Saúde e comece a construir 
            um negócio lucrativo no futuro da medicina.
          </p>
          <Button asChild size="lg" className="bg-[#00849d] hover:bg-[#006b7d] text-white px-8 py-4 text-lg font-semibold">
            <Link to="/parceria/cadastro">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}