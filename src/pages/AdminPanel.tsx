import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  ArrowLeft
} from "lucide-react";

interface PartnerRequest {
  id: string;
  user_id: string;
  partner_email: string;
  partner_name: string;
  company_name: string;
  company_type: string;
  phone: string;
  created_at: string;
  status?: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lockedRequests, setLockedRequests] = useState<{[id: string]: boolean}>({});

  useEffect(() => {
    checkAdminAccess();
    loadPendingRequests();
  }, []);

  const checkAdminAccess = async () => {
    // Para o admin panel, vamos assumir que só chega aqui quem fez login como admin
    // A verificação já foi feita no PartnerLogin.tsx
    setCurrentUser({ email: 'admin@talka.tech' } as any);
  };

  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_approval_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (request: PartnerRequest, approved: boolean) => {
  // Trava o botão para esta solicitação
  setLockedRequests(prev => ({ ...prev, [request.id]: true }));
    try {
      if (approved) {
        // Aprovar parceiro - atualizar status na tabela partners
        const { error: updateError } = await supabase
          .from('partners')
          .update({ status: 'approved' })
          .eq('user_id', request.user_id);

        if (updateError) throw updateError;

        // Enviar email de boas-vindas via EmailJS
        try {
          await emailjs.send(
            'service_cuhgms9', // Service ID
            'template_96735kr', // Template ID de boas-vindas
            {
              name: request.partner_name,
              email: request.partner_email,
              company_name: request.company_name
              // Adicione outros campos usados no template, se necessário
            },
            'vh-KJ6gILHfM7CRpN' // User ID (Public Key)
          );
          console.log("EmailJS: Email de boas-vindas enviado para:", request.partner_email);
        } catch (emailjsError) {
          console.error("Erro ao enviar email via EmailJS:", emailjsError);
          toast({
            title: "⚠️ Aviso",
            description: "Parceiro aprovado, mas o email de boas-vindas não foi enviado.",
            variant: "destructive"
          });
        }

        toast({
          title: "✅ Parceiro aprovado",
          description: `${request.partner_name} foi aprovado e pode acessar o painel.`,
        });
      } else {
        // Rejeitar parceiro - atualizar status na tabela partners
        const { error: updateError } = await supabase
          .from('partners')
          .update({ status: 'rejected' })
          .eq('user_id', request.user_id);

        if (updateError) throw updateError;

        // Enviar email de rejeição via EmailJS
        try {
          await emailjs.send(
            'service_cuhgms9', // Service ID
            'template_rejeicao_parceiro', // Novo Template ID para rejeição
            {
              partner_name: request.partner_name,
              partner_email: request.partner_email,
              time: new Date().toLocaleString('pt-BR')
            },
            'vh-KJ6gILHfM7CRpN' // User ID (Public Key)
          );
          console.log("EmailJS: Email de rejeição enviado para:", request.partner_email);
        } catch (emailjsError) {
          console.error("Erro ao enviar email via EmailJS:", emailjsError);
          toast({
            title: "⚠️ Aviso",
            description: "Parceiro rejeitado, mas o email de notificação não foi enviado.",
            variant: "destructive"
          });
        }

        toast({
          title: "❌ Parceiro rejeitado",
          description: `Solicitação de ${request.partner_name} foi rejeitada.`,
          variant: "destructive"
        });
      }

      // Atualizar status da solicitação
      const { error: requestUpdateError } = await supabase
        .from('partner_approval_requests')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser?.email
        })
        .eq('id', request.id);

      if (requestUpdateError) throw requestUpdateError;

      // Recarregar lista
      await loadPendingRequests();

    } catch (error) {
      console.error("Erro ao processar aprovação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a aprovação.",
        variant: "destructive"
      });
    }
    // Destrava o botão após 6 segundos
    setTimeout(() => {
      setLockedRequests(prev => ({ ...prev, [request.id]: false }));
    }, 6000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600/20 text-green-300 border border-green-600/30">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600/20 text-red-300 border border-red-600/30">Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-600/30">Pendente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1833] via-[#101828] to-[#1a2233] text-white flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1833] via-[#101828] to-[#1a2233] text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h1 className="text-3xl font-extrabold text-blue-400">Painel de Administração</h1>
                <p className="text-blue-200">Aprovação de Novos Parceiros</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/parceria')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Button>
          </div>
          <Badge className="bg-green-600/20 text-green-300 border border-green-600/30">
            Logado como: {currentUser?.email}
          </Badge>
        </div>

        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma solicitação pendente</h3>
                <p className="text-blue-200">Todas as solicitações foram processadas.</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 text-blue-400 mr-2" />
                      Solicitação de Parceria
                    </CardTitle>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-blue-300 mr-2" />
                        <span className="text-sm text-blue-200">Nome:</span>
                        <span className="ml-2 font-semibold">{request.partner_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-blue-300 mr-2" />
                        <span className="text-sm text-blue-200">Email:</span>
                        <span className="ml-2 font-semibold">{request.partner_email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-blue-300 mr-2" />
                        <span className="text-sm text-blue-200">Telefone:</span>
                        <span className="ml-2 font-semibold">{request.phone || 'Não informado'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-blue-300 mr-2" />
                        <span className="text-sm text-blue-200">Empresa:</span>
                        <span className="ml-2 font-semibold">{request.company_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-blue-300 mr-2" />
                        <span className="text-sm text-blue-200">Tipo:</span>
                        <span className="ml-2 font-semibold">{request.company_type}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-blue-300 mr-2" />
                        <span className="text-sm text-blue-200">Solicitado em:</span>
                        <span className="ml-2 font-semibold">{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!request.status || request.status === 'pending' ? (
                    <div className="flex gap-4 mt-6 pt-4 border-t border-blue-700/40">
                      <Button
                        onClick={() => handleApproval(request, true)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        disabled={!!lockedRequests[request.id]}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar Parceiro
                      </Button>
                      <Button
                        onClick={() => handleApproval(request, false)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                        disabled={!!lockedRequests[request.id]}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 pt-4 border-t border-blue-700/40 text-center">
                      <p className="text-blue-200">
                        Solicitação já foi {request.status === 'approved' ? 'aprovada' : 'rejeitada'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
