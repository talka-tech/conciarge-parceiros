import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Páginas que têm fundo branco e precisam da navbar sempre visível
  const whiteBackgroundPages = ['/parceria/login', '/parceria/cadastro', '/parceria/painel', '/parceria/admin'];
  const isWhiteBackgroundPage = whiteBackgroundPages.includes(location.pathname);
  
  // Determina se deve mostrar versão "light" (para fundos brancos) ou "dark" (para fundos escuros)
  const shouldUseLightVersion = scrolled || isWhiteBackgroundPage;

  const menuItems = [
    { label: "Recursos", href: "#recursos" },
    { label: "Especialistas", href: "#especialistas" }, 
    { label: "Planos", href: "#planos" },
    { label: "Dúvidas Frequentes", href: "#faq" }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      shouldUseLightVersion 
        ? 'bg-white/95 backdrop-blur-sm shadow-lg py-3' 
        : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Conciarge" 
            className={`h-10 w-auto transition-all duration-300 ${
              shouldUseLightVersion ? 'brightness-0 saturate-100' : ''
            }`}
            onError={e => {
              const fallback = "/logo.png";
              const img = e.target as HTMLImageElement;
              if (img && img.src && !img.src.endsWith(fallback)) {
                img.src = fallback;
              }
            }}
          />
        </div>
        
        {/* Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`font-medium transition-colors duration-200 ${
                shouldUseLightVersion 
                  ? 'text-gray-700 hover:text-[#00849d]' 
                  : 'text-white hover:text-[#00849d]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
        
        {/* Login Button */}
        <Link
          to="/parceria/login"
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            shouldUseLightVersion
              ? 'bg-white text-[#00849d] hover:bg-[#00849d] hover:text-white border border-[#00849d]'
              : 'bg-[#00849d] text-white hover:bg-white hover:text-[#00849d] border border-[#00849d]'
          }`}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
