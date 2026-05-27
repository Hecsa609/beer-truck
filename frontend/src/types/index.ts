// ============================================
// BEER TRUCK ERP+CRM - Type Definitions
// ============================================

// User & Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  permissions: Permission[];
}

export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'gerente_operativo' 
  | 'gerente_comercial' 
  | 'finanzas' 
  | 'supervisor_eventos' 
  | 'bartender' 
  | 'chofer' 
  | 'vendedor' 
  | 'almacen' 
  | 'soporte'
  | 'cliente_final'
  | 'cliente_corporativo';

export interface Permission {
  module: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'export')[];
}

// CRM Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'web' | 'referral' | 'event' | 'social' | 'cold_call' | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  assignedTo?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  type: 'individual' | 'corporate';
  name: string;
  email: string;
  phone: string;
  company?: string;
  rfc?: string;
  address?: Address;
  taxInfo?: TaxInfo;
  segment: 'vip' | 'regular' | 'new' | 'inactive';
  loyaltyPoints: number;
  totalPurchases: number;
  lastPurchase?: string;
  creditLimit?: number;
  preferredProducts?: string[];
  tags: string[];
  notes?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface TaxInfo {
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
  usoCFDI: string;
  direccionFiscal: Address;
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  brand: string;
  type: 'beer_craft' | 'beer_commercial' | 'snack' | 'merchandise' | 'combo' | 'service';
  presentation: 'keg' | 'bottle' | 'can' | 'draft' | 'package';
  volume?: string;
  abv?: number;
  ibu?: number;
  price: number;
  cost: number;
  tax: number;
  image?: string;
  isActive: boolean;
  barcode?: string;
  minStock: number;
  maxStock: number;
  tags: string[];
  createdAt: string;
}

export type ProductCategory = 
  | 'cerveza_artesanal' 
  | 'cerveza_comercial' 
  | 'snack' 
  | 'merchandising' 
  | 'combo' 
  | 'servicio';

export interface Keg {
  id: string;
  kegNumber: string;
  productId: string;
  product?: Product;
  size: 'half' | 'quarter' | 'sixth' | 'full';
  volumeLiters: number;
  remainingLiters: number;
  status: 'full' | 'partial' | 'empty' | 'cleaning' | 'maintenance';
  location: string;
  truckId?: string;
  tapNumber?: number;
  temperature?: number;
  pressurePsi?: number;
  filledDate?: string;
  expiryDate?: string;
  batchNumber?: string;
}

// Sales Types
export interface Sale {
  id: string;
  saleNumber: string;
  clientId?: string;
  client?: Client;
  userId: string;
  user?: User;
  truckId?: string;
  eventId?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  status: 'draft' | 'pending' | 'completed' | 'cancelled' | 'refunded';
  invoiceId?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'paypal' | 'stripe' | 'mercadopago' | 'credit';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  saleId: string;
  clientId: string;
  client?: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'cancelled' | 'overdue';
  dueDate: string;
  paidDate?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  cfdi?: CFDIInfo;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface CFDIInfo {
  uuid: string;
  fechaTimbrado: string;
  selloDigital: string;
  regimenFiscal: string;
  usoCFDI: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  productId: string;
  product?: Product;
  location: string;
  truckId?: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  lastRestock?: string;
  fifoBatch?: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface InventoryTransfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  items: TransferItem[];
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransferItem {
  productId: string;
  quantity: number;
  received?: number;
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'temperature';
  productId: string;
  location: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolved: boolean;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  client?: Client;
  clientId?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: EventLocation;
  attendees: number;
  budget?: number;
  quotedPrice?: number;
  finalPrice?: number;
  status: EventStatus;
  assignedTrucks: string[];
  assignedStaff: string[];
  equipment: EquipmentItem[];
  menu: EventMenuItem[];
  contract?: string;
  notes?: string;
  createdAt: string;
}

export type EventType = 'private' | 'festival' | 'corporate' | 'wedding' | 'brand_activation' | 'catering' | 'subscription';

export type EventStatus = 'inquiry' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface EventLocation {
  name: string;
  address: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  indoor: boolean;
  powerAvailable: boolean;
  waterAccess: boolean;
}

export interface EquipmentItem {
  name: string;
  quantity: number;
  status: 'available' | 'assigned' | 'maintenance';
}

export interface EventMenuItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
}

// Truck Types
export interface Truck {
  id: string;
  name: string;
  plate: string;
  model: string;
  year: number;
  status: 'available' | 'on_route' | 'at_event' | 'maintenance' | 'offline';
  location?: { lat: number; lng: number };
  driver?: User;
  taps: number;
  maxKegs: number;
  currentKegs: Keg[];
  fuelLevel?: number;
  temperature?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  mileage?: number;
  images?: string[];
}

// Route Types
export interface Route {
  id: string;
  name: string;
  truckId: string;
  driverId: string;
  stops: RouteStop[];
  status: 'planned' | 'in_progress' | 'completed';
  plannedDate: string;
  startTime?: string;
  endTime?: string;
  distance?: number;
  estimatedDuration?: number;
}

export interface RouteStop {
  id: string;
  location: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  type: 'delivery' | 'pickup' | 'event' | 'restock';
  status: 'pending' | 'completed' | 'skipped';
  scheduledTime: string;
  actualTime?: string;
  notes?: string;
}

// Finance Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  reference?: string;
  relatedId?: string;
  paymentMethod?: PaymentMethod;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CashFlow {
  date: string;
  income: number;
  expenses: number;
  net: number;
  balance: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashOnHand: number;
  monthlyGrowth: number;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  targetSegment: string;
  content: {
    subject?: string;
    body: string;
    cta?: string;
    imageUrl?: string;
  };
  scheduledDate?: string;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
}

// Dashboard Types
export interface DashboardKPI {
  label: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
  format: 'currency' | 'number' | 'percentage';
  icon?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

// Support Types
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignedTo?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}
