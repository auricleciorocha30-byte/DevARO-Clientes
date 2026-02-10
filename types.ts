
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
  createdAt: string;
}

export type View = 'dashboard' | 'clients' | 'settings';
