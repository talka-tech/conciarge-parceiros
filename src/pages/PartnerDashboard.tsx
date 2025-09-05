import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  CurrencyDollar, 
  Users, 
  TrendUp, 
  Calendar,
  Trophy,
  Download,
  FileText,
  Video,
  ChatCircle,
  Target,
  Lightning,
  Crown,
  CreditCard,
  Money,
  DeviceMobile,
  Plus,
  Trash,
  Check,
  PencilSimple,
  Gear,
  X,
  FloppyDisk,
  ArrowClockwise,
  Clock
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PartnerData {
  id: number;
  name: string;
  companyName: string;
  email: string;
  companyType: string;
  status?: 'pending_approval' | 'approved' | 'rejected';
}

interface PaymentMethod {
  id: number;
  method_type: string;
  details: any;
  is_default: boolean;
  created_at: string;
}

interface Client {
  id?: string; // ID do Supabase
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  status: 'pending_payment' | 'pending_implementation' | 'active';
  implementationPaid: boolean;
}

interface Lead {
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'hot' | 'cold';
  notes: string;
  addedAt: string;
}

const IMPLEMENTATION_FEE = 500.00; // Taxa de implantação

export default function PartnerDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  // --- Estado para métodos de pagamento removido ---
  // const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  // const [showAddPayment, setShowAddPayment] = useState(false);
  // const [newPaymentMethod, setNewPaymentMethod] = useState({...});

  // --- Estado e lógica para clientes ---
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState<Client>({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    value: 0, 
    status: 'pending_payment', 
    implementationPaid: false 
  });
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // --- Estado e lógica para leads ---
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newLead, setNewLead] = useState<Lead>({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    type: 'hot',
    notes: '',
    addedAt: ''
  });

  // Carregar clientes do Supabase
  const loadClientsFromDatabase = async () => {
    if (!partnerData?.id) return;
    
    setIsLoadingClients(true);
    try {
      // Carregar clientes do Supabase
      const { data: clients, error } = await supabase
        .from('partner_clients')
        .select('*')
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao carregar clientes do Supabase:", error);
        // Fallback para localStorage
        const savedClients = localStorage.getItem(`clients_${partnerData.id}`);
        if (savedClients) {
          setClients(JSON.parse(savedClients));
        }
      } else {
        // Converter dados do Supabase para o formato local
        const formattedClients = clients.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          company: client.company || '',
          value: client.value || 0,
          status: client.status,
          implementationPaid: client.implementation_paid || false
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus clientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Carregar clientes do Google Sheets (mantido para compatibilidade)
  const loadClientsFromSheets = async () => {
    // Não carrega automaticamente para evitar erros de toast
    return;
  };

  // --- Estado para edição de cliente ---
  const [editingClientIndex, setEditingClientIndex] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<Client>({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    value: 0, 
    status: 'pending_payment', 
    implementationPaid: false 
  });

  // Remover clientPrice já que agora o parceiro define o valor

  useEffect(() => {
    const checkPartnerStatus = async () => {
      try {
        // 1. Verificar se o usuário está autenticado no Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/parceria/login');
          return;
        }

        // 2. Buscar dados do parceiro no Supabase
        const { data: partnerData, error } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar dados do parceiro:", error);
          toast({
            title: "Conta não encontrada",
            description: "Você precisa criar uma conta de parceiro primeiro.",
            variant: "destructive"
          });
          navigate('/parceria/cadastro');
          return;
        }

        // 3. Verificar status de aprovação
        if (partnerData.status === 'pending_approval') {
          setPartnerData({
            id: partnerData.id,
            name: partnerData.name,
            companyName: partnerData.company_name,
            email: partnerData.email,
            companyType: partnerData.company_type,
            status: partnerData.status
          });
          return;
        }

        if (partnerData.status === 'rejected') {
          toast({
            title: "Conta rejeitada",
            description: "Sua solicitação de parceria foi rejeitada.",
            variant: "destructive"
          });
          navigate('/parceria');
          return;
        }

        if (partnerData.status !== 'approved') {
          navigate('/parceria/cadastro');
          return;
        }

        // Se chegou aqui, está aprovado
        setPartnerData({
          id: partnerData.id,
          name: partnerData.name,
          companyName: partnerData.company_name,
          email: partnerData.email,
          companyType: partnerData.company_type,
          status: partnerData.status
        });

      } catch (error) {
        console.error("Erro ao verificar status do parceiro:", error);
        navigate('/parceria/login');
      }
    };

    checkPartnerStatus();
  }, [navigate, toast]);

  // useEffect para carregar clientes quando partnerData.id estiver disponível
  useEffect(() => {
    if (partnerData?.id) {
      loadClientsFromDatabase();
    }
  }, [partnerData?.id]);

  // Funções de pagamento removidas
  // const loadPaymentMethods = async (partnerId: number) => {...}
  // const handleAddPaymentMethod = async () => {...}
  // const handleDeletePaymentMethod = async (methodId: number) => {...}

  const handleLogout = async () => {
    try {
      // Fazer logout no Supabase
      await supabase.auth.signOut();
      
      // Limpar dados locais
      localStorage.removeItem('partnerData');
      
      // Redirecionar para a página inicial
      navigate('/parceria');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, redireciona
      navigate('/parceria');
    }
  };

  // Função para extrair e formatar o primeiro nome do email
  const getFirstNameFromEmail = (email: string) => {
    if (!email) return '';
    const username = email.split('@')[0];
    // Remove números e caracteres especiais
    const cleanName = username.replace(/[^a-zA-Z]/g, '');
    // Capitaliza a primeira letra e deixa o resto minúsculo
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  };

  if (!partnerData) {
    return <div>Carregando...</div>;
  }

  // Se o parceiro está aguardando aprovação
  if (partnerData.status === 'pending_approval') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1833] via-[#101828] to-[#1a2233] text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#151d2b]/90 border border-amber-700/40 text-white">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-amber-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-amber-400">Aguardando Aprovação</h2>
                <p className="text-lg mb-6 text-amber-200">
                  Olá, <strong>{getFirstNameFromEmail(partnerData.email)}</strong>! 
                  Sua solicitação de parceria foi enviada para aprovação.
                </p>
                <div className="bg-amber-900/20 border border-amber-600/40 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-amber-300 mb-3">Status da Solicitação</h3>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-200">Cadastro realizado</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-200">E-mail confirmado</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-amber-400 mr-2" />
                      <span className="text-amber-200">Aguardando aprovação</span>
                    </div>
                  </div>
                </div>
                <p className="text-blue-200 mb-6">
                  Você receberá um e-mail quando sua conta for aprovada pelo responsável da empresa.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    className="border-amber-600/40 text-amber-300 hover:bg-amber-700/20"
                    onClick={handleLogout}
                  >
                    Sair
                  </Button>
                  <Button 
                    variant="hero" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.location.reload()}
                  >
                    Verificar Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Calcular dados de vendas e comissões
  const totalClientValue = clients.reduce((sum, client) => sum + client.value, 0);
  const currentCommissionRate = totalClientValue >= 50000 ? 30 : 20; // 20% inicial, 30% após 50k
  const totalCommission = totalClientValue * (currentCommissionRate / 100);
  
  const salesData = {
    totalSales: totalClientValue,
    commission: totalCommission,
    commissionRate: currentCommissionRate,
    recurringCommission: 0
  };

  const resources = [
    { title: "Kit de Vendas Completo", type: "PDF", icon: FileText },
    { title: "Apresentação da Solução", type: "PPT", icon: FileText },
    { title: "Vídeo de Demonstração", type: "MP4", icon: Video },
    { title: "Scripts de Qualificação", type: "PDF", icon: ChatCircle },
    { title: "Cases de Sucesso", type: "PDF", icon: Trophy },
    { title: "Materiais de Marketing", type: "ZIP", icon: Download }
  ];

  async function handleAddClient() {
    if (!newClient.name || !newClient.email || !newClient.value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e valor do cliente.",
        variant: "destructive"
      });
      return;
    }

    if (!partnerData?.id) {
      toast({
        title: "Erro",
        description: "Dados do parceiro não encontrados.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoadingClients(true);
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('partner_clients')
        .insert([
          {
            partner_id: partnerData.id,
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            company: newClient.company,
            value: newClient.value,
            status: 'pending_payment',
            implementation_paid: false
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      const newClientFormatted = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        value: data.value,
        status: data.status,
        implementationPaid: data.implementation_paid
      };
      
      const updatedClients = [...clients, newClientFormatted];
      setClients(updatedClients);
      
      setNewClient({ 
        name: '', 
        email: '', 
        phone: '', 
        company: '', 
        value: 0, 
        status: 'pending_payment', 
        implementationPaid: false 
      });

      toast({
        title: "Cliente cadastrado",
        description: "Cliente adicionado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClients(false);
    }
  }

  function handleAddLead() {
    if (!newLead.name || !newLead.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e email do lead.",
        variant: "destructive"
      });
      return;
    }

    const leadWithDate = {
      ...newLead,
      addedAt: new Date().toLocaleDateString('pt-BR')
    };

    setLeads(prev => [...prev, leadWithDate]);
    setNewLead({ 
      name: '', 
      email: '', 
      phone: '', 
      company: '', 
      type: 'hot',
      notes: '',
      addedAt: ''
    });

    toast({
      title: "Lead adicionado",
      description: "Lead cadastrado com sucesso!",
    });
  }

  const handleEditClient = (index: number) => {
    setEditingClientIndex(index);
    setEditingClient(clients[index]);
  };

  const handleSaveEditClient = async () => {
    if (!editingClient.name || !editingClient.email || !editingClient.value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e valor do cliente.",
        variant: "destructive"
      });
      return;
    }

    if (editingClientIndex === null || !editingClient.id) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado para edição.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('partner_clients')
        .update({
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone,
          company: editingClient.company,
          value: editingClient.value,
          status: editingClient.status,
          implementation_paid: editingClient.implementationPaid
        })
        .eq('id', editingClient.id);

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar no estado local
      const updatedClients = clients.map((client, index) => 
        index === editingClientIndex ? editingClient : client
      );
      setClients(updatedClients);
      
      setEditingClientIndex(null);
      setEditingClient({ 
        name: '', 
        email: '', 
        phone: '', 
        company: '', 
        value: 0, 
        status: 'pending_payment', 
        implementationPaid: false 
      });

      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar edição:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingClientIndex(null);
    setEditingClient({ 
      name: '', 
      email: '', 
      phone: '', 
      company: '', 
      value: 0, 
      status: 'pending_payment', 
      implementationPaid: false 
    });
  };

  const handleDeleteClient = async (index: number) => {
    const clientToDelete = clients[index];
    
    if (!clientToDelete.id) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado para remoção.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Deletar do Supabase
      const { error } = await supabase
        .from('partner_clients')
        .delete()
        .eq('id', clientToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar estado local
      const updatedClients = clients.filter((_, i) => i !== index);
      setClients(updatedClients);
      
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao deletar cliente:", error);
      toast({
        title: "Erro",
        description: error.message || "Houve um problema ao remover o cliente.",
        variant: "destructive"
      });
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Função removida - não mais necessária
  };

  const handlePayImplementationFee = async (clientIndex: number) => {
    try {
      // Aqui você integraria com o Stripe para criar o pagamento
      // Por enquanto, vamos simular o pagamento
      
      toast({
        title: "Redirecionando para pagamento",
        description: `Taxa de implantação: R$ ${IMPLEMENTATION_FEE.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
      });

      // Simular pagamento bem-sucedido após alguns segundos
      setTimeout(() => {
        setClients(prev => prev.map((client, index) => 
          index === clientIndex 
            ? { ...client, implementationPaid: true, status: 'active' }
            : client
        ));
        
        toast({
          title: "Pagamento confirmado",
          description: "Taxa de implantação paga! Cliente será notificado.",
        });
      }, 3000);

    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento da taxa de implantação.",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative bg-white py-4 border-b shadow-sm">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #00849d 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #00849d 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.png" alt="Conciarge Saúde" className="w-8 h-8 mr-3" onError={e => {
                const fallback = "/logo.png";
                const img = e.target as HTMLImageElement;
                if (img && img.src && !img.src.endsWith(fallback)) {
                  img.src = fallback;
                }
              }} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel do Parceiro</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {partnerData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-[#00849d] text-white hover:bg-[#006b7d] text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Parceiro Certificado
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{partnerData.name}</p>
                <p className="text-xs text-gray-600">{partnerData.companyName}</p>
              </div>
              <Button size="sm" onClick={handleLogout} className="bg-[#00849d] hover:bg-[#006b7d] text-white text-sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo(a), {getFirstNameFromEmail(partnerData.email)}!
          </h2>
          <p className="text-gray-600">
            Você está pronto para revolucionar o setor de saúde digital. Comece explorando os recursos disponíveis.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vendas Totais</CardTitle>
              <div className="w-8 h-8 bg-[#00849d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00849d]/20 transition-colors duration-300">
                <CurrencyDollar className="h-4 w-4 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">R$ {salesData.totalSales.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Este mês</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Comissão Atual</CardTitle>
              <div className="w-8 h-8 bg-[#00849d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00849d]/20 transition-colors duration-300">
                <TrendUp className="h-4 w-4 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00849d] group-hover:scale-105 transition-transform duration-300">{salesData.commissionRate}%</div>
              <p className="text-xs text-gray-500">
                {salesData.commissionRate === 30 ? 'Nível Premium atingido!' : 'Sobe para 30% aos R$ 50k'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Clientes Ativos</CardTitle>
              <div className="w-8 h-8 bg-[#00849d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00849d]/20 transition-colors duration-300">
                <Users className="h-4 w-4 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">{clients.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-gray-500">de {clients.length} total</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Comissões</CardTitle>
              <div className="w-8 h-8 bg-[#00849d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00849d]/20 transition-colors duration-300">
                <Target className="h-4 w-4 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">R$ {salesData.commission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              <p className="text-xs text-gray-500">Lucro acumulado</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Lucros */}
        <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#00849d]/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#00849d]/20 transition-colors duration-300">
                  <CurrencyDollar className="w-5 h-5 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">Resumo de Lucros</h3>
              </div>
              <Badge className="bg-[#00849d]/10 text-[#00849d] border border-[#00849d]/20 group-hover:bg-[#00849d] group-hover:text-white transition-all duration-300">
                {salesData.commissionRate}% Comissão
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Vendas Totais</p>
                <p className="text-2xl font-bold text-gray-900">R$ {salesData.totalSales.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Comissão Acumulada</p>
                <p className="text-2xl font-bold text-[#00849d]">R$ {salesData.commission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Próxima Meta</p>
                <p className="text-2xl font-bold text-green-600">R$ 50.000</p>
              </div>
            </div>
            
            {/* Barra de Progresso para Meta */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso para 30% de comissão</span>
                <span>{Math.round((salesData.totalSales / 50000) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#00849d] to-[#006b7d] h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min((salesData.totalSales / 50000) * 100, 100)}%`}}
                ></div>
              </div>
              <div className="text-center">
                {salesData.commissionRate === 20 ? (
                  <p className="text-sm text-gray-600">
                    Faltam R$ {(50000 - salesData.totalSales).toLocaleString('pt-BR', {minimumFractionDigits: 2})} para 30% de comissão
                  </p>
                ) : (
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <span className="mr-2">🎉</span>
                    Meta atingida! Você tem 30% de comissão!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 border-0 rounded-xl overflow-hidden">
            <TabsTrigger value="clients" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Clientes</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Leads</TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Recursos</TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Simulação</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Suporte</TabsTrigger>
          </TabsList>
          {/* Nova aba de Clientes */}
          <TabsContent value="clients" className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader>
                <CardTitle className="text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">Adicionar Novo Cliente/Lead</CardTitle>
                <p className="text-gray-600 mt-2">Cadastre um novo cliente ou lead para acompanhar seu funil de vendas.</p>
              </CardHeader>
              <CardContent>
                {/* Sub-abas para Cliente e Lead */}
                <Tabs defaultValue="client" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 border-0">
                    <TabsTrigger value="client" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Cliente</TabsTrigger>
                    <TabsTrigger value="lead" className="data-[state=active]:bg-[#00849d] data-[state=active]:text-white text-gray-600">Lead</TabsTrigger>
                  </TabsList>
                  
                  {/* Formulário de Cliente */}
                  <TabsContent value="client">
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddClient(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Nome do Cliente</Label>
                          <Input 
                            required 
                            value={newClient.name} 
                            onChange={e => setNewClient(prev => ({...prev, name: e.target.value}))} 
                            placeholder="Nome completo" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Email do Cliente</Label>
                          <Input 
                            required 
                            type="email" 
                            value={newClient.email} 
                            onChange={e => setNewClient(prev => ({...prev, email: e.target.value}))} 
                            placeholder="email@cliente.com" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Telefone</Label>
                          <Input 
                            value={newClient.phone} 
                            onChange={e => setNewClient(prev => ({...prev, phone: e.target.value}))} 
                            placeholder="(99) 99999-9999" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Empresa</Label>
                          <Input 
                            value={newClient.company} 
                            onChange={e => setNewClient(prev => ({...prev, company: e.target.value}))} 
                            placeholder="Nome da empresa" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700">Valor do Cliente (R$)</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          required 
                          value={newClient.value || ''} 
                          onChange={e => setNewClient(prev => ({...prev, value: parseFloat(e.target.value) || 0}))} 
                          placeholder="Ex: 1500.00" 
                          className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-gray-700 text-lg font-semibold">Valor definido:</span>
                        <span className="text-2xl font-bold text-[#00849d]">R$ {newClient.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        <Badge className="bg-green-100 text-green-800 border border-green-200 ml-2">Personalizado</Badge>
                      </div>
                      <Button type="submit" className="bg-[#00849d] hover:bg-[#006b7d] text-white mt-4">Cadastrar Cliente</Button>
                    </form>
                  </TabsContent>

                  {/* Formulário de Lead */}
                  <TabsContent value="lead">
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddLead(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Nome do Lead</Label>
                          <Input 
                            required 
                            value={newLead.name} 
                            onChange={e => setNewLead(prev => ({...prev, name: e.target.value}))} 
                            placeholder="Nome completo" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Email do Lead</Label>
                          <Input 
                            required 
                            type="email" 
                            value={newLead.email} 
                            onChange={e => setNewLead(prev => ({...prev, email: e.target.value}))} 
                            placeholder="email@lead.com" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Telefone</Label>
                          <Input 
                            value={newLead.phone} 
                            onChange={e => setNewLead(prev => ({...prev, phone: e.target.value}))} 
                            placeholder="(99) 99999-9999" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Empresa</Label>
                          <Input 
                            value={newLead.company} 
                            onChange={e => setNewLead(prev => ({...prev, company: e.target.value}))} 
                            placeholder="Nome da empresa" 
                            className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700">Tipo de Lead</Label>
                        <Select value={newLead.type} onValueChange={(value: 'hot' | 'cold') => setNewLead(prev => ({...prev, type: value}))}>
                          <SelectTrigger className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hot">🔥 Lead Quente</SelectItem>
                            <SelectItem value="cold">❄️ Lead Frio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-700">Observações</Label>
                        <Input 
                          value={newLead.notes} 
                          onChange={e => setNewLead(prev => ({...prev, notes: e.target.value}))} 
                          placeholder="Observações sobre o lead..." 
                          className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d]"
                        />
                      </div>
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white mt-4">Cadastrar Lead</Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">Clientes Cadastrados</CardTitle>
                    <p className="text-gray-600 mt-2">Lista de clientes cadastrados no sistema.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum cliente cadastrado ainda.</p>
                    <p className="text-sm mt-2">Cadastre o primeiro cliente usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-700 border-b border-gray-200">
                          <th className="py-3 px-4 font-semibold">Nome</th>
                          <th className="py-3 px-4 font-semibold">Email</th>
                          <th className="py-3 px-4 font-semibold">Empresa</th>
                          <th className="py-3 px-4 font-semibold">Valor</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((c, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            {editingClientIndex === i ? (
                              // Modo de edição
                              <>
                                <td className="py-3 px-4">
                                  <Input 
                                    value={editingClient.name} 
                                    onChange={e => setEditingClient(prev => ({...prev, name: e.target.value}))}
                                    className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d] text-sm h-8"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <Input 
                                    value={editingClient.email} 
                                    onChange={e => setEditingClient(prev => ({...prev, email: e.target.value}))}
                                    className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d] text-sm h-8"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <Input 
                                    value={editingClient.company} 
                                    onChange={e => setEditingClient(prev => ({...prev, company: e.target.value}))}
                                    className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d] text-sm h-8"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <Input 
                                    type="number"
                                    value={editingClient.value || ''} 
                                    onChange={e => setEditingClient(prev => ({...prev, value: parseFloat(e.target.value) || 0}))}
                                    className="border-gray-300 focus:border-[#00849d] focus:ring-[#00849d] text-sm h-8"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  {c.status === 'pending_payment' && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Pendente Pagamento</Badge>
                                  )}
                                  {c.status === 'pending_implementation' && (
                                    <Badge className="bg-orange-100 text-orange-800 border border-orange-200">Pendente Implantação</Badge>
                                  )}
                                  {c.status === 'active' && (
                                    <Badge className="bg-green-100 text-green-800 border border-green-200">Ativo</Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      onClick={handleSaveEditClient}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs p-1 h-7 w-7"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs p-1 h-7 w-7"
                                      onClick={handleCancelEdit}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              // Modo de visualização
                              <>
                                <td className="py-3 px-4 text-gray-900">{c.name}</td>
                                <td className="py-3 px-4 text-gray-600">{c.email}</td>
                                <td className="py-3 px-4 text-gray-600">{c.company}</td>
                                <td className="py-3 px-4 text-gray-900 font-semibold">R$ {c.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="py-3 px-4">
                                  {c.status === 'pending_payment' && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Pendente Pagamento</Badge>
                                  )}
                                  {c.status === 'pending_implementation' && (
                                    <Badge className="bg-orange-100 text-orange-800 border border-orange-200">Pendente Implantação</Badge>
                                  )}
                                  {c.status === 'active' && (
                                    <Badge className="bg-green-100 text-green-800 border border-green-200">Ativo</Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-1">
                                    {c.status === 'pending_implementation' && !c.implementationPaid && (
                                      <Button 
                                        size="sm" 
                                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs mr-1"
                                        onClick={() => handlePayImplementationFee(i)}
                                      >
                                        Pagar Taxa
                                      </Button>
                                    )}
                                    {c.status === 'active' && (
                                      <Badge className="bg-green-100 text-green-800 border border-green-200 mr-1">✓ Ativo</Badge>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs p-1 h-7 w-7"
                                      onClick={() => handleEditClient(i)}
                                    >
                                      <PencilSimple className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-red-300 text-red-600 hover:bg-red-50 text-xs p-1 h-7 w-7"
                                      onClick={() => handleDeleteClient(i)}
                                    >
                                      <Trash className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
        </TabsContent>

          {/* Nova aba de Leads */}
          <TabsContent value="leads" className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader>
                <CardTitle className="text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">Gerenciar Leads</CardTitle>
                <p className="text-gray-600 mt-2">Acompanhe seus leads quentes e frios para conversão em clientes.</p>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum lead cadastrado ainda.</p>
                    <p className="text-sm mt-2">Cadastre leads usando a aba "Clientes" → "Lead".</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Leads Quentes */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-3 flex items-center">
                        🔥 Leads Quentes ({leads.filter(l => l.type === 'hot').length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.filter(l => l.type === 'hot').map((lead, i) => (
                          <Card key={i} className="border border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                                <Badge className="bg-orange-100 text-orange-800 border border-orange-200">🔥 Quente</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">📧 {lead.email}</p>
                              <p className="text-sm text-gray-600 mb-1">📱 {lead.phone}</p>
                              <p className="text-sm text-gray-600 mb-2">🏢 {lead.company}</p>
                              {lead.notes && (
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border mb-2">💬 {lead.notes}</p>
                              )}
                              <p className="text-xs text-gray-400">Adicionado: {lead.addedAt}</p>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                  Converter
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs">
                                  Editar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Leads Frios */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                        ❄️ Leads Frios ({leads.filter(l => l.type === 'cold').length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.filter(l => l.type === 'cold').map((lead, i) => (
                          <Card key={i} className="border border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                                <Badge className="bg-blue-100 text-blue-800 border border-blue-200">❄️ Frio</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">📧 {lead.email}</p>
                              <p className="text-sm text-gray-600 mb-1">📱 {lead.phone}</p>
                              <p className="text-sm text-gray-600 mb-2">🏢 {lead.company}</p>
                              {lead.notes && (
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border mb-2">💬 {lead.notes}</p>
                              )}
                              <p className="text-xs text-gray-400">Adicionado: {lead.addedAt}</p>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
                                  Aquecer
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs">
                                  Remover
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
                <CardHeader>
                  <CardTitle>Primeiros Passos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center p-4 border border-blue-700/40 rounded-lg bg-[#101828]/80">
                    <div className="w-8 h-8 bg-blue-600/80 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Baixar Kit de Vendas</p>
                      <p className="text-sm text-blue-200">Materiais essenciais para apresentações</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 border border-blue-700/40 rounded-lg bg-[#101828]/80">
                    <div className="w-8 h-8 bg-blue-600/80 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Configurar sua conta com desconto</p>
                      <p className="text-sm text-blue-200">70% de desconto para demonstrações</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 border border-blue-700/40 rounded-lg bg-[#101828]/80">
                    <div className="w-8 h-8 bg-blue-600/80 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Contatar primeiro lead</p>
                      <p className="text-sm text-blue-200">Começar vendas qualificadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
                <CardHeader>
                  <CardTitle>Estrutura de Comissões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[#101828]/80 border border-blue-700/40 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Comissão Inicial</span>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border border-blue-600/30">20%</Badge>
                    </div>
                    <p className="text-sm text-blue-200">Em todas as vendas e renovações</p>
                  </div>
                  <div className="p-4 bg-[#101828]/80 border border-blue-700/40 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Desconto Plataforma</span>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border border-blue-600/30">70%</Badge>
                    </div>
                    <p className="text-sm text-blue-200">Para demonstrações aos clientes</p>
                  </div>
                  <div className="p-4 bg-[#101828]/80 border border-blue-700/40 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Após R$ 50k</span>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300 border border-green-600/30">30%</Badge>
                    </div>
                    <p className="text-sm text-green-200">Comissão premium permanente</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-[#00849d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00849d]/20 transition-all duration-300 group-hover:scale-110">
                          <Icon className="w-6 h-6 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-200 group-hover:bg-[#00849d] group-hover:text-white transition-all duration-300">{resource.type}</Badge>
                      </div>
                      <CardTitle className="text-lg text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#00849d] hover:bg-[#006b7d] text-white transform transition-all duration-300 group-hover:scale-105">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Nova aba de Simulação */}
          <TabsContent value="simulation" className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">
                  <TrendUp className="w-5 h-5 text-[#00849d] mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Simulação de Evolução - Programa de Parceiros
                </CardTitle>
                <p className="text-gray-600 mt-2">Veja como suas vendas impactam seus ganhos mensais</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Nível Atual */}
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200 mb-2">
                      Nível Atual
                    </Badge>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {salesData.commissionRate === 20 ? "Iniciante" : "Premium"}
                    </h4>
                    <p className="text-3xl font-bold text-[#00849d] mb-2">{salesData.commissionRate}%</p>
                    <p className="text-sm text-gray-600">
                      R$ {salesData.totalSales.toLocaleString('pt-BR', {minimumFractionDigits: 2})} vendidos
                    </p>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                      R$ {salesData.commission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-gray-500">ganho atual</p>
                  </div>

                  {/* Próximo Nível */}
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Badge className="bg-green-100 text-green-800 border border-green-200 mb-2">
                      Próximo Nível
                    </Badge>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium</h4>
                    <p className="text-3xl font-bold text-green-600 mb-2">30%</p>
                    <p className="text-sm text-gray-600 mb-2">R$ 50.000 vendidos</p>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                      R$ {(50000 * 0.30).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-gray-500">ganho potencial</p>
                  </div>

                  {/* Diferença */}
                  <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <Badge className="bg-orange-100 text-orange-800 border border-orange-200 mb-2">
                      Diferença
                    </Badge>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Ganho Extra</h4>
                    <p className="text-3xl font-bold text-orange-600 mb-2">+10%</p>
                    <p className="text-sm text-gray-600 mb-2">ao atingir R$ 50k</p>
                    <p className="text-lg font-semibold text-orange-600 mt-2">
                      +R$ {((50000 * 0.30) - (50000 * 0.20)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-gray-500">ganho adicional</p>
                  </div>
                </div>

                {/* Projeção Mensal */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">1 Cliente/Mês</p>
                    <p className="text-lg font-bold text-gray-900">R$ 1.500</p>
                    <p className="text-xs text-[#00849d]">R$ {(1500 * (salesData.commissionRate/100)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">3 Clientes/Mês</p>
                    <p className="text-lg font-bold text-gray-900">R$ 4.500</p>
                    <p className="text-xs text-[#00849d]">R$ {(4500 * (salesData.commissionRate/100)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">5 Clientes/Mês</p>
                    <p className="text-lg font-bold text-gray-900">R$ 7.500</p>
                    <p className="text-xs text-[#00849d]">R$ {(7500 * (salesData.commissionRate/100)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">10 Clientes/Mês</p>
                    <p className="text-lg font-bold text-gray-900">R$ 15.000</p>
                    <p className="text-xs text-green-600">R$ {(15000 * 0.30).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês*</p>
                    <p className="text-xs text-green-600">*Nível Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            {/* Suporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#00849d]/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#00849d]/20 transition-all duration-300 group-hover:scale-110">
                      <ChatCircle className="w-6 h-6 text-[#00849d] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-gray-900 group-hover:text-[#00849d] transition-colors duration-300">Contato Direto</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-[#00849d]/5 border border-[#00849d]/20 rounded-lg">
                    <div className="w-16 h-16 bg-[#00849d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChatCircle className="w-8 h-8 text-[#00849d]" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Equipe de Parcerias</h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      Para questões sobre vendas, comissões e suporte comercial
                    </p>
                    <Button 
                      className="bg-[#00849d] hover:bg-[#006b7d] text-white w-full"
                      onClick={() => window.open('mailto:contato@converseia.com?subject=Dúvida Programa de Parceiros', '_blank')}
                    >
                      contato@converseia.com
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110">
                      <FileText className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-gray-900 group-hover:text-green-600 transition-colors duration-300">Suporte Técnico</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Central de Tickets</h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      Para problemas técnicos, implementação e configurações
                    </p>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                      onClick={() => {
                        toast({
                          title: "Redirecionando...",
                          description: "Abrindo central de tickets em nova aba",
                        });
                        // Aqui você pode redirecionar para o sistema de tickets
                        setTimeout(() => {
                          window.open('https://suporte.converseia.com', '_blank');
                        }, 1000);
                      }}
                    >
                      Abrir Ticket de Suporte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}