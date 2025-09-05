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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Conciarge Saúde" 
            className="h-16 w-auto mx-auto mb-6"
            onError={e => {
              const fallback = "/logo.png";
              const img = e.target as HTMLImageElement;
              if (img && img.src && !img.src.endsWith(fallback)) {
                img.src = fallback;
              }
            }}
          />
          <h2 className="text-3xl font-bold text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/parceria/cadastro" className="font-medium text-[#00849d] hover:text-[#006d83]">
              Cadastre-se aqui
            </Link>
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          {/* Seletor de tipo de login */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('partner')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'partner'
                  ? 'bg-[#00849d] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Parceiro
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-[#00849d] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="username"
                  className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#00849d] focus:border-[#00849d] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10 block w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#00849d] focus:border-[#00849d] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00849d] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00849d] hover:bg-[#006d83] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
