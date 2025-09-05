import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section com design consistente */}
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
            
            <div className="text-8xl md:text-9xl font-bold mb-6 text-[#00849d]">404</div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Oops! Página{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00849d] to-blue-400">
                não encontrada
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              A página que você está procurando não existe ou foi movida. 
              Vamos te ajudar a encontrar o que você precisa.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#00849d] hover:bg-[#006b7d] text-white px-8 py-4 text-lg font-semibold">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Voltar ao Início
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold">
                <Link to="/parceria">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Programa de Parceiros
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
