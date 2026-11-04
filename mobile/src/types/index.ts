export interface Customer {
  id: string;
  idName: string;
  date: string | null;
  mailId: string | null;
  mDate: string | null;
  passwordStatus: 'Set' | 'Not Set';
  fixedValue: number | null;
  regularValue: number | null;
  comboValue: number | null;
  arp: number | null;
  balanceCoin: number;
  withdrawCoin: number;
  withdrawFee: number;
  remainingCoin: number;
  totalCoin: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  id_name: string;
  date?: string;
  mail_id?: string;
  m_date?: string;
  password?: string;
  fixed_value?: number | null;
  regular_value?: number | null;
  combo_value?: number | null;
  arp?: number | null;
  balance_coin?: number;
  withdraw_coin?: number;
  withdraw_fee?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: Pagination;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalBalanceCoin: number;
  totalWithdrawCoin: number;
  totalWithdrawFee: number;
  totalRemainingCoin: number;
  totalCoin: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentCustomers: Partial<Customer>[];
  recentWithdrawals: any[];
}

export const FIXED_OPTIONS = [3, 5] as const;
export const REGULAR_OPTIONS = [60, 55, 50, 45, 40] as const;
export const COMBO_OPTIONS = [5, 3] as const;
