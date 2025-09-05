// Backend API para Google Sheets
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configurações do Google Sheets
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Clientes!A:F';

// Credenciais do Google (Service Account)
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
};

let sheets;

async function initializeAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Google Sheets API:', error);
  }
}

// Inicializar autenticação
initializeAuth();

// GET /api/sheets/clients - Buscar todos os clientes
app.get('/api/sheets/clients', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1); // Pular cabeçalho
    
    const clients = dataRows.map((row) => ({
      name: row[0] || '',
      email: row[1] || '',
      phone: row[2] || '',
      company: row[3] || '',
      value: parseFloat(row[4]) || 0,
      status: row[5] || 'pending_payment'
    }));

    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// POST /api/sheets/clients - Adicionar novo cliente
app.post('/api/sheets/clients', async (req, res) => {
  try {
    const { name, email, phone, company, value, status } = req.body;

    const values = [[name, email, phone, company, value, status]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    res.json({ success: true, message: 'Cliente adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    res.status(500).json({ error: 'Erro ao adicionar cliente' });
  }
});

// PUT /api/sheets/clients/:index - Atualizar cliente
app.put('/api/sheets/clients/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { name, email, phone, company, value, status } = req.body;

    const range = `Clientes!A${index + 2}:F${index + 2}`; // +2 para pular cabeçalho
    const values = [[name, email, phone, company, value, status]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    res.json({ success: true, message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// DELETE /api/sheets/clients/:index - Deletar cliente
app.delete('/api/sheets/clients/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: index + 1, // +1 para pular cabeçalho
                endIndex: index + 2
              }
            }
          }
        ]
      }
    });

    res.json({ success: true, message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
