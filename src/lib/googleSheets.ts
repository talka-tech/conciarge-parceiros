// Serviço para integração com Google Sheets via API Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Interface para os dados do cliente
export interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  status: 'pending_payment' | 'pending_implementation' | 'active';
}

export class GoogleSheetsService {
  
  // Ler dados da planilha via API
  async getClients(): Promise<ClientData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sheets/clients`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const clients = await response.json();
      return clients;
    } catch (error) {
      console.error('Erro ao ler dados da planilha:', error);
      throw error;
    }
  }

  // Adicionar novo cliente na planilha via API
  async addClient(client: ClientData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sheets/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao adicionar cliente na planilha:', error);
      throw error;
    }
  }

  // Atualizar cliente na planilha via API
  async updateClient(rowIndex: number, client: ClientData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sheets/clients/${rowIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao atualizar cliente na planilha:', error);
      throw error;
    }
  }

  // Deletar cliente da planilha via API
  async deleteClient(rowIndex: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sheets/clients/${rowIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao deletar cliente da planilha:', error);
      throw error;
    }
  }
}

// Instância singleton
export const googleSheetsService = new GoogleSheetsService();
