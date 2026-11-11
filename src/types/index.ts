export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { rooms: number };
}

export interface Room {
  id: string;
  name: string;
  price: number;
  area?: number | null;
  maxCapacity?: number | null;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  propertyId?: string | null;
  property?: Property | null;
  landlord?: {
    name: string;
    bankName?: string | null;
    bankAccount?: string | null;
    bankAccountName?: string | null;
  };
  assets?: { name: string; quantity: number; status: string }[];
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  contracts?: Contract[];
}

export interface Tenant {
  id: string;
  fullName: string;
  cccd: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;
  address?: string | null;
  dob?: string | null;
  gender?: string | null;
  contracts?: Contract[];
  roommateOfContractId?: string | null;
  roommateOfContract?: Contract | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate?: string | null;
  paymentCycle?: number;
  deposit: number;
  electricityRate: number;
  waterRate: number;
  customServices?: { name: string; amount: number }[];
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  tenant?: Tenant;
  roommates?: Tenant[];
  daysUntilExpiration?: number;
}

export interface Invoice {
  id: string;
  contractId: string;
  invoiceCode?: string | null;
  month: number;
  year: number;
  rentAmount: number;
  electricityAmount: number;
  waterAmount: number;
  customServices?: { name: string; amount: number }[];
  otherAmount: number;
  totalAmount: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  paidAt?: string | null;
  notes?: string | null;
  paymentLink?: string | null;
  createdAt: string;
  updatedAt: string;
  contract?: Contract;
}

export interface DashboardStats {
  rooms: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    occupancyRate: number;
  };
  tenants: {
    total: number;
    activeContracts: number;
  };
  invoices: {
    unpaid: number;
    overdue: number;
    total?: number;
    unpaidAmount?: number;
  };
  revenue: {
    currentMonth: number;
    month: number;
    year: number;
  };
  vulnerabilities?: {
    unpaidRate: number;
    depositsToRefund: number;
    inactiveContractsDetails: {
      deposit: number;
      room: { name: string };
      tenant: { fullName: string };
    }[];
    expiringContractsDetails: {
      deposit: number;
      endDate: string;
      room: { name: string };
    }[];
  };
}

export interface AdvancedDashboardStats {
  monthly: {
    month: number;
    year: number;
    name: string;
    income: number;
    expense: number;
    net: number;
  }[];
  quarterly: {
    quarter: number;
    name: string;
    income: number;
    expense: number;
    net: number;
  }[];
  propertyPerformance: {
    propertyId: string;
    name: string;
    revenue: number;
  }[];
  occupancy: {
    total: number;
    rented: number;
    available: number;
    maintenance: number;
    rate: number;
  };
  forecast: {
    revenue: number;
    basedOnMonths: number;
    method: "average_of_previous_3_completed_months";
  };
}

export type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  room?: Room;
  tenantId?: string | null;
  tenant?: Tenant;
  title: string;
  description?: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  cost?: number | null;
  imageUrl?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  landlordId: string;
  roomId?: string | null;
  room?: Room | null;
  propertyId?: string | null;
  property?: Property | null;
  createdAt: string;
  updatedAt: string;
}

export interface UtilityReading {
  id: string;
  contractId: string;
  month: number;
  year: number;
  electricityPrev: number;
  electricityCurr: number;
  waterPrev: number;
  waterCurr: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
