
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_pa2dkjo1NecB@ep-autumn-dream-ai4cpa7j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');

const normalizeData = (data: any) => {
  return {
    name: String(data.name || 'Sem Nome').trim(),
    email: String(data.email || '').trim().toLowerCase(),
    whatsapp: String(data.whatsapp || '').replace(/\D/g, ''),
    address: String(data.address || '').trim(),
    appName: String(data.appname || data.appName || 'App Indefinido').trim(),
    monthlyValue: isNaN(parseFloat(data.monthlyvalue || data.monthlyValue)) ? 0 : parseFloat(data.monthlyvalue || data.monthlyValue),
    dueDay: isNaN(parseInt(data.dueday || data.dueDay)) ? 10 : Math.max(1, Math.min(31, parseInt(data.dueday || data.dueDay))),
    status: String(data.status || 'ACTIVE').toUpperCase(),
    paymentLink: String(data.payment_link || data.paymentLink || '').trim(),
    seller_id: data.seller_id || null
  };
};

export const initDatabase = async () => {
  try {
    await sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await sql(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        whatsapp TEXT,
        address TEXT,
        appname TEXT,
        monthlyvalue NUMERIC(10,2) DEFAULT 0,
        dueday INTEGER DEFAULT 10,
        status TEXT DEFAULT 'ACTIVE',
        payment_link TEXT,
        seller_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS sellers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT,
        approved BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        receiver_email TEXT,
        sender_name TEXT DEFAULT 'Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`);
    await sql(`CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, price NUMERIC(10,2) DEFAULT 0, photo TEXT, payment_methods JSONB DEFAULT '[]'::jsonb, payment_link_id TEXT DEFAULT 'link1', external_link TEXT);`);
    await sql(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB);`);

    const migrations = [
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS seller_id UUID;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS appname TEXT;`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthlyvalue NUMERIC(10,2) DEFAULT 0;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT 'Admin';`
    ];
    
    for (const cmd of migrations) { try { await sql(cmd); } catch (e) {} }

    await sql(`INSERT INTO users (email, password, name, role) VALUES ('admin@devaro.com', 'admin123', 'Admin DevARO', 'ADMIN') ON CONFLICT (email) DO NOTHING;`);

    console.log('Neon SQL: Sincronizado.');
  } catch (error) {
    console.error('Neon SQL Init Error:', error);
  }
};

export const NeonService = {
  async getClients(sellerId?: string) {
    if (sellerId) {
      return await sql('SELECT * FROM clients WHERE seller_id = $1 ORDER BY created_at DESC', [sellerId]);
    }
    return await sql('SELECT * FROM clients ORDER BY created_at DESC');
  },
  
  async addClient(rawData: any) {
    const c = normalizeData(rawData);
    const res = await sql(`
      INSERT INTO clients (name, email, whatsapp, address, appname, monthlyvalue, dueday, status, payment_link, seller_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink, c.seller_id]);
    return res[0];
  },

  async updateClient(id: string, rawData: any) {
    const c = normalizeData(rawData);
    const res = await sql(`
      UPDATE clients 
      SET name=$1, email=$2, whatsapp=$3, address=$4, appname=$5, monthlyvalue=$6, dueday=$7, status=$8, payment_link=$9, seller_id=$10
      WHERE id=$11
      RETURNING *
    `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink, c.seller_id, id]);
    return res[0];
  },

  async deleteClient(id: string) { return await sql('DELETE FROM clients WHERE id=$1', [id]); },
  async updateClientStatus(id: string, status: string) { return await sql('UPDATE clients SET status=$1 WHERE id=$2 RETURNING *', [status.toUpperCase(), id]); },

  async getSellers() { return await sql('SELECT * FROM sellers ORDER BY created_at DESC'); },
  
  async registerSeller(data: any) {
    const res = await sql(`
      INSERT INTO sellers (name, email, password, address, approved, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, address, approved, active
    `, [data.name, data.email, data.password, data.address || '', data.approved || false, true]);
    return res[0];
  },

  async updateSeller(id: string, data: any) {
    const res = await sql(`
      UPDATE sellers SET name=$1, email=$2, address=$3, approved=$4, active=$5 WHERE id=$6 RETURNING *
    `, [data.name, data.email, data.address, data.approved, data.active, id]);
    return res[0];
  },

  async deleteSeller(id: string) { return await sql('DELETE FROM sellers WHERE id=$1', [id]); },

  async login(email: string, password: string) {
    const admins = await sql('SELECT id, email, name, role FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (admins.length > 0) return admins[0];

    const sellers = await sql('SELECT id, email, name, address, approved, active FROM sellers WHERE email = $1 AND password = $2', [email, password]);
    if (sellers.length > 0) {
      const s = sellers[0];
      if (!s.approved) throw new Error('Aguarde a aprovação do administrador para logar.');
      if (!s.active) throw new Error('Seu acesso foi suspenso.');
      return { ...s, role: 'SELLER' };
    }
    return null;
  },

  async getMessages(email: string) {
    return await sql('SELECT * FROM messages WHERE receiver_email = $1 OR receiver_email IS NULL ORDER BY created_at DESC', [email]);
  },

  async addMessage(content: string, receiverEmail: string | null, senderName: string) {
    return await sql('INSERT INTO messages (content, receiver_email, sender_name) VALUES ($1, $2, $3) RETURNING *', [content, receiverEmail, senderName]);
  },

  async getProducts() { return await sql('SELECT * FROM products ORDER BY name ASC'); },
  async addProduct(p: any) {
    const res = await sql(`INSERT INTO products (name, description, price, photo, payment_methods, payment_link_id, external_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [p.name, p.description, p.price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId, p.externalLink]);
    return res[0];
  },
  async updateProduct(id: string, p: any) {
    const res = await sql(`UPDATE products SET name=$1, description=$2, price=$3, photo=$4, payment_methods=$5, payment_link_id=$6, external_link=$7 WHERE id=$8 RETURNING *`, [p.name, p.description, p.price, p.photo, JSON.stringify(p.paymentMethods || []), p.paymentLinkId, p.externalLink, id]);
    return res[0];
  },
  async deleteProduct(id: string) { return await sql('DELETE FROM products WHERE id=$1', [id]); },
  async getSettings(key: string) { const res = await sql('SELECT value FROM settings WHERE key=$1', [key]); return res[0]?.value || null; },
  async setSettings(key: string, value: any) { return await sql('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(value)]); }
};
