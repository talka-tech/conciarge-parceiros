import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Banknote } from "lucide-react";

interface PaymentMethodFormProps {
  partnerId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentMethodForm({ partnerId, onSuccess, onCancel }: PaymentMethodFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    method_type: '',
    pix_key: '',
    bank: '',
    agency: '',
    account: '',
    account_type: 'corrente',
    paypal_email: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let details = {};
      
      switch (formData.method_type) {
        case 'pix':
          details = {
            pix_key: formData.pix_key,
            bank: formData.bank
          };
          break;
        case 'bank_transfer':
          details = {
            bank: formData.bank,
            agency: formData.agency,
            account: formData.account,
            account_type: formData.account_type
          };
          break;
        case 'paypal':
          details = {
            email: formData.paypal_email
          };
          break;
      }

      const response = await fetch(`${API_URL}/api/partners/${partnerId}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method_type: formData.method_type,
          details: details,
          is_default: false
        }),
      });

      if (response.ok) {
        toast({
          title: "Método adicionado",
          description: "Método de pagamento cadastrado com sucesso.",
        });
        onSuccess();
      } else {
        throw new Error('Erro ao adicionar método');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o método de pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'pix':
        return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer':
        return <Banknote className="w-5 h-5" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {getMethodIcon(formData.method_type)}
          <span className="ml-2">Adicionar Método de Pagamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <Label>Tipo de Pagamento</Label>
            <Select 
              value={formData.method_type} 
              onValueChange={(value) => setFormData(prev => ({...prev, method_type: value}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    PIX
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center">
                    <Banknote className="w-4 h-4 mr-2" />
                    Transferência Bancária
                  </div>
                </SelectItem>
                <SelectItem value="paypal">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    PayPal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.method_type === 'pix' && (
            <>
              <div>
                <Label>Chave PIX</Label>
                <Input
                  value={formData.pix_key}
                  onChange={(e) => setFormData(prev => ({...prev, pix_key: e.target.value}))}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  required
                />
              </div>
              <div>
                <Label>Banco</Label>
                <Input
                  value={formData.bank}
                  onChange={(e) => setFormData(prev => ({...prev, bank: e.target.value}))}
                  placeholder="Nome do banco"
                  required
                />
              </div>
            </>
          )}

          {formData.method_type === 'bank_transfer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Banco</Label>
                  <Input
                    value={formData.bank}
                    onChange={(e) => setFormData(prev => ({...prev, bank: e.target.value}))}
                    placeholder="Nome do banco"
                    required
                  />
                </div>
                <div>
                  <Label>Agência</Label>
                  <Input
                    value={formData.agency}
                    onChange={(e) => setFormData(prev => ({...prev, agency: e.target.value}))}
                    placeholder="0000"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Conta</Label>
                  <Input
                    value={formData.account}
                    onChange={(e) => setFormData(prev => ({...prev, account: e.target.value}))}
                    placeholder="00000-0"
                    required
                  />
                </div>
                <div>
                  <Label>Tipo de Conta</Label>
                  <Select 
                    value={formData.account_type} 
                    onValueChange={(value) => setFormData(prev => ({...prev, account_type: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Corrente</SelectItem>
                      <SelectItem value="poupanca">Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {formData.method_type === 'paypal' && (
            <div>
              <Label>Email do PayPal</Label>
              <Input
                type="email"
                value={formData.paypal_email}
                onChange={(e) => setFormData(prev => ({...prev, paypal_email: e.target.value}))}
                placeholder="seu@email.com"
                required
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !formData.method_type}>
              {isLoading ? "Adicionando..." : "Adicionar Método"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}