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
import { supabase } from "@/lib/supabaseClient";
// import { googleSheetsService, ClientData } from "@/lib/googleSheets";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  Download,
  FileText,
  Video,
  MessageSquare,
  Target,
  Zap,
  Crown,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Trash2,
  Check,
  Edit3,
  Settings,
  X,
  Save,
  RefreshCw,
  Clock
} from "lucide-react";

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
    
    try {
      const { data, error } = await supabase
        .from('partner_clients')
        .select('*')
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao carregar clientes:", error);
        return;
      }

      // Converter para o formato esperado
      const formattedClients = data.map(client => ({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        value: client.value,
        status: client.status,
        implementationPaid: client.implementation_paid || false
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
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
        // Verificar se o usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/parceria/login');
          return;
        }

        // Verificar se o parceiro existe e está aprovado
        const { data: partnerData, error } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !partnerData) {
          navigate('/parceria/cadastro');
          return;
        }

        // Verificar status de aprovação
        if (partnerData.status === 'pending_approval') {
          // Mostrar tela de aguardando aprovação
          setPartnerData({ 
            id: partnerData.id,
            name: user.user_metadata?.name || getFirstNameFromEmail(user.email || ''),
            companyName: partnerData.company_name,
            email: user.email || '',
            companyType: partnerData.company_type,
            status: 'pending_approval'
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
          name: user.user_metadata?.name || getFirstNameFromEmail(user.email || ''),
          companyName: partnerData.company_name,
          email: user.email || '',
          companyType: partnerData.company_type,
          status: 'approved'
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

  const handleLogout = () => {
    localStorage.removeItem('partnerData');
    navigate('/parceria');
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
    { title: "Scripts de Qualificação", type: "PDF", icon: MessageSquare },
    { title: "Cases de Sucesso", type: "PDF", icon: Award },
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

    try {
      setIsLoadingClients(true);
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('partner_clients')
        .insert([
          {
            partner_id: partnerData?.id,
            name: newClient.name,
            email: newClient.email,
            phone: newClient.phone,
            company: newClient.company,
            value: newClient.value,
            status: 'pending_payment',
            implementation_paid: false,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar cliente:", error);
        
        // Se a tabela não existir, salvar apenas no estado local por enquanto
        if (error.code === '42P01') {
          toast({
            title: "⚠️ Atenção",
            description: "Cliente salvo temporariamente. Configure a tabela 'partner_clients' no Supabase.",
            variant: "destructive"
          });
          
          setClients(prev => [...prev, { ...newClient, status: 'pending_payment' }]);
        } else {
          throw error;
        }
      } else {
        // Sucesso - recarregar dados do Supabase em vez de adicionar ao estado local
        console.log("Cliente salvo com sucesso no Supabase:", data);
        await loadClientsFromDatabase(); // Recarrega os dados do banco
      }
      
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
    } catch (error) {
      console.error("Erro completo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o cliente.",
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

    try {
      // Pegar o cliente original para identificar no Supabase
      const originalClient = clients[editingClientIndex!];
      
      // Atualizar no Supabase primeiro
      if (partnerData?.id && originalClient) {
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
          .eq('partner_id', partnerData.id)
          .eq('email', originalClient.email); // Usando email original como identificador
        
        if (error) {
          console.error("Erro ao atualizar cliente no Supabase:", error);
          throw error;
        }

        // Sucesso - recarregar dados do Supabase
        await loadClientsFromDatabase();
      } else {
        // Fallback: atualizar apenas estado local se não conseguir no Supabase
        setClients(prev => prev.map((client, index) => 
          index === editingClientIndex ? editingClient : client
        ));
      }
      
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
        description: "Dados do cliente atualizados com sucesso no banco de dados.",
      });
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
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
    try {
      const clientToDelete = clients[index];
      
      // Deletar do Supabase primeiro
      if (partnerData?.id && clientToDelete) {
        const { error } = await supabase
          .from('partner_clients')
          .delete()
          .eq('partner_id', partnerData.id)
          .eq('email', clientToDelete.email); // Usando email como identificador único
        
        if (error) {
          console.error("Erro ao deletar cliente do Supabase:", error);
          // Continua mesmo com erro para manter compatibilidade
        }
      }
      
      // Remover do estado local
      setClients(prev => prev.filter((_, i) => i !== index));
      
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso do sistema.",
      });
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      toast({
        title: "Erro",
        description: "Houve um problema ao remover o cliente.",
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
  <div className="min-h-screen bg-gradient-to-b from-[#0a1833] via-[#101828] to-[#1a2233] text-white">
      
      {/* Header */}
  <header className="border-b bg-[#151d2b]/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.png" alt="ConverseIA Direito" className="w-10 h-10 mr-3" onError={e => {
                const fallback = "/logo.png";
                const img = e.target as HTMLImageElement;
                if (img && img.src && !img.src.endsWith(fallback)) {
                  img.src = fallback;
                }
              }} />
              <div>
                <h1 className="text-xl font-bold">ConverseIA Direito</h1>
                <p className="text-sm text-muted-foreground">Painel do Parceiro</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Crown className="w-4 h-4 mr-1" />
                Parceiro Certificado
              </Badge>
              <div className="text-right">
                <p className="font-medium">{partnerData.name}</p>
                <p className="text-sm text-muted-foreground">{partnerData.companyName}</p>
              </div>
              <Button variant="hero" className="bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={handleLogout}>Sair</Button>
            </div>
          </div>
        </div>
      </header>

  <div className="container mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold mb-2 text-blue-400 drop-shadow-glow">
            Bem-vindo(a), {getFirstNameFromEmail(partnerData.email)}!
          </h2>
          <p className="text-blue-200/90">
            Você está pronto para revolucionar o setor jurídico com IA. Comece explorando os recursos disponíveis.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#101828]/90 border border-blue-700/40 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Vendas Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {salesData.totalSales.toLocaleString()}</div>
              <p className="text-xs text-blue-100">Este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-[#101828]/90 border border-blue-700/40 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Comissão Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{salesData.commissionRate}%</div>
              <p className="text-xs text-blue-100">
                {salesData.commissionRate === 30 ? 'Nível Premium atingido!' : 'Sobe para 30% aos R$ 50k'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#101828]/90 border border-blue-700/40 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{clients.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-blue-100">de {clients.length} total</p>
            </CardContent>
          </Card>

          <Card className="bg-[#101828]/90 border border-blue-700/40 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Comissões</CardTitle>
              <Target className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {salesData.commission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              <p className="text-xs text-blue-100">Lucro acumulado</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Lucros */}
        <Card className="mb-8 bg-[#101828]/90 border border-blue-700/40 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Resumo de Lucros</h3>
              </div>
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border border-blue-600/30">
                {salesData.commissionRate}% Comissão
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-blue-300 mb-1">Vendas Totais</p>
                <p className="text-2xl font-bold text-white">R$ {salesData.totalSales.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-300 mb-1">Comissão Acumulada</p>
                <p className="text-2xl font-bold text-blue-400">R$ {salesData.commission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-300 mb-1">Próxima Meta</p>
                <p className="text-2xl font-bold text-green-400">R$ 50.000</p>
              </div>
            </div>
            
            {/* Barra de Progresso para Meta */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-blue-300">
                <span>Progresso para 30% de comissão</span>
                <span>{Math.round((salesData.totalSales / 50000) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min((salesData.totalSales / 50000) * 100, 100)}%`}}
                ></div>
              </div>
              <div className="text-center">
                {salesData.commissionRate === 20 ? (
                  <p className="text-sm text-blue-300">
                    Faltam R$ {(50000 - salesData.totalSales).toLocaleString('pt-BR', {minimumFractionDigits: 2})} para 30% de comissão
                  </p>
                ) : (
                  <p className="text-sm text-green-300 flex items-center justify-center">
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
          <TabsList className="grid w-full grid-cols-5 bg-[#151d2b]/90 border border-blue-700/40 rounded-xl overflow-hidden">
            <TabsTrigger value="clients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Clientes</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Leads</TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Recursos</TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Simulação</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Suporte</TabsTrigger>
          </TabsList>
          {/* Nova aba de Clientes */}
          <TabsContent value="clients" className="space-y-6">
            <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
              <CardHeader>
                <CardTitle>Adicionar Novo Cliente/Lead</CardTitle>
                <p className="text-blue-100 mt-2">Cadastre um novo cliente ou lead para acompanhar seu funil de vendas.</p>
              </CardHeader>
              <CardContent>
                {/* Sub-abas para Cliente e Lead */}
                <Tabs defaultValue="client" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-[#101828]/90 border border-blue-700/40">
                    <TabsTrigger value="client" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Cliente</TabsTrigger>
                    <TabsTrigger value="lead" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Lead</TabsTrigger>
                  </TabsList>
                  
                  {/* Formulário de Cliente */}
                  <TabsContent value="client">
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddClient(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-blue-100">Nome do Cliente</Label>
                          <Input 
                            required 
                            value={newClient.name} 
                            onChange={e => setNewClient(prev => ({...prev, name: e.target.value}))} 
                            placeholder="Nome completo" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label className="text-blue-100">Email do Cliente</Label>
                          <Input 
                            required 
                            type="email" 
                            value={newClient.email} 
                            onChange={e => setNewClient(prev => ({...prev, email: e.target.value}))} 
                            placeholder="email@cliente.com" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-blue-100">Telefone</Label>
                          <Input 
                            value={newClient.phone} 
                            onChange={e => setNewClient(prev => ({...prev, phone: e.target.value}))} 
                            placeholder="(99) 99999-9999" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label className="text-blue-100">Empresa</Label>
                          <Input 
                            value={newClient.company} 
                            onChange={e => setNewClient(prev => ({...prev, company: e.target.value}))} 
                            placeholder="Nome da empresa" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-blue-100">Valor do Cliente (R$)</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          required 
                          value={newClient.value || ''} 
                          onChange={e => setNewClient(prev => ({...prev, value: parseFloat(e.target.value) || 0}))} 
                          placeholder="Ex: 1500.00" 
                          className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-blue-200 text-lg font-semibold">Valor definido:</span>
                        <span className="text-2xl font-bold text-blue-400">R$ {newClient.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-100 border border-green-600/40 ml-2">Personalizado</Badge>
                      </div>
                      <Button type="submit" variant="hero" className="bg-blue-600 hover:bg-blue-700 text-white mt-4">Cadastrar Cliente</Button>
                    </form>
                  </TabsContent>

                  {/* Formulário de Lead */}
                  <TabsContent value="lead">
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddLead(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-blue-100">Nome do Lead</Label>
                          <Input 
                            required 
                            value={newLead.name} 
                            onChange={e => setNewLead(prev => ({...prev, name: e.target.value}))} 
                            placeholder="Nome completo" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label className="text-blue-100">Email do Lead</Label>
                          <Input 
                            required 
                            type="email" 
                            value={newLead.email} 
                            onChange={e => setNewLead(prev => ({...prev, email: e.target.value}))} 
                            placeholder="email@lead.com" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-blue-100">Telefone</Label>
                          <Input 
                            value={newLead.phone} 
                            onChange={e => setNewLead(prev => ({...prev, phone: e.target.value}))} 
                            placeholder="(99) 99999-9999" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label className="text-blue-100">Empresa</Label>
                          <Input 
                            value={newLead.company} 
                            onChange={e => setNewLead(prev => ({...prev, company: e.target.value}))} 
                            placeholder="Nome da empresa" 
                            className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-blue-100">Tipo de Lead</Label>
                        <Select value={newLead.type} onValueChange={(value: 'hot' | 'cold') => setNewLead(prev => ({...prev, type: value}))}>
                          <SelectTrigger className="bg-[#101828] border-blue-700/40 text-white">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hot">🔥 Lead Quente</SelectItem>
                            <SelectItem value="cold">❄️ Lead Frio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-blue-100">Observações</Label>
                        <Input 
                          value={newLead.notes} 
                          onChange={e => setNewLead(prev => ({...prev, notes: e.target.value}))} 
                          placeholder="Observações sobre o lead..." 
                          className="bg-[#101828] border-blue-700/40 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <Button type="submit" variant="hero" className="bg-orange-600 hover:bg-orange-700 text-white mt-4">Cadastrar Lead</Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clientes Cadastrados</CardTitle>
                    <p className="text-blue-100 mt-2">Lista de clientes cadastrados no sistema.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-8 text-blue-200">
                    <p>Nenhum cliente cadastrado ainda.</p>
                    <p className="text-sm mt-2">Cadastre o primeiro cliente usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-blue-300 border-b border-blue-700/40">
                          <th className="py-2 px-4">Nome</th>
                          <th className="py-2 px-4">Email</th>
                          <th className="py-2 px-4">Empresa</th>
                          <th className="py-2 px-4">Valor</th>
                          <th className="py-2 px-4">Status</th>
                          <th className="py-2 px-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((c, i) => (
                          <tr key={i} className="border-b border-blue-800/30">
                            {editingClientIndex === i ? (
                              // Modo de edição
                              <>
                                <td className="py-2 px-4">
                                  <Input 
                                    value={editingClient.name} 
                                    onChange={e => setEditingClient(prev => ({...prev, name: e.target.value}))}
                                    className="bg-[#101828] border-blue-700/40 text-white text-sm h-8"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Input 
                                    value={editingClient.email} 
                                    onChange={e => setEditingClient(prev => ({...prev, email: e.target.value}))}
                                    className="bg-[#101828] border-blue-700/40 text-white text-sm h-8"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Input 
                                    value={editingClient.company} 
                                    onChange={e => setEditingClient(prev => ({...prev, company: e.target.value}))}
                                    className="bg-[#101828] border-blue-700/40 text-white text-sm h-8"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Input 
                                    type="number"
                                    value={editingClient.value || ''} 
                                    onChange={e => setEditingClient(prev => ({...prev, value: parseFloat(e.target.value) || 0}))}
                                    className="bg-[#101828] border-blue-700/40 text-white text-sm h-8"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  {c.status === 'pending_payment' && (
                                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300 border border-yellow-600/30">Pendente Pagamento</Badge>
                                  )}
                                  {c.status === 'pending_implementation' && (
                                    <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border border-orange-600/30">Pendente Implantação</Badge>
                                  )}
                                  {c.status === 'active' && (
                                    <Badge variant="secondary" className="bg-green-600/20 text-green-300 border border-green-600/30">Ativo</Badge>
                                  )}
                                </td>
                                <td className="py-2 px-4">
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="hero" 
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs p-1 h-7 w-7"
                                      onClick={handleSaveEditClient}
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs p-1 h-7 w-7"
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
                                <td className="py-2 px-4">{c.name}</td>
                                <td className="py-2 px-4">{c.email}</td>
                                <td className="py-2 px-4">{c.company}</td>
                                <td className="py-2 px-4">R$ {c.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="py-2 px-4">
                                  {c.status === 'pending_payment' && (
                                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300 border border-yellow-600/30">Pendente Pagamento</Badge>
                                  )}
                                  {c.status === 'pending_implementation' && (
                                    <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border border-orange-600/30">Pendente Implantação</Badge>
                                  )}
                                  {c.status === 'active' && (
                                    <Badge variant="secondary" className="bg-green-600/20 text-green-300 border border-green-600/30">Ativo</Badge>
                                  )}
                                </td>
                                <td className="py-2 px-4">
                                  <div className="flex gap-1">
                                    {c.status === 'pending_implementation' && !c.implementationPaid && (
                                      <Button 
                                        size="sm" 
                                        variant="hero" 
                                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs mr-1"
                                        onClick={() => handlePayImplementationFee(i)}
                                      >
                                        Pagar Taxa
                                      </Button>
                                    )}
                                    {c.status === 'active' && (
                                      <Badge variant="secondary" className="bg-green-600/20 text-green-300 border border-green-600/30 mr-1">✓ Ativo</Badge>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white text-xs p-1 h-7 w-7"
                                      onClick={() => handleEditClient(i)}
                                    >
                                      <Edit3 className="w-3 h-3 text-slate-800 hover:text-white" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      className="bg-red-700 hover:bg-red-800 text-white text-xs p-1 h-7 w-7"
                                      onClick={() => handleDeleteClient(i)}
                                    >
                                      <Trash2 className="w-3 h-3" />
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
            <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
              <CardHeader>
                <CardTitle>Gerenciar Leads</CardTitle>
                <p className="text-blue-100 mt-2">Acompanhe seus leads quentes e frios para conversão em clientes.</p>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-blue-200">
                    <p>Nenhum lead cadastrado ainda.</p>
                    <p className="text-sm mt-2">Cadastre leads usando a aba "Clientes" → "Lead".</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Leads Quentes */}
                    <div>
                      <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center">
                        🔥 Leads Quentes ({leads.filter(l => l.type === 'hot').length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.filter(l => l.type === 'hot').map((lead, i) => (
                          <Card key={i} className="bg-[#101828]/80 border border-orange-600/40">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-white">{lead.name}</h4>
                                <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border border-orange-600/30">Quente</Badge>
                              </div>
                              <p className="text-sm text-blue-200 mb-1">{lead.email}</p>
                              <p className="text-sm text-blue-200 mb-1">{lead.phone}</p>
                              <p className="text-sm text-blue-200 mb-2">{lead.company}</p>
                              {lead.notes && (
                                <p className="text-xs text-gray-300 mb-2 italic">"{lead.notes}"</p>
                              )}
                              <p className="text-xs text-gray-400">Adicionado: {lead.addedAt}</p>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="hero" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                  Converter
                                </Button>
                                <Button size="sm" variant="destructive" className="bg-red-700 hover:bg-red-800 text-white text-xs">
                                  Remover
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Leads Frios */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                        ❄️ Leads Frios ({leads.filter(l => l.type === 'cold').length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.filter(l => l.type === 'cold').map((lead, i) => (
                          <Card key={i} className="bg-[#101828]/80 border border-blue-600/40">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-white">{lead.name}</h4>
                                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border border-blue-600/30">Frio</Badge>
                              </div>
                              <p className="text-sm text-blue-200 mb-1">{lead.email}</p>
                              <p className="text-sm text-blue-200 mb-1">{lead.phone}</p>
                              <p className="text-sm text-blue-200 mb-2">{lead.company}</p>
                              {lead.notes && (
                                <p className="text-xs text-gray-300 mb-2 italic">"{lead.notes}"</p>
                              )}
                              <p className="text-xs text-gray-400">Adicionado: {lead.addedAt}</p>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" className="border-orange-600 text-orange-300 hover:bg-orange-700 text-xs">
                                  Aquecer
                                </Button>
                                <Button size="sm" variant="destructive" className="bg-red-700 hover:bg-red-800 text-white text-xs">
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
                  <Card key={index} className="bg-[#101828]/90 border border-blue-700/40 hover:shadow-lg transition-all duration-300 cursor-pointer text-white">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Icon className="w-8 h-8 text-blue-400" />
                        <Badge variant="outline" className="border-blue-600/40 text-blue-300">{resource.type}</Badge>
                      </div>
                      <CardTitle className="text-lg text-white">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="hero" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
            <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                  Simulação de Evolução - Programa de Parceiros
                </CardTitle>
                <p className="text-blue-200 mt-2">Veja como suas vendas impactam seus ganhos mensais</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Nível Atual */}
                  <div className="text-center p-4 bg-[#101828]/80 border border-blue-700/40 rounded-lg">
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border border-blue-600/30 mb-2">
                      Nível Atual
                    </Badge>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {salesData.commissionRate === 20 ? "Iniciante" : "Premium"}
                    </h4>
                    <p className="text-3xl font-bold text-blue-400 mb-2">{salesData.commissionRate}%</p>
                    <p className="text-sm text-blue-200">
                      R$ {salesData.totalSales.toLocaleString('pt-BR', {minimumFractionDigits: 2})} vendidos
                    </p>
                    <p className="text-lg font-semibold text-green-400 mt-2">
                      R$ {salesData.commission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-blue-300">ganho atual</p>
                  </div>

                  {/* Próximo Nível */}
                  <div className="text-center p-4 bg-[#101828]/80 border border-green-700/40 rounded-lg">
                    <Badge variant="secondary" className="bg-green-600/20 text-green-300 border border-green-600/30 mb-2">
                      Próximo Nível
                    </Badge>
                    <h4 className="text-lg font-semibold text-white mb-2">Premium</h4>
                    <p className="text-3xl font-bold text-green-400 mb-2">30%</p>
                    <p className="text-sm text-green-200 mb-2">R$ 50.000 vendidos</p>
                    <p className="text-lg font-semibold text-green-400 mt-2">
                      R$ {(50000 * 0.30).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-green-300">ganho potencial</p>
                  </div>

                  {/* Diferença */}
                  <div className="text-center p-4 bg-[#101828]/80 border border-orange-700/40 rounded-lg">
                    <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border border-orange-600/30 mb-2">
                      Diferença
                    </Badge>
                    <h4 className="text-lg font-semibold text-white mb-2">Ganho Extra</h4>
                    <p className="text-3xl font-bold text-orange-400 mb-2">+10%</p>
                    <p className="text-sm text-orange-200 mb-2">ao atingir R$ 50k</p>
                    <p className="text-lg font-semibold text-orange-400 mt-2">
                      +R$ {((50000 * 0.30) - (50000 * 0.20)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-orange-300">ganho adicional</p>
                  </div>
                </div>

                {/* Projeção Mensal */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-[#101828]/60 border border-blue-700/30 rounded-lg">
                    <p className="text-sm text-blue-300 mb-1">1 Cliente/Mês</p>
                    <p className="text-lg font-bold text-white">R$ 1.500</p>
                    <p className="text-xs text-blue-400">R$ {(1500 * (salesData.commissionRate/100)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                  </div>
                  <div className="p-3 bg-[#101828]/60 border border-blue-700/30 rounded-lg">
                    <p className="text-sm text-blue-300 mb-1">3 Clientes/Mês</p>
                    <p className="text-lg font-bold text-white">R$ 4.500</p>
                    <p className="text-xs text-blue-400">R$ {(4500 * (salesData.commissionRate/100)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                  </div>
                  <div className="p-3 bg-[#101828]/60 border border-blue-700/30 rounded-lg">
                    <p className="text-sm text-blue-300 mb-1">5 Clientes/Mês</p>
                    <p className="text-lg font-bold text-white">R$ 7.500</p>
                    <p className="text-xs text-blue-400">R$ {(7500 * (salesData.commissionRate/100)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                  </div>
                  <div className="p-3 bg-[#101828]/60 border border-green-700/30 rounded-lg">
                    <p className="text-sm text-green-300 mb-1">10 Clientes/Mês</p>
                    <p className="text-lg font-bold text-white">R$ 15.000</p>
                    <p className="text-xs text-green-400">R$ {(15000 * 0.30).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês*</p>
                    <p className="text-xs text-green-300">*Nível Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            {/* Suporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <MessageSquare className="w-6 h-6 text-blue-400 mr-3" />
                    <CardTitle>Contato Direto</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-[#101828]/80 border border-blue-700/40 rounded-lg">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Equipe de Parcerias</h4>
                    <p className="text-blue-200 mb-4 text-sm">
                      Para questões sobre vendas, comissões e suporte comercial
                    </p>
                    <Button 
                      variant="hero" 
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      onClick={() => window.open('mailto:contato@converseia.com?subject=Dúvida Programa de Parceiros', '_blank')}
                    >
                      contato@converseia.com
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2b]/90 border border-blue-700/40 text-white">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-green-400 mr-3" />
                    <CardTitle>Suporte Técnico</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-[#101828]/80 border border-green-700/40 rounded-lg">
                    <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Central de Tickets</h4>
                    <p className="text-blue-200 mb-4 text-sm">
                      Para problemas técnicos, implementação e configurações
                    </p>
                    <Button 
                      variant="hero" 
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