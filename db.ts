
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_pa2dkjo1NecB@ep-autumn-dream-ai4cpa7j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');

export const initDatabase = async () => {
  try {
    console.log('Iniciando tabelas no Neon...');
    
    // Tabela de Usuários
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Clientes
    await sql(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        whatsapp TEXT,
        address TEXT,
        app_name TEXT,
        monthly_value NUMERIC(10,2),
        due_day INTEGER,
        status TEXT,
        payment_link TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Produtos (JSONB para métodos de pagamento)
    await sql(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2),
        photo TEXT,
        payment_methods JSONB,
        payment_link_id TEXT,
        external_link TEXT
      );
    `);

    // Tabela de Configurações
    await sql(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB
      );
    `);

    // Usuário padrão de acesso
    await sql(`
      INSERT INTO users (email, password, name)
      VALUES ('admin@devaro.com', 'admin123', 'Administrador DevARO')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Neon Database pronta e tabelas verificadas.');
  } catch (error) {
    console.error('Falha crítica ao iniciar banco:', error);
  }
};

export const NeonService = {
  // Autenticação
  async login(email: string, password: string) {
    const users = await sql('SELECT id, email, name FROM users WHERE email = $1 AND password = $2', [email, password]);
    return users.length > 0 ? users[0] : null;
  },

  async register(name: string, email: string, password: string) {
    try {
      const result = await sql(`
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, email, name
      `, [name, email, password]);
      return result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error('Erro no registro de usuário:', error);
      throw error;
    }
  },

  // Clientes
  async getClients() {
    return await sql('SELECT * FROM clients ORDER BY created_at DESC');
  },
  
  async addClient(c: any) {
    try {
      return await sql(`
        INSERT INTO clients (name, email, whatsapp, address, app_name, monthly_value, due_day, status, payment_link)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink]);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
  },

  async updateClient(id: string, c: any) {
    try {
      return await sql(`
        UPDATE clients 
        SET name=$1, email=$2, whatsapp=$3, address=$4, app_name=$5, monthly_value=$6, due_day=$7, status=$8, payment_link=$9
        WHERE id=$10
        RETURNING *
      `, [c.name, c.email, c.whatsapp, c.address, c.appName, c.monthlyValue, c.dueDay, c.status, c.paymentLink, id]);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  async updateClientStatus(id: string, status: string) {
    return await sql('UPDATE clients SET status=$1 WHERE id=$2', [status, id]);
  },

  async deleteClient(id: string) {
    return await sql('DELETE FROM clients WHERE id=$1', [id]);
  },

  // Produtos
  async getProducts() {
    return await sql('SELECT * FROM products ORDER BY name ASC');
  },

  async addProduct(p: any) {
    try {
      console.log('Tentando salvar produto no Neon:', p.name);
      const result = await sql(`
        INSERT INTO products (name, description, price, photo, payment_methods, payment_link_id, external_link)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
        RETURNING *
      `, [p.name, p.description, p.price, p.photo, JSON.stringify(p.paymentMethods), p.paymentLinkId, p.externalLink]);
      console.log('Sucesso ao salvar produto!');
      return result;
    } catch (error: any) {
      console.error('ERRO POSTGRES (addProduct):', error.message, error);
      throw error;
    }
  },

  async updateProduct(id: string, p: any) {
    try {
      return await sql(`
        UPDATE products 
        SET name=$1, description=$2, price=$3, photo=$4, payment_methods=$5::jsonb, payment_link_id=$6, external_link=$7
        WHERE id=$8
        RETURNING *
      `, [p.name, p.description, p.price, p.photo, JSON.stringify(p.paymentMethods), p.paymentLinkId, p.externalLink, id]);
    } catch (error: any) {
      console.error('ERRO POSTGRES (updateProduct):', error.message, error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    return await sql('DELETE FROM products WHERE id=$1', [id]);
  },

  // Configurações
  async getSettings(key: string) {
    const res = await sql('SELECT value FROM settings WHERE key=$1', [key]);
    return res[0]?.value || null;
  },

  async setSettings(key: string, value: any) {
    try {
      return await sql(`
        INSERT INTO settings (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [key, JSON.stringify(value)]);
    } catch (error) {
      console.error('Erro ao salvar settings:', error);
      throw error;
    }
  }
};
