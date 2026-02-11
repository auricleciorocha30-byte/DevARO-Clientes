export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  LATE = 'LATE',
  PAUSED = 'PAUSED',
  TESTING = 'TESTING'
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
  lastPaymentDate?: string;
  paymentLink: string; // Link específico deste cliente
  createdAt: string;
}

export enum PaymentMethod {
  LINK = 'LINK',
  PIX = 'PIX',
  DELIVERY = 'DELIVERY'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  photo: string; // Base64
  paymentMethods: PaymentMethod[];
  paymentLinkId: 'link1' | 'link2' | 'link3' | 'link4'; // Identificador do link global usado
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

export type View = 'dashboard' | 'clients' | 'catalog' | 'showcase' | 'settings';