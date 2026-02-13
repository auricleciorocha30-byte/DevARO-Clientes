
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_pa2dkjo1NecB@ep-autumn-dream-ai4cpa7j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');

/**
 * Normaliza e limpa os dados para evitar erros de tipo no PostgreSQL
 */
const normalizeData = (data: any) => {
  return {
    name: String(data.name || 'Sem Nome').trim(),
    email: String(data.email || '').trim().toLowerCase(),
    whatsapp: String(data.whatsapp || '').replace(/\D/g, ''),
    address: String(data.address || '').trim(),
    appName: String(data.appName || 'App Indefinido').trim(),
    monthlyValue: isNaN(parseFloat(data.monthlyValue)) ? 0 : parseFloat(data.monthlyValue),
    dueDay: isNaN(parseInt(data.dueDay)) ? 10 : Math.max(1, Math.min(31, parseInt(data.dueDay))),
    status: String(data.status || 'ACTIVE').toUpperCase(),
    paymentLink: String(data.paymentLink || '').trim(),
  };
};

export const initDatabase = async () => {
  try {
    console.log('DevARO: Verificando integridade das tabelas...');
    
    await sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Tabela de Clientes com estrutura robusta
    await sql(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        whatsapp TEXT,
        address TEXT,
        app_name TEXT,
        monthly_value NUMERIC(10,2) DEFAULT 0,
        due_day INTEGER DEFAULT 10,
        status TEXT DEFAULT 'ACTIVE',
        payment_link TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrações de segurança para garantir que colunas existam em bancos já criados
    const migrations = [
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS app_name TEXT;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_value NUMERIC(10,2) DEFAULT 0;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS due_day INTEGER DEFAULT 10;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_link TEXT;`
    ];

    for (const cmd of migrations) {
      try { await sql(cmd); } catch (e) { /* ignore */ }
    }

    // Tabelas auxiliares
    await sql(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`);
    await sql(`CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, price NUMERIC(10,2) DEFAULT 0, photo TEXT, payment_methods JSONB DEFAULT '[]'::jsonb, payment_link_id TEXT DEFAULT 'link1', external_link TEXT);`);
    await sql(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB);`);

  } catch (error) {
    console.error('Falha na inicialização do Neon:', error);
  }
};

export const NeonService = {
  async getClients() {
    try {
      return await sql('SELECT * FROM clients ORDER BY created_at DESC');
    } catch (e) {
      console.error('Erro ao buscar clientes:', e);
      return [];
    }
  },
  
  async addClient(rawData: any) {
    const c = normalizeData(rawData);
    try {
      console.log('Gravando cliente no Neon:', c);
      const res = await sql(`
        INSERT INTO clients (name, email, whatsapp, address, app_name, monthly_value, due_day, status, payment_link)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink]);
      return res[0];
    } catch (error: any) {
      console.error('ERRO SQL (addClient):', error.message);
      throw new Error(`Falha ao salvar no Neon: ${error.message}`);
    }
  },

  async updateClient(id: string, rawData: any) {
    const c = normalizeData(rawData);
    try {
      return await sql(`
        UPDATE clients 
        SET name=$1, email=$2, whatsapp=$3, address=$4, app_name=$5, monthly_value=$6, due_day=$7, status=$8, payment_link=$9
        WHERE id=$10
        RETURNING *
      `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink, id]);
    } catch (error: any) {
      console.error('ERRO SQL (updateClient):', error.message);
      throw error;
    }
  },

  async deleteClient(id: string) {
    return await sql('DELETE FROM clients WHERE id=$1', [id]);
  },

  async updateClientStatus(id: string, status: string) {
    return await sql('UPDATE clients SET status=$1 WHERE id=$2', [status, id]);
  },

  async getProducts() {
    return await sql('SELECT * FROM products ORDER BY name ASC');
  },

  async addProduct(p: any) {
    const price = isNaN(parseFloat(p.price)) ? 0 : parseFloat(p.price);
    return await sql(`
      INSERT INTO products (name, description, price, photo, payment_methods, payment_link_id, external_link)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
      RETURNING *
    `, [p.name, p.description, price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId || 'link1', p.externalLink || '']);
  },

  async updateProduct(id: string, p: any) {
    const price = isNaN(parseFloat(p.price)) ? 0 : parseFloat(p.price);
    return await sql(`
      UPDATE products 
      SET name=$1, description=$2, price=$3, photo=$4, payment_methods=$5::jsonb, payment_link_id=$6, external_link=$7
      WHERE id=$8
      RETURNING *
    `, [p.name, p.description, price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId || 'link1', p.externalLink || '', id]);
  },

  async deleteProduct(id: string) {
    return await sql('DELETE FROM products WHERE id=$1', [id]);
  },

  async login(email: string, password: string) {
    const users = await sql('SELECT id, email, name FROM users WHERE email = $1 AND password = $2', [email, password]);
    return users.length > 0 ? users[0] : null;
  },

  async register(name: string, email: string, password: string) {
    const res = await sql('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name', [name, email, password]);
    return res[0];
  },

  async getSettings(key: string) {
    const res = await sql('SELECT value FROM settings WHERE key=$1', [key]);
    return res[0]?.value || null;
  },

  async setSettings(key: string, value: any) {
    return await sql('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(value)]);
  }
};
