
import { neon } from '@neondatabase/serverless';

// Removed sslmode=require as it can cause issues with the HTTP driver in some environments
const sql = neon('postgresql://neondb_owner:npg_pa2dkjo1NecB@ep-autumn-dream-ai4cpa7j-pooler.c-4.us-east-1.aws.neon.tech/neondb');

const normalizeData = (data: any) => {
  return {
    name: String(data.name || 'Sem Nome').trim(),
    email: String(data.email || '').trim().toLowerCase(),
    whatsapp: String(data.whatsapp || '').replace(/\D/g, ''),
    address: String(data.address || '').trim(),
    appName: String(data.appname || data.appName || 'App Indefinido').trim(),
    monthlyValue: isNaN(parseFloat(data.monthlyvalue || data.monthlyValue)) ? 0 : parseFloat(data.monthlyvalue || data.monthlyValue),
    paymentFrequency: String(data.payment_frequency || data.paymentFrequency || 'MONTHLY').toUpperCase(),
    dueDay: isNaN(parseInt(data.dueday || data.dueDay)) ? 10 : Math.max(1, Math.min(31, parseInt(data.dueday || data.dueDay))),
    status: String(data.status || 'ACTIVE').toUpperCase(),
    paymentLink: String(data.payment_link || data.paymentLink || '').trim(),
    notes: String(data.notes || '').trim(),
    saleDate: data.sale_date || data.saleDate ? String(data.sale_date || data.saleDate).split('T')[0] : new Date().toISOString().split('T')[0],
    seller_id: data.seller_id || null
  };
};

// Helper to safely execute SQL with error handling
const safeSql = async (query: string, params?: any[]) => {
  try {
    return await sql(query, params);
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
};

export const initDatabase = async () => {
  try {
    // Test connection first
    await safeSql('SELECT 1');

    await safeSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Create tables if they don't exist
    await safeSql(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        whatsapp TEXT,
        address TEXT,
        appname TEXT,
        monthlyvalue NUMERIC(10,2) DEFAULT 0,
        payment_frequency TEXT DEFAULT 'MONTHLY',
        dueday INTEGER DEFAULT 10,
        status TEXT DEFAULT 'ACTIVE',
        payment_link TEXT,
        notes TEXT,
        sale_date DATE DEFAULT CURRENT_DATE,
        seller_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await safeSql(`
      CREATE TABLE IF NOT EXISTS sellers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT,
        approved BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        last_seen TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await safeSql(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        receiver_email TEXT,
        sender_name TEXT DEFAULT 'Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await safeSql(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, role TEXT DEFAULT 'ADMIN', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`);
    await safeSql(`CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, category TEXT, description TEXT, price NUMERIC(10,2) DEFAULT 0, photo TEXT, payment_methods JSONB DEFAULT '[]'::jsonb, payment_link_id TEXT DEFAULT 'link1', external_link TEXT);`);
    await safeSql(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB);`);

    // Migrations to ensure all columns exist
    const migrations = [
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS seller_id UUID;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS appname TEXT;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthlyvalue NUMERIC(10,2) DEFAULT 0;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'MONTHLY';`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS dueday INTEGER DEFAULT 10;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS sale_date DATE DEFAULT CURRENT_DATE;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT 'Admin';`,
      `ALTER TABLE sellers ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;`,
      `ALTER TABLE sellers ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;`,
      `ALTER TABLE sellers ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;`
    ];
    
    for (const cmd of migrations) { try { await safeSql(cmd); } catch (e) {} }

    await safeSql(`INSERT INTO users (email, password, name, role) VALUES ('admin@devaro.com', 'admin123', 'Admin DevARO', 'ADMIN') ON CONFLICT (email) DO NOTHING;`);

    console.log('Neon SQL: Sincronizado.');
  } catch (error) {
    console.error('Neon SQL Init Error:', error);
    // Re-throw to let the caller know initialization failed
    throw error;
  }
};

export const NeonService = {
  async getClients(sellerId?: string) {
    if (sellerId) {
      return await safeSql('SELECT * FROM clients WHERE seller_id = $1 ORDER BY created_at DESC', [sellerId]);
    }
    return await safeSql('SELECT * FROM clients ORDER BY created_at DESC');
  },
  
  async addClient(rawData: any) {
    const c = normalizeData(rawData);
    const res = await safeSql(`
      INSERT INTO clients (name, email, whatsapp, address, appname, monthlyvalue, payment_frequency, dueday, status, payment_link, notes, sale_date, seller_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.paymentFrequency, c.dueDay, c.status, c.paymentLink, c.notes, c.saleDate, c.seller_id]);
    return res[0];
  },

  async updateClient(id: string, rawData: any) {
    const c = normalizeData(rawData);
    const res = await safeSql(`
      UPDATE clients 
      SET name=$1, email=$2, whatsapp=$3, address=$4, appname=$5, monthlyvalue=$6, payment_frequency=$7, dueday=$8, status=$9, payment_link=$10, notes=$11, sale_date=$12, seller_id=$13
      WHERE id=$14
      RETURNING *
    `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.paymentFrequency, c.dueDay, c.status, c.paymentLink, c.notes, c.saleDate, c.seller_id, id]);
    return res[0];
  },

  async deleteClient(id: string) { return await safeSql('DELETE FROM clients WHERE id=$1', [id]); },
  async updateClientStatus(id: string, status: string) { return await safeSql('UPDATE clients SET status=$1 WHERE id=$2 RETURNING *', [status.toUpperCase(), id]); },

  async getSellers() { return await safeSql('SELECT id, name, email, address, approved, active, lat, lng, last_seen, created_at FROM sellers ORDER BY created_at DESC'); },
  
  async updateSellerLocation(id: string, lat: number, lng: number) {
    return await safeSql('UPDATE sellers SET lat=$1, lng=$2, last_seen=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *', [lat, lng, id]);
  },

  async registerSeller(data: any) {
    const res = await safeSql(`
      INSERT INTO sellers (name, email, password, address, approved, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, address, approved, active
    `, [data.name, data.email, data.password, data.address || '', data.approved || false, true]);
    return res[0];
  },

  async updateSeller(id: string, data: any) {
    const res = await safeSql(`
      UPDATE sellers SET name=$1, email=$2, address=$3, approved=$4, active=$5, password=COALESCE($6, password) WHERE id=$7 RETURNING *
    `, [data.name, data.email, data.address, data.approved, data.active, data.password || null, id]);
    return res[0];
  },

  async deleteSeller(id: string) { return await safeSql('DELETE FROM sellers WHERE id=$1', [id]); },

  async login(email: string, password: string) {
    const admins = await safeSql('SELECT id, email, name, role FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (admins.length > 0) return admins[0];

    const sellers = await safeSql('SELECT id, email, name, address, approved, active FROM sellers WHERE email = $1 AND password = $2', [email, password]);
    if (sellers.length > 0) {
      const s = sellers[0];
      if (!s.approved) throw new Error('Aguarde a aprovação do administrador para logar.');
      if (!s.active) throw new Error('Seu acesso foi suspenso.');
      return { ...s, role: 'SELLER' };
    }
    return null;
  },

  async getMessages(email: string) {
    return await safeSql('SELECT * FROM messages WHERE receiver_email = $1 OR receiver_email IS NULL ORDER BY created_at DESC', [email]);
  },

  async addMessage(content: string, receiverEmail: string | null, senderName: string) {
    return await safeSql('INSERT INTO messages (content, receiver_email, sender_name) VALUES ($1, $2, $3) RETURNING *', [content, receiverEmail, senderName]);
  },

  async deleteMessage(id: string) {
    return await safeSql('DELETE FROM messages WHERE id=$1', [id]);
  },

  async getProducts() { return await safeSql('SELECT * FROM products ORDER BY name ASC'); },
  async addProduct(p: any) {
    const res = await safeSql(`INSERT INTO products (name, category, description, price, photo, payment_methods, payment_link_id, external_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [p.name, p.category || 'Geral', p.description, p.price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId, p.externalLink]);
    return res[0];
  },
  async updateProduct(id: string, p: any) {
    const res = await safeSql(`UPDATE products SET name=$1, category=$2, description=$3, price=$4, photo=$5, payment_methods=$6, payment_link_id=$7, external_link=$8 WHERE id=$9 RETURNING *`, [p.name, p.category || 'Geral', p.description, p.price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId, p.externalLink, id]);
    return res[0];
  },
  async deleteProduct(id: string) { return await safeSql('DELETE FROM products WHERE id=$1', [id]); },
  async getSettings(key: string) { const res = await safeSql('SELECT value FROM settings WHERE key=$1', [key]); return res[0]?.value || null; },
  async setSettings(key: string, value: any) { return await safeSql('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(value)]); }
};
