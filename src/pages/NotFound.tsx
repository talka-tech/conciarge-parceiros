import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1833] via-[#101828] to-[#1a2233] text-white">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold mb-4 text-blue-400 drop-shadow-glow">404</h1>
        <p className="text-2xl text-blue-200 mb-4">Oops! Página não encontrada</p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline text-lg">
          Voltar para o início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
