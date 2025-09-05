import { useState } from "react";
import { EyeSlash, Eye, ArrowRight, User, Buildings, Envelope, Phone, Briefcase, Key } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

// URL da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function PartnerSignup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    company_type: "",
    phone: "",
    instagram: "",
    website: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);

  const companyTypes = [
    "Clínica Médica",
    "Consultório Médico",
    "Hospital",
    "Empresa de Telemedicina",
    "HealthTech",
    "Profissional de TI em Saúde",
    "Desenvolvedor",
    "Outro"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
  if (!formData.name || !formData.email || !formData.password || !formData.company_name || !formData.company_type || !formData.instagram) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

  if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    
    try {
      // 1. Cadastro Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            name: formData.name 
          }
        }
      });
      
      if (signUpError) throw new Error(signUpError.message);
      const user = signUpData.user;
      if (!user) throw new Error("Erro ao criar usuário no Supabase.");

      // 2. Inserir dados do parceiro com status PENDENTE
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            password: formData.password, // Salvar para referência
            phone: formData.phone,
            company_name: formData.company_name,
            company_type: formData.company_type,
            instagram: formData.instagram,
            website: formData.website,
            status: 'pending_approval'
          }
        ])
        .select()
        .single();
        
      if (partnerError) throw new Error(partnerError.message);

      // 3. Inserir dados na tabela users (para compatibilidade)
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            name: formData.name,
            email: formData.email,
            password_hash: formData.password // Hash seria ideal, mas mantendo compatibilidade
          }
        ]);
        
      if (userError) {
        console.warn("Aviso ao inserir na tabela users:", userError);
      }

      // 4. Criar solicitação de aprovação
      const { error: requestError } = await supabase
        .from('partner_approval_requests')
        .insert([
          {
            type: 'new_partner_request',
            partner_email: formData.email,
            partner_name: formData.name,
            company_name: formData.company_name,
            company_type: formData.company_type,
            phone: formData.phone,
            user_id: user.id,
            partner_id: partnerData.id,
            status: 'pending'
          }
        ]);
        
      if (requestError) {
        console.error("Erro ao criar solicitação de aprovação:", requestError);
      }

      // 5. Enviar email de notificação (opcional - EmailJS)
      try {
        // Aqui você pode configurar EmailJS se necessário
        console.log('Novo parceiro cadastrado:', {
          name: formData.name,
          email: formData.email,
          company: formData.company_name
        });
      } catch (emailError) {
        console.warn("Email de notificação não enviado:", emailError);
      }

      toast({
        title: "✅ Cadastro realizado!",
        description: "Sua solicitação foi enviada para análise.",
      });

      setShowConfirmEmail(true);
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #00849d 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #00849d 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <img src="/logo.png" alt="Conciarge Saúde" className="w-16 h-16 mx-auto mb-4" onError={e => {
                const fallback = "/logo.png";
                const img = e.target as HTMLImageElement;
                if (img && img.src && !img.src.endsWith(fallback)) {
                  img.src = fallback;
                }
              }} />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Cadastro de Parceiro
              </h1>
              <p className="text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/parceria/login" className="font-medium text-[#00849d] hover:text-[#006b7d] transition-colors">
                  Faça login aqui
                </Link>
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                {showConfirmEmail ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cadastro Enviado!</h2>
                    <p className="text-gray-600 mb-6">
                      Sua solicitação de parceria foi enviada para análise.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Próximos passos:
                      </h3>
                      <ol className="space-y-2 text-blue-800">
                        <li className="flex items-start">
                          <span className="font-semibold mr-2">1.</span>
                          <span>Confirme seu e-mail clicando no link enviado para <strong>{formData.email}</strong></span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-semibold mr-2">2.</span>
                          <span>Aguarde a análise da sua solicitação</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-semibold mr-2">3.</span>
                          <span>Você receberá um e-mail quando sua conta for aprovada</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-semibold mr-2">4.</span>
                          <span>Após aprovação, poderá acessar o painel de parceiro</span>
                        </li>
                      </ol>
                    </div>
                    
                    <p className="text-gray-500">
                      Seu acesso será liberado após a aprovação da equipe responsável.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Dados Pessoais */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 border-b-2 border-[#00849d] pb-2">
                        Dados Pessoais
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-gray-700 font-medium">Nome Completo *</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Seu nome completo"
                              required
                              className="pl-10 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="text-gray-700 font-medium">Telefone</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="(11) 99999-9999"
                              className="pl-10 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                        <div className="relative mt-1">
                          <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="pl-10 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="password" className="text-gray-700 font-medium">Senha *</Label>
                        <div className="relative mt-1">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Crie uma senha segura"
                            required
                            className="pl-10 pr-10 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00849d] focus:outline-none transition-colors"
                          >
                            {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dados da Empresa */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 border-b-2 border-[#00849d] pb-2">
                        Dados da Empresa
                      </h3>
                      
                      <div>
                        <Label htmlFor="company_name" className="text-gray-700 font-medium">Nome da Empresa *</Label>
                        <div className="relative mt-1">
                          <Buildings className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            placeholder="Nome da sua empresa"
                            required
                            className="pl-10 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="company_type" className="text-gray-700 font-medium">Tipo de Empresa *</Label>
                        <div className="relative mt-1">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                          <Select value={formData.company_type} onValueChange={(value) => handleInputChange('company_type', value)}>
                            <SelectTrigger className="pl-10 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]">
                              <SelectValue placeholder="Selecione o tipo da sua empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {companyTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="instagram" className="text-gray-700 font-medium">Instagram da Empresa *</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                            <Input
                              id="instagram"
                              value={formData.instagram}
                              onChange={(e) => handleInputChange('instagram', e.target.value)}
                              placeholder="usuarioempresa"
                              required
                              className="pl-8 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="website" className="text-gray-700 font-medium">Site da Empresa</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🌐</span>
                            <Input
                              id="website"
                              value={formData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              placeholder="www.suaempresa.com.br"
                              className="pl-8 border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#00849d] hover:bg-[#006b7d] text-white py-3 text-lg font-semibold"
                    >
                      {isLoading ? 'Criando conta...' : 'Criar Conta de Parceiro'}
                      {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PartnerSignup;