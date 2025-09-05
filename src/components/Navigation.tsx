import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const menuItems = [
    { label: "Início", href: "https://www.conciarge.com.br/" },
    { label: "Sobre", href: "https://www.conciarge.com.br/#sobre" },
    { label: "Recursos", href: "https://www.conciarge.com.br/#recursos" },
    { label: "Planos", href: "https://www.conciarge.com.br/#planos" },
    { label: "Documentação", href: "https://conciarge.gitbook.io/conciarge-docs" }
  ];

  // Motion: reduz e arredonda ao scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`w-full bg-[#001e28]/95 shadow-2xl backdrop-blur-md text-white fixed top-0 left-0 z-50 transition-all duration-300 border-b border-[#00849d]/30
        ${scrolled ? "h-12 rounded-2xl mx-2 mt-2" : "h-12 rounded-none mx-0 mt-0"}
        flex items-center`}
    >
      <div className={`container mx-auto flex justify-between items-center transition-all duration-300 ${scrolled ? "px-2" : "px-8"}`}>
        {/* Menu principal centralizado */}
        <div className="flex-1 flex justify-center">
          <ul className="flex gap-10">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-base font-bold px-4 py-2 rounded-md transition-all duration-200 hover:bg-[#00849d] hover:text-white focus:bg-[#00849d] focus:text-white hover:shadow-lg hover:shadow-[#00849d]/30"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Login separado no canto direito */}
        <div className="flex-shrink-0">
          <Link
            to="/parceria/login"
            className="bg-[#00849d] hover:bg-white hover:text-[#00849d] text-white text-base font-bold px-6 py-2 rounded-lg transition-all duration-200 border-2 border-[#00849d] hover:border-[#00849d] shadow-lg shadow-[#00849d]/30"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

