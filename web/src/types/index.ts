// Customer types
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
  netCoin?: number | null;
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
  net_coin?: number | null;
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

// Admin types
export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Dashboard types
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

// Report types
export interface ReportSummary {
  totalCustomers: number;
  totalBalanceCoin: number;
  totalWithdrawCoin: number;
  totalWithdrawFee: number;
  totalRemainingCoin: number;
  totalCoin: number;
}

// Audit log types
export interface AuditLog {
  id: string;
  adminId: string | null;
  customerId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { id: string; username: string } | null;
  customer: { id: string; idName: string } | null;
}

// Dropdown options
export const FIXED_OPTIONS = [3, 5] as const;
export const REGULAR_OPTIONS = [60, 55, 50, 45, 40] as const;
export const COMBO_OPTIONS = [5, 3] as const;

export type FixedValue = (typeof FIXED_OPTIONS)[number];
export type RegularValue = (typeof REGULAR_OPTIONS)[number];
export type ComboValue = (typeof COMBO_OPTIONS)[number];

// Filter types
export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fixedValue?: number;
  regularValue?: number;
  comboValue?: number;
  dateFrom?: string;
  dateTo?: string;
  mDateFrom?: string;
  mDateTo?: string;
}
