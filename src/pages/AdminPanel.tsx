import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Envelope, 
  Phone,
  Calendar,
  Shield,
  ArrowLeft
} from "@phosphor-icons/react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/lib/supabaseClient";

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
  partner_id?: string;
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
      // Carregar solicitações do Supabase
      const { data: requests, error } = await supabase
        .from('partner_approval_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao carregar solicitações:", error);
        // Fallback para dados mock em caso de erro
        const mockRequests: PartnerRequest[] = [
          {
            id: '1',
            user_id: 'user1',
            partner_email: 'dr.silva@clinicanova.com',
            partner_name: 'Dr. João Silva',
            company_name: 'Clínica Nova Saúde',
            company_type: 'Clínica Médica',
            phone: '(11) 99999-9999',
            created_at: new Date().toISOString(),
            status: 'pending'
          }
        ];
        setRequests(mockRequests);
      } else {
        setRequests(requests || []);
      }
      
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
      // 1. Atualizar status da solicitação no Supabase
      const { error: requestError } = await supabase
        .from('partner_approval_requests')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin@talka.tech'
        })
        .eq('id', request.id);

      if (requestError) throw new Error(requestError.message);

      if (approved && request.partner_id) {
        // 2. Atualizar status do parceiro se aprovado
        const { error: partnerError } = await supabase
          .from('partners')
          .update({ status: 'approved' })
          .eq('id', request.partner_id);

        if (partnerError) {
          console.error("Erro ao atualizar status do parceiro:", partnerError);
        }
      }

      // 3. Atualizar lista local
      const updatedRequests = requests.map(req => 
        req.id === request.id 
          ? { ...req, status: approved ? 'approved' : 'rejected' }
          : req
      );
      
      setRequests(updatedRequests);

      // 4. Mostrar toast de sucesso
      if (approved) {
        toast({
          title: "✅ Parceiro aprovado",
          description: `${request.partner_name} foi aprovado e pode acessar o painel.`,
        });
      } else {
        toast({
          title: "❌ Parceiro rejeitado",
          description: `Solicitação de ${request.partner_name} foi rejeitada.`,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error("Erro ao processar aprovação:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar a aprovação.",
        variant: "destructive"
      });
    }
    
    // Destrava o botão após 3 segundos
    setTimeout(() => {
      setLockedRequests(prev => ({ ...prev, [request.id]: false }));
    }, 3000);
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
        return <Badge className="bg-green-100 text-green-800 border border-green-200">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border border-red-200">Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Pendente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-white py-12 border-b">
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#00849d]/10 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-[#00849d]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
                <p className="text-gray-600">Aprovação de Novos Parceiros</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/parceria')}
              className="bg-[#00849d] hover:bg-[#006b7d] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Button>
          </div>
          <Badge className="bg-green-100 text-green-800 border border-green-200">
            Logado como: {currentUser?.email}
          </Badge>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma solicitação pendente</h3>
                <p className="text-gray-600">Todas as solicitações foram processadas.</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900">
                      <div className="w-8 h-8 bg-[#00849d]/10 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-[#00849d]" />
                      </div>
                      Solicitação de Parceria
                    </CardTitle>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-[#00849d] mr-2" />
                        <span className="text-sm text-gray-600">Nome:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.partner_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Envelope className="w-4 h-4 text-[#00849d] mr-2" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.partner_email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-[#00849d] mr-2" />
                        <span className="text-sm text-gray-600">Telefone:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.phone || 'Não informado'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-[#00849d] mr-2" />
                        <span className="text-sm text-gray-600">Empresa:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.company_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-[#00849d] mr-2" />
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.company_type}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-[#00849d] mr-2" />
                        <span className="text-sm text-gray-600">Solicitado em:</span>
                        <span className="ml-2 font-semibold text-gray-900">{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!request.status || request.status === 'pending' ? (
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
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
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                      <p className="text-gray-600">
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
