
import { Client, ClientStatus } from './types';

// Adding paymentLink to satisfy the Client interface requirements which were missing in the initial data
export const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    whatsapp: '5511999999999',
    address: 'Av. Paulista, 1000, São Paulo - SP',
    appName: 'Gestor Plus',
    monthlyValue: 150.00,
    dueDay: 10,
    status: ClientStatus.ACTIVE,
    paymentLink: 'https://pay.devaro.com/link1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@restaurante.com',
    whatsapp: '5511888888888',
    address: 'Rua das Flores, 50, Rio de Janeiro - RJ',
    appName: 'Cardápio Digital',
    monthlyValue: 89.90,
    dueDay: 5,
    status: ClientStatus.LATE,
    paymentLink: 'https://pay.devaro.com/link1',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tech Solutions',
    email: 'contato@techsol.com',
    whatsapp: '5511777777777',
    address: 'Rua Inovação, 500, Belo Horizonte - MG',
    appName: 'ERP DevARO',
    monthlyValue: 499.00,
    dueDay: 25,
    status: ClientStatus.ACTIVE,
    paymentLink: 'https://pay.devaro.com/link1',
    createdAt: new Date().toISOString()
  }
];

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};
