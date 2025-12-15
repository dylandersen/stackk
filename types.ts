export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextPayment: string;
  color: string;
  logo: string;
  usageMetric?: string;
  usageCurrent?: number;
  usageLimit?: number;
  usageUnit?: string;
  status: 'active' | 'paused' | 'canceled';
  connected: boolean;
  slug?: string;
  sortOrder?: number;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface NotificationChannel {
  id: string;
  type: 'push' | 'email' | 'slack';
  name: string;
  detail: string;
  enabled: boolean;
}