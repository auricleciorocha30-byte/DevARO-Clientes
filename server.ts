
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_pa2dkjo1NecB@ep-autumn-dream-ai4cpa7j-pooler.c-4.us-east-1.aws.neon.tech/neondb');

const app = express();
app.use(express.json());

const ASAAS_API_URL_DEFAULT = 'https://sandbox.asaas.com/api/v3';

async function getAsaasConfig() {
  const res = await sql('SELECT value FROM settings WHERE key = $1', ['asaas_config']);
  if (res.length === 0) return null;
  return res[0].value;
}

// Asaas Helper to create axios instance on the fly with latest config
async function getAsaasClient() {
  const config = await getAsaasConfig();
  if (!config || !config.apiKey) {
    throw new Error('Configuração do Asaas não encontrada ou incompleta no banco de dados.');
  }

  return axios.create({
    baseURL: config.apiUrl || ASAAS_API_URL_DEFAULT,
    headers: {
      access_token: config.apiKey,
      'Content-Type': 'application/json'
    }
  });
}

// Helper to update client status/paid_until
async function confirmPayment(clientId: string, months: number) {
  const client = await sql('SELECT * FROM clients WHERE id = $1', [clientId]);
  if (client.length === 0) return null;
  
  let currentPaidUntil = client[0].paid_until ? new Date(client[0].paid_until) : new Date();
  if (currentPaidUntil < new Date()) currentPaidUntil = new Date();
  
  const newPaidUntil = new Date(currentPaidUntil);
  newPaidUntil.setMonth(newPaidUntil.getMonth() + months);
  
  return await sql('UPDATE clients SET paid_until=$1, status=$2 WHERE id=$3 RETURNING *', [newPaidUntil.toISOString(), 'ACTIVE', clientId]);
}

// Routes
app.post('/api/asaas/create-payment', async (req, res) => {
  const { clientId, amount, months, description } = req.body;

  try {
    const asaas = await getAsaasClient();
    
    // 1. Get client info
    const client = await sql('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (client.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    const c = client[0];

    // 2. Create/Get Customer in Asaas
    let customerId;
    const searchCustomer = await asaas.get(`/customers?email=${c.email}`);
    if (searchCustomer.data.data.length > 0) {
      customerId = searchCustomer.data.data[0].id;
    } else {
      const newCustomer = await asaas.post('/customers', {
        name: c.name,
        email: c.email,
        mobilePhone: c.whatsapp
      });
      customerId = newCustomer.data.id;
    }

    // 3. Create Payment
    const payment = await asaas.post('/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: amount,
      dueDate: new Date().toISOString().split('T')[0],
      description: description || `Assinatura ${c.appname}`,
      externalReference: clientId, // Custom field to track which client paid
      metadata: { months: String(months) }
    });

    // 4. Get PIX QR Code if PIX
    let pixData = null;
    if (payment.data.billingType === 'PIX') {
      const pix = await asaas.get(`/payments/${payment.data.id}/pixQrCode`);
      pixData = pix.data;
    }

    res.json({
      paymentId: payment.data.id,
      invoiceUrl: payment.data.invoiceUrl,
      pix: pixData
    });

  } catch (error: any) {
    console.error('Asaas Error:', error.response?.data || error.message);
    const msg = error.response?.data?.errors?.[0]?.description || 'Erro ao processar pagamento com Asaas';
    res.status(500).json({ error: msg });
  }
});

// Webhook for Asaas
app.post('/api/asaas/webhook', async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body));
  
  const config = await getAsaasConfig();
  const webhookToken = config?.webhookToken;

  // Basic security check
  const token = req.headers['asaas-access-token'];
  if (webhookToken && token !== webhookToken) {
    return res.status(401).send('Unauthorized');
  }

  const { event, payment } = req.body;

  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    const clientId = payment.externalReference;
    const months = payment.metadata?.months ? parseInt(payment.metadata.months) : 1;
    
    if (clientId) {
      try {
        await confirmPayment(clientId, months);
        console.log(`Payment confirmed for client ${clientId}`);
        
        // Optional: Add a notification message to the client
        await sql('INSERT INTO messages (content, receiver_email, sender_name) VALUES ($1, $2, $3)', 
          [`Seu pagamento foi confirmado! Sua assinatura foi renovada por ${months} mês(es).`, 
          payment.customerEmail || '', 'Sistema de Pagamentos']);
          
      } catch (err) {
        console.error('Database update error in webhook:', err);
      }
    }
  }

  res.send('OK');
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'dist/index.html')));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
