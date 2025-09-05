import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PartnerLogin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'partner' | 'admin'>('partner');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Para admin, verificamos as credenciais específicas
      if (loginType === 'admin') {
        if (formData.email !== 'admin@talka.tech' || formData.password !== 'Talka2025!') {
          toast({
            title: "Acesso negado",
            description: "Credenciais de administrador inválidas.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        // Login direto para admin sem Supabase
        toast({
          title: "Login administrativo realizado!",
          description: "Redirecionando para o painel admin...",
          variant: "default"
        });
        
        setTimeout(() => {
          navigate('/parceria/admin');
        }, 1500);
        setIsLoading(false);
        return;
      }
      
      // Para parceiros, usar Supabase normalmente
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      if (error) {
        if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
          toast({
            title: "Confirme seu e-mail",
            description: "Você precisa confirmar seu e-mail antes de acessar. Verifique sua caixa de entrada e spam para o link de confirmação.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message || "Credenciais inválidas. Verifique seu e-mail e senha.",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (!data.user) throw new Error("Usuário não encontrado ou senha incorreta.");
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o seu painel...",
        variant: "default"
      });
      
      // Login de parceiro normal
      setTimeout(() => {
        navigate('/parceria/painel');
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Verifique seu e-mail e senha.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#001e28] via-[#003545] to-[#001e28] text-white">
      <div className="w-full max-w-md px-4 py-10">
        <div className="bg-[#001e28]/90 rounded-2xl shadow-2xl shadow-[#00849d]/20 border-2 border-[#00849d] p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" alt="Conciarge Saúde" className="w-16 h-16 mb-4" onError={e => {
              const fallback = "/logo.png";
              const img = e.target as HTMLImageElement;
              if (img && img.src && !img.src.endsWith(fallback)) {
                img.src = fallback;
              }
            }} />
            <h1 className="text-3xl font-bold mb-1 text-white">Acesse sua Conta</h1>
            <p className="text-gray-300 text-sm mb-4">
              Não tem uma conta?{' '}
              <Link to="/parceria/cadastro" className="text-[#00849d] font-bold hover:text-white transition-colors duration-200 hover:underline">Cadastre-se</Link>
            </p>
            
            {/* Seletor de tipo de login */}
            <div className="flex gap-2 p-1 bg-[#001e28] border border-[#00849d]/40 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setLoginType('partner')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'partner' 
                    ? 'bg-[#00849d] text-white shadow-lg shadow-[#00849d]/30' 
                    : 'text-gray-300 hover:text-white hover:bg-[#00849d]/20'
                }`}
              >
                Parceiro
              </button>
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'admin' 
                    ? 'bg-[#00849d] text-white shadow-lg shadow-[#00849d]/30' 
                    : 'text-gray-300 hover:text-white hover:bg-[#00849d]/20'
                }`}
              >
                Administrador
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="username"
                  className="pl-10 pr-4 h-14 w-full rounded-lg border-2 border-[#00849d]/40 bg-[#001e28] text-white caret-white placeholder:text-gray-400 placeholder:opacity-90 focus:bg-[#001e28] focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">Senha</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-14 w-full rounded-lg border-2 border-[#00849d]/40 bg-[#001e28] text-white caret-white placeholder:text-gray-400 placeholder:opacity-90 focus:bg-[#001e28] focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20 outline-none transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00849d] hover:text-white transition-colors duration-200 focus:outline-none"
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full text-lg py-6 mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}