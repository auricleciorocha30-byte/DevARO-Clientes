
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  LATE = 'LATE',
  PAUSED = 'PAUSED',
  TESTING = 'TESTING'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER'
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  password?: string;
  address: string;
  approved: boolean;
  active: boolean;
  lat?: number;
  lng?: number;
  last_seen?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  address: string;
  appName: string;
  monthlyValue: number;
  dueDay: number;
  status: ClientStatus;
  paymentLink: string;
  seller_id?: string;
  createdAt: string;
}

export interface AppMessage {
  id: string;
  content: string;
  receiver_email: string | null; // null means "General"
  sender_name: string;
  created_at: string;
}

export enum PaymentMethod {
  LINK = 'LINK',
  PIX = 'PIX',
  DELIVERY = 'DELIVERY'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  photo: string;
  paymentMethods: PaymentMethod[];
  paymentLinkId: 'link1' | 'link2' | 'link3' | 'link4';
  externalLink?: string; 
}

export interface CatalogConfig {
  address: string;
  whatsapp: string;
  companyName: string;
}

export interface GlobalPaymentLinks {
  link1: string;
  link2: string;
  link3: string;
  link4: string;
}

export interface SellerPermissions {
  canDeleteClients: boolean;
}

export type View = 'dashboard' | 'clients' | 'catalog' | 'showcase' | 'settings' | 'sellers' | 'seller_register' | 'messages' | 'sellers_location';
