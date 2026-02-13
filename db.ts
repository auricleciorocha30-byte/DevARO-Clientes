
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_pa2dkjo1NecB@ep-autumn-dream-ai4cpa7j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');

/**
 * Utilitário para limpar e validar dados antes da gravação
 */
const normalizeData = (data: any) => {
  return {
    ...data,
    name: (data.name || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    whatsapp: (data.whatsapp || '').replace(/\D/g, ''),
    appName: (data.appName || '').trim(),
    monthlyValue: isNaN(parseFloat(data.monthlyValue)) ? 0 : parseFloat(data.monthlyValue),
    dueDay: isNaN(parseInt(data.dueDay)) ? 10 : Math.max(1, Math.min(31, parseInt(data.dueDay))),
  };
};

export const initDatabase = async () => {
  try {
    console.log('DevARO: Sincronizando tabelas no Neon SQL...');
    
    // Garantir extensões necessárias
    await sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Estrutura Base
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    await sql(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) DEFAULT 0,
        photo TEXT,
        payment_methods JSONB DEFAULT '[]'::jsonb,
        payment_link_id TEXT DEFAULT 'link1',
        external_link TEXT
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB
      );
    `);

    // Migrações preventivas (Sempre garante que colunas novas existam)
    const columns = [
      { table: 'clients', col: 'app_name', type: 'TEXT' },
      { table: 'clients', col: 'monthly_value', type: 'NUMERIC(10,2) DEFAULT 0' },
      { table: 'clients', col: 'payment_link', type: 'TEXT' },
      { table: 'products', col: 'external_link', type: 'TEXT' },
      { table: 'products', col: 'payment_link_id', type: 'TEXT DEFAULT \'link1\'' }
    ];

    for (const item of columns) {
      try {
        await sql(`ALTER TABLE ${item.table} ADD COLUMN IF NOT EXISTS ${item.col} ${item.type};`);
      } catch (e) { /* Coluna já existe ou erro ignorável */ }
    }

    // Criar admin padrão se não existir
    await sql(`
      INSERT INTO users (email, password, name)
      VALUES ('admin@devaro.com', 'admin123', 'Admin DevARO')
      ON CONFLICT (email) DO NOTHING;
    `);

  } catch (error) {
    console.error('Erro Crítico Neon:', error);
  }
};

export const NeonService = {
  async login(email: string, password: string) {
    const users = await sql('SELECT id, email, name FROM users WHERE email = $1 AND password = $2', [email, password]);
    return users.length > 0 ? users[0] : null;
  },

  async register(name: string, email: string, password: string) {
    const res = await sql('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name', [name, email, password]);
    return res[0];
  },

  async getClients() {
    return await sql('SELECT * FROM clients ORDER BY created_at DESC');
  },
  
  async addClient(rawData: any) {
    const c = normalizeData(rawData);
    const res = await sql(`
      INSERT INTO clients (name, email, whatsapp, address, app_name, monthly_value, due_day, status, payment_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink]);
    return res[0];
  },

  async updateClient(id: string, rawData: any) {
    const c = normalizeData(rawData);
    return await sql(`
      UPDATE clients 
      SET name=$1, email=$2, whatsapp=$3, address=$4, app_name=$5, monthly_value=$6, due_day=$7, status=$8, payment_link=$9
      WHERE id=$10
      RETURNING *
    `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink, id]);
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
    const res = await sql(`
      INSERT INTO products (name, description, price, photo, payment_methods, payment_link_id, external_link)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
      RETURNING *
    `, [p.name, p.description, price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId, p.externalLink]);
    return res[0];
  },

  async updateProduct(id: string, p: any) {
    const price = isNaN(parseFloat(p.price)) ? 0 : parseFloat(p.price);
    return await sql(`
      UPDATE products 
      SET name=$1, description=$2, price=$3, photo=$4, payment_methods=$5::jsonb, payment_link_id=$6, external_link=$7
      WHERE id=$8
      RETURNING *
    `, [p.name, p.description, price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId, p.externalLink, id]);
  },

  async deleteProduct(id: string) {
    return await sql('DELETE FROM products WHERE id=$1', [id]);
  },

  async getSettings(key: string) {
    const res = await sql('SELECT value FROM settings WHERE key=$1', [key]);
    return res[0]?.value || null;
  },

  async setSettings(key: string, value: any) {
    return await sql('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(value)]);
  }
};
