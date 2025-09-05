import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';
import { User, Building, Mail, Phone, Briefcase, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

// URL da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerSignup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    company_type: "",
    phone: ""
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
  if (!formData.name || !formData.email || !formData.password || !formData.company_name || !formData.company_type) {
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
        options: { data: { name: formData.name } }
      });
      if (signUpError) throw new Error(signUpError.message);
      const user = signUpData.user;
      if (!user) throw new Error("Erro ao criar usuário no Supabase.");

      // 2. Inserir dados do parceiro com status PENDENTE
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            password: formData.password, // Não recomendado salvar senha em texto puro, mas segue ordem solicitada
            phone: formData.phone,
            company_name: formData.company_name,
            company_type: formData.company_type,
            created_at: new Date().toISOString(),
            status: 'pending_approval',
            user_id: user.id // Mantém o vínculo com o usuário
          }
        ])
        .select()
        .single();
      if (partnerError) throw new Error(partnerError.message);

      // 3. Disparar email via EmailJS
      try {
        await emailjs.send(
          'service_cuhgms9', // Service ID
          'template_5b83v1q', // Template ID
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.company_name,
            company_type: formData.company_type,
            time: new Date().toLocaleString('pt-BR')
          },
          'vh-KJ6gILHfM7CRpN' // User ID (Public Key)
        );
        console.log('EmailJS: Email de novo parceiro enviado!');
      } catch (emailjsError) {
        console.error('Erro ao enviar email via EmailJS:', emailjsError);
        toast({
          title: '⚠️ Aviso',
          description: 'Solicitação registrada, mas o email de notificação não foi enviado.',
          variant: 'destructive'
        });
      }


      // 3. Enviar notificação para Victor
      try {
        const notificationData = {
          type: 'new_partner_request',
          partner_email: formData.email,
          partner_name: formData.name,
          company_name: formData.company_name,
          company_type: formData.company_type,
          phone: formData.phone,
          user_id: user.id,
          partner_id: partnerData.id,
          created_at: new Date().toISOString()
        };

        const { error: notificationError } = await supabase
          .from('partner_approval_requests')
          .insert([notificationData]);

        if (notificationError) {
          console.error("Erro ao criar notificação:", notificationError);
        }

        // Enviar emails para Victor e admin
        try {
          // Email para Victor
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'new_partner_notification',
              to: 'victor@talka.tech',
              partnerData: {
                name: formData.name,
                email: formData.email,
                company_name: formData.company_name,
                company_type: formData.company_type,
                phone: formData.phone
              }
            }
          });

          // Email para admin
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'new_partner_notification',
              to: 'admin@talka.tech',
              partnerData: {
                name: formData.name,
                email: formData.email,
                company_name: formData.company_name,
                company_type: formData.company_type,
                phone: formData.phone
              }
            }
          });
        } catch (emailError) {
          console.error("Erro ao enviar email:", emailError);
        }

      } catch (notificationErr) {
        console.error("Erro ao enviar notificação:", notificationErr);
      }

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
    <div className="min-h-screen bg-gradient-to-b from-[#001e28] via-[#003545] to-[#001e28] text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-[#00849d] shadow-2xl shadow-[#00849d]/20 bg-[#001e28]/90 backdrop-blur-sm text-white">
            <CardHeader className="text-center pb-2">
              <img src="/logo.png" alt="Conciarge Saúde" className="w-16 h-16 mx-auto mb-2" onError={e => {
                const fallback = "/logo.png";
                const img = e.target as HTMLImageElement;
                if (img && img.src && !img.src.endsWith(fallback)) {
                  img.src = fallback;
                }
              }} />
              <CardTitle className="text-3xl mb-1 text-white">Cadastro de Parceiro</CardTitle>
              <p className="text-gray-300 pt-1 mb-0">
                Já tem uma conta?{" "}
                <Link to="/parceria/login" className="text-[#00849d] font-bold hover:text-white transition-colors duration-200 hover:underline">
                  Faça login
                </Link>
              </p>
            </CardHeader>
            <CardContent>
              {showConfirmEmail ? (
                <div className="pt-4 pb-12 text-center flex flex-col items-center">
                  <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mx-auto mb-3">
                    <path stroke="#00849d" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                  </svg>
                  <h2 className="text-2xl font-bold mb-2 text-[#00849d]">Cadastro Enviado para Aprovação</h2>
                  <p className="text-lg mb-4">Sua solicitação de parceria foi enviada para análise.</p>
                  <div className="bg-[#00849d]/20 border-2 border-[#00849d] rounded-lg p-4 mb-4">
                    <p className="text-base text-[#00849d] mb-2 font-bold">
                      📋 <strong>Próximos passos:</strong>
                    </p>
                    <ol className="text-sm text-white text-left space-y-1">
                      <li>1. Confirme seu e-mail clicando no link enviado para <strong>{formData.email}</strong></li>
                      <li>2. Aguarde a análise da sua solicitação</li>
                      <li>3. Você receberá um e-mail quando sua conta for aprovada</li>
                      <li>4. Após aprovação, poderá acessar o painel de parceiro</li>
                    </ol>
                  </div>
                  <p className="text-base text-muted-foreground">
                    Seu acesso será liberado após a aprovação da equipe responsável.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b-2 border-[#00849d] pb-2 text-[#00849d]">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white font-medium">Nome Completo *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Seu nome completo"
                            required
                            className="pl-10 bg-[#001e28] border-2 border-[#00849d]/40 text-white placeholder:text-gray-400 focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white font-medium">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="pl-10 bg-[#001e28] border-2 border-[#00849d]/40 text-white placeholder:text-gray-400 focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-white font-medium">Senha *</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required
                          className="pl-10 pr-10 bg-[#001e28] border-2 border-[#00849d]/40 text-white placeholder:text-gray-400 focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00849d] hover:text-white transition-colors duration-200"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white font-medium">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="pl-10 bg-[#001e28] border-2 border-[#00849d]/40 text-white placeholder:text-gray-400 focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Dados da Empresa */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b-2 border-[#00849d] pb-2 text-[#00849d]">Dados da Empresa</h3>
                    <div>
                      <Label htmlFor="company_name" className="text-white font-medium">Nome da Empresa *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d]" />
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          placeholder="Nome da sua empresa"
                          required
                          className="pl-10 bg-[#001e28] border-2 border-[#00849d]/40 text-white placeholder:text-gray-400 focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="company_type" className="text-white font-medium">Tipo de Empresa *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00849d] z-10" />
                        <Select value={formData.company_type} onValueChange={(value) => handleInputChange('company_type', value)}>
                          <SelectTrigger className="pl-10 bg-[#001e28] border-2 border-[#00849d]/40 text-white focus:border-[#00849d] focus:ring-2 focus:ring-[#00849d]/20">
                            <SelectValue
                              placeholder={<span className="text-gray-400">Selecione o tipo da sua empresa</span>}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-[#001e28] border-2 border-[#00849d]/40">
                            {companyTypes.map((type) => (
                              <SelectItem key={type} value={type} className="text-white hover:bg-[#00849d]/30 focus:bg-[#00849d]/30">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full text-lg py-6 mt-8"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar Conta de Parceiro"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}