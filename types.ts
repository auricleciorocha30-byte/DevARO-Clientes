
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
  address: string; // Novo campo
  appName: string;
  monthlyValue: number;
  dueDay: number;
  status: ClientStatus;
  lastPaymentDate?: string;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  clientId: string;
  type: 'email' | 'whatsapp';
  sentAt: string;
  message: string;
}

export type View = 'dashboard' | 'clients' | 'automations' | 'settings';
