import type { 
  User, Client, Product, Sale, Event, Truck, 
  Invoice, Lead, Campaign, Transaction,
  StockAlert, Notification, Ticket, DashboardKPI, CashFlow
} from '../types';

// ============================================
// MOCK DATA - BEER TRUCK ERP+CRM
// ============================================

export const currentUser: User = {
  id: 'u1',
  name: 'Carlos Mendoza',
  email: 'carlos@beertruck.mx',
  role: 'owner',
  avatar: '',
  phone: '+52 55 1234 5678',
  status: 'active',
  lastLogin: '2026-01-15T10:30:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  permissions: [
    { module: '*', actions: ['create', 'read', 'update', 'delete', 'export'] }
  ]
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'María García', email: 'maria@beertruck.mx', role: 'gerente_operativo', phone: '+52 55 2345 6789', status: 'active', lastLogin: '2026-01-15T09:00:00Z', createdAt: '2024-03-15T00:00:00Z', permissions: [] },
  { id: 'u3', name: 'Juan López', email: 'juan@beertruck.mx', role: 'gerente_comercial', phone: '+52 55 3456 7890', status: 'active', lastLogin: '2026-01-15T08:30:00Z', createdAt: '2024-04-01T00:00:00Z', permissions: [] },
  { id: 'u4', name: 'Ana Martínez', email: 'ana@beertruck.mx', role: 'finanzas', phone: '+52 55 4567 8901', status: 'active', lastLogin: '2026-01-14T17:00:00Z', createdAt: '2024-05-01T00:00:00Z', permissions: [] },
  { id: 'u5', name: 'Roberto Sánchez', email: 'roberto@beertruck.mx', role: 'supervisor_eventos', phone: '+52 55 5678 9012', status: 'active', lastLogin: '2026-01-15T07:00:00Z', createdAt: '2024-06-01T00:00:00Z', permissions: [] },
  { id: 'u6', name: 'Pedro Hernández', email: 'pedro@beertruck.mx', role: 'chofer', phone: '+52 55 6789 0123', status: 'active', lastLogin: '2026-01-15T06:00:00Z', createdAt: '2024-07-01T00:00:00Z', permissions: [] },
  { id: 'u7', name: 'Laura Díaz', email: 'laura@beertruck.mx', role: 'bartender', phone: '+52 55 7890 1234', status: 'active', lastLogin: '2026-01-15T10:00:00Z', createdAt: '2024-08-01T00:00:00Z', permissions: [] },
  { id: 'u8', name: 'Miguel Torres', email: 'miguel@beertruck.mx', role: 'vendedor', phone: '+52 55 8901 2345', status: 'active', lastLogin: '2026-01-15T09:30:00Z', createdAt: '2024-09-01T00:00:00Z', permissions: [] },
  { id: 'u9', name: 'Sofia Ramírez', email: 'sofia@beertruck.mx', role: 'almacen', phone: '+52 55 9012 3456', status: 'active', lastLogin: '2026-01-14T16:00:00Z', createdAt: '2024-10-01T00:00:00Z', permissions: [] },
];

export const clients: Client[] = [
  {
    id: 'c1', type: 'corporate', name: 'Grupo Modelo Events', email: 'events@grupomodelo.com', 
    phone: '+52 55 1111 2222', company: 'Grupo Modelo', rfc: 'GME850101ABC',
    segment: 'vip', loyaltyPoints: 15000, totalPurchases: 450000, lastPurchase: '2026-01-10',
    creditLimit: 100000, tags: ['corporativo', 'premium', 'eventos'], status: 'active', createdAt: '2024-02-15'
  },
  {
    id: 'c2', type: 'corporate', name: 'Tech Summit MX', email: 'logistics@techsummit.mx', 
    phone: '+52 55 2222 3333', company: 'Tech Summit', rfc: 'TSM900201DEF',
    segment: 'vip', loyaltyPoints: 12000, totalPurchases: 320000, lastPurchase: '2026-01-08',
    creditLimit: 75000, tags: ['corporativo', 'tech', 'festival'], status: 'active', createdAt: '2024-04-20'
  },
  {
    id: 'c3', type: 'individual', name: 'Alejandro Ruiz', email: 'aruiz@gmail.com', 
    phone: '+52 55 3333 4444', segment: 'regular', loyaltyPoints: 3500, totalPurchases: 28000, 
    lastPurchase: '2026-01-12', tags: ['eventos', 'cerveza_artesanal'], status: 'active', createdAt: '2024-06-10'
  },
  {
    id: 'c4', type: 'corporate', name: 'Banco Nacional', email: 'eventos@banconacional.mx', 
    phone: '+52 55 4444 5555', company: 'Banco Nacional de México', rfc: 'BNM750301GHI',
    segment: 'vip', loyaltyPoints: 22000, totalPurchases: 580000, lastPurchase: '2026-01-14',
    creditLimit: 150000, tags: ['corporativo', 'premium', 'fidelización'], status: 'active', createdAt: '2024-01-20'
  },
  {
    id: 'c5', type: 'individual', name: 'Fernanda Torres', email: 'fer.torres@outlook.com', 
    phone: '+52 55 5555 6666', segment: 'new', loyaltyPoints: 500, totalPurchases: 2800, 
    lastPurchase: '2026-01-13', tags: ['nuevo', 'whatsapp'], status: 'active', createdAt: '2025-12-01'
  },
  {
    id: 'c6', type: 'corporate', name: 'Live Nation Mexico', email: 'ops@livenation.mx', 
    phone: '+52 55 6666 7777', company: 'Live Nation', rfc: 'LNM880401JKL',
    segment: 'vip', loyaltyPoints: 35000, totalPurchases: 920000, lastPurchase: '2026-01-11',
    creditLimit: 200000, tags: ['corporativo', 'festival', 'premium', 'exclusivo'], status: 'active', createdAt: '2024-03-01'
  },
  {
    id: 'c7', type: 'individual', name: 'Diego Morales', email: 'dmorales@yahoo.com', 
    phone: '+52 55 7777 8888', segment: 'regular', loyaltyPoints: 5200, totalPurchases: 42000, 
    lastPurchase: '2026-01-09', tags: ['cerveza_artesanal', 'suscripcion'], status: 'active', createdAt: '2024-08-15'
  },
  {
    id: 'c8', type: 'individual', name: 'Valentina Cruz', email: 'vcruz@gmail.com', 
    phone: '+52 55 8888 9999', segment: 'inactive', loyaltyPoints: 800, totalPurchases: 5600, 
    lastPurchase: '2025-09-20', tags: ['inactivo', 'reactivar'], status: 'inactive', createdAt: '2024-10-01'
  },
];

export const products: Product[] = [
  { id: 'p1', sku: 'BT-IPA-001', name: 'Hazy IPA Artesanal', description: 'IPA estilo New England, cítrica y tropical', category: 'cerveza_artesanal', brand: 'Beer Truck Craft', type: 'beer_craft', presentation: 'keg', volume: '20L', abv: 6.5, ibu: 45, price: 2800, cost: 1200, tax: 16, isActive: true, minStock: 5, maxStock: 30, tags: ['ipa', 'artesanal', 'popular'], createdAt: '2024-01-01' },
  { id: 'p2', sku: 'BT-STO-001', name: 'Stout Imperial', description: 'Stout oscura con notas de chocolate y café', category: 'cerveza_artesanal', brand: 'Beer Truck Craft', type: 'beer_craft', presentation: 'keg', volume: '20L', abv: 8.2, ibu: 35, price: 3200, cost: 1400, tax: 16, isActive: true, minStock: 3, maxStock: 20, tags: ['stout', 'imperial', 'premium'], createdAt: '2024-01-01' },
  { id: 'p3', sku: 'BT-WHT-001', name: 'Wheat Ale Belga', description: 'Ale de trigo estilo belga, refrescante', category: 'cerveza_artesanal', brand: 'Beer Truck Craft', type: 'beer_craft', presentation: 'keg', volume: '20L', abv: 4.8, ibu: 18, price: 2400, cost: 1000, tax: 16, isActive: true, minStock: 5, maxStock: 25, tags: ['wheat', 'belga', 'verano'], createdAt: '2024-02-01' },
  { id: 'p4', sku: 'BT-LAG-001', name: 'Lager Premium', description: 'Lager dorada, suave y refrescante', category: 'cerveza_comercial', brand: 'Beer Truck', type: 'beer_commercial', presentation: 'keg', volume: '50L', abv: 4.5, ibu: 12, price: 1800, cost: 800, tax: 16, isActive: true, minStock: 10, maxStock: 50, tags: ['lager', 'comercial', 'volumen'], createdAt: '2024-01-01' },
  { id: 'p5', sku: 'BT-PIL-001', name: 'Pilsner Clásica', description: 'Pilsner estilo checo, amargor balanceado', category: 'cerveza_comercial', brand: 'Beer Truck', type: 'beer_commercial', presentation: 'keg', volume: '50L', abv: 4.2, ibu: 28, price: 1600, cost: 700, tax: 16, isActive: true, minStock: 10, maxStock: 50, tags: ['pilsner', 'comercial', 'clasica'], createdAt: '2024-01-01' },
  { id: 'p6', sku: 'BT-IPA-C01', name: 'IPA Lata 355ml', description: 'IPA artesanal en lata', category: 'cerveza_artesanal', brand: 'Beer Truck Craft', type: 'beer_craft', presentation: 'can', volume: '355ml', abv: 6.5, ibu: 45, price: 65, cost: 28, tax: 16, isActive: true, minStock: 100, maxStock: 500, tags: ['lata', 'ipa', 'individual'], createdAt: '2024-03-01' },
  { id: 'p7', sku: 'BT-STO-B01', name: 'Stout Botella 500ml', description: 'Stout imperial en botella', category: 'cerveza_artesanal', brand: 'Beer Truck Craft', type: 'beer_craft', presentation: 'bottle', volume: '500ml', abv: 8.2, ibu: 35, price: 85, cost: 38, tax: 16, isActive: true, minStock: 50, maxStock: 300, tags: ['botella', 'stout', 'regalo'], createdAt: '2024-03-01' },
  { id: 'p8', sku: 'BT-SNK-001', name: 'Nachos con Guacamole', description: 'Nachos artesanales con guacamole fresco', category: 'snack', brand: 'Beer Truck Kitchen', type: 'snack', presentation: 'package', price: 95, cost: 35, tax: 16, isActive: true, minStock: 20, maxStock: 100, tags: ['snack', 'comida', 'popular'], createdAt: '2024-06-01' },
  { id: 'p9', sku: 'BT-SNK-002', name: 'Pretzel con Queso', description: 'Pretzel artesanal con salsa de queso', category: 'snack', brand: 'Beer Truck Kitchen', type: 'snack', presentation: 'package', price: 85, cost: 30, tax: 16, isActive: true, minStock: 15, maxStock: 80, tags: ['snack', 'pretzel', 'popular'], createdAt: '2024-06-01' },
  { id: 'p10', sku: 'BT-MER-001', name: 'Camiseta Beer Truck', description: 'Camiseta oficial 100% algodón', category: 'merchandising', brand: 'Beer Truck', type: 'merchandise', presentation: 'package', price: 350, cost: 120, tax: 16, isActive: true, minStock: 20, maxStock: 100, tags: ['merch', 'ropa', 'branding'], createdAt: '2024-04-01' },
  { id: 'p11', sku: 'BT-CBO-001', name: 'Combo Fiesta', description: '2 Kegs IPA + 2 Kegs Lager + Snacks', category: 'combo', brand: 'Beer Truck', type: 'combo', presentation: 'package', price: 8500, cost: 3800, tax: 16, isActive: true, minStock: 5, maxStock: 20, tags: ['combo', 'fiesta', 'ahorro'], createdAt: '2024-05-01' },
  { id: 'p12', sku: 'BT-SRV-001', name: 'Servicio de Bartender', description: 'Bartender profesional por evento (4hrs)', category: 'servicio', brand: 'Beer Truck', type: 'service', presentation: 'package', price: 3500, cost: 1800, tax: 16, isActive: true, minStock: 0, maxStock: 0, tags: ['servicio', 'bartender', 'evento'], createdAt: '2024-01-01' },
];

export const trucks: Truck[] = [
  {
    id: 't1', name: 'BT-01 Cerveza', plate: 'ABC-1234', model: 'Mercedes Sprinter', year: 2023,
    status: 'available', location: { lat: 19.4326, lng: -99.1332 }, taps: 6, maxKegs: 12,
    currentKegs: [], fuelLevel: 75, temperature: 3.5, lastMaintenance: '2026-01-01', 
    nextMaintenance: '2026-02-01', mileage: 15000
  },
  {
    id: 't2', name: 'BT-02 Fiesta', plate: 'DEF-5678', model: 'Ford Transit', year: 2024,
    status: 'on_route', location: { lat: 19.4284, lng: -99.1276 }, taps: 8, maxKegs: 16,
    currentKegs: [], fuelLevel: 45, temperature: 2.8, lastMaintenance: '2025-12-15',
    nextMaintenance: '2026-01-15', mileage: 8500
  },
  {
    id: 't3', name: 'BT-03 Craft', plate: 'GHI-9012', model: 'RAM ProMaster', year: 2024,
    status: 'at_event', location: { lat: 19.4361, lng: -99.1406 }, taps: 4, maxKegs: 8,
    currentKegs: [], fuelLevel: 60, temperature: 3.2, lastMaintenance: '2026-01-05',
    nextMaintenance: '2026-02-05', mileage: 5200
  },
  {
    id: 't4', name: 'BT-04 Express', plate: 'JKL-3456', model: 'Mercedes Sprinter', year: 2025,
    status: 'maintenance', location: { lat: 19.4200, lng: -99.1500 }, taps: 4, maxKegs: 8,
    currentKegs: [], fuelLevel: 30, temperature: undefined, lastMaintenance: '2026-01-14',
    nextMaintenance: '2026-01-28', mileage: 2100
  },
];

export const sales: Sale[] = [
  {
    id: 's1', saleNumber: 'VT-2026-0001', clientId: 'c1', userId: 'u8', truckId: 't1',
    eventId: 'e1', items: [
      { id: 'si1', productId: 'p1', quantity: 3, unitPrice: 2800, discount: 0, tax: 448, total: 8400 },
      { id: 'si2', productId: 'p4', quantity: 2, unitPrice: 1800, discount: 0, tax: 288, total: 3600 },
    ], subtotal: 12000, tax: 1920, discount: 0, total: 13920,
    paymentMethod: 'transfer', paymentStatus: 'paid', status: 'completed', createdAt: '2026-01-15T14:30:00Z'
  },
  {
    id: 's2', saleNumber: 'VT-2026-0002', clientId: 'c2', userId: 'u8', truckId: 't2',
    items: [
      { id: 'si3', productId: 'p1', quantity: 5, unitPrice: 2800, discount: 280, tax: 700, total: 14000 },
      { id: 'si4', productId: 'p3', quantity: 3, unitPrice: 2400, discount: 0, tax: 384, total: 7200 },
      { id: 'si5', productId: 'p8', quantity: 20, unitPrice: 95, discount: 0, tax: 152, total: 1900 },
    ], subtotal: 23100, tax: 3696, discount: 280, total: 26516,
    paymentMethod: 'card', paymentStatus: 'paid', status: 'completed', createdAt: '2026-01-14T18:00:00Z'
  },
  {
    id: 's3', saleNumber: 'VT-2026-0003', clientId: 'c6', userId: 'u3', 
    eventId: 'e2', items: [
      { id: 'si6', productId: 'p11', quantity: 5, unitPrice: 8500, discount: 425, tax: 680, total: 42500 },
      { id: 'si7', productId: 'p12', quantity: 3, unitPrice: 3500, discount: 0, tax: 560, total: 10500 },
    ], subtotal: 53000, tax: 8480, discount: 425, total: 61055,
    paymentMethod: 'transfer', paymentStatus: 'partial', status: 'completed', createdAt: '2026-01-13T10:00:00Z'
  },
  {
    id: 's4', saleNumber: 'VT-2026-0004', userId: 'u8', truckId: 't1',
    items: [
      { id: 'si8', productId: 'p6', quantity: 4, unitPrice: 65, discount: 0, tax: 10.4, total: 260 },
      { id: 'si9', productId: 'p9', quantity: 2, unitPrice: 85, discount: 0, tax: 13.6, total: 170 },
    ], subtotal: 430, tax: 68.8, discount: 0, total: 498.8,
    paymentMethod: 'cash', paymentStatus: 'paid', status: 'completed', createdAt: '2026-01-15T16:45:00Z'
  },
  {
    id: 's5', saleNumber: 'VT-2026-0005', clientId: 'c4', userId: 'u3',
    items: [
      { id: 'si10', productId: 'p2', quantity: 8, unitPrice: 3200, discount: 512, tax: 1228.8, total: 25600 },
      { id: 'si11', productId: 'p1', quantity: 5, unitPrice: 2800, discount: 280, tax: 1064, total: 14000 },
    ], subtotal: 39600, tax: 6336, discount: 792, total: 45144,
    paymentMethod: 'transfer', paymentStatus: 'pending', status: 'completed', createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 's6', saleNumber: 'VT-2026-0006', clientId: 'c3', userId: 'u7', truckId: 't3',
    items: [
      { id: 'si12', productId: 'p6', quantity: 6, unitPrice: 65, discount: 0, tax: 62.4, total: 390 },
      { id: 'si13', productId: 'p10', quantity: 1, unitPrice: 350, discount: 0, tax: 56, total: 350 },
    ], subtotal: 740, tax: 118.4, discount: 0, total: 858.4,
    paymentMethod: 'card', paymentStatus: 'paid', status: 'completed', createdAt: '2026-01-15T20:00:00Z'
  },
];

export const events: Event[] = [
  {
    id: 'e1', title: 'Tech Summit 2026 - Beer Garden', type: 'festival', clientId: 'c2',
    startDate: '2026-02-15', endDate: '2026-02-16', startTime: '12:00', endTime: '23:00',
    location: { name: 'Centro Banamex', address: 'Av. Conscripto 311, Hipódromo', city: 'CDMX', indoor: true, powerAvailable: true, waterAccess: true },
    attendees: 5000, budget: 180000, quotedPrice: 165000, finalPrice: 165000,
    status: 'confirmed', assignedTrucks: ['t1', 't2', 't3'], assignedStaff: ['u5', 'u7', 'u8'],
    equipment: [], menu: [], createdAt: '2025-12-01'
  },
  {
    id: 'e2', title: 'Boda García-Torres', type: 'wedding', clientId: 'c3',
    startDate: '2026-03-20', endDate: '2026-03-20', startTime: '16:00', endTime: '02:00',
    location: { name: 'Hacienda San Gabriel', address: 'Carretera México-Toluca Km 45', city: 'Toluca', indoor: false, powerAvailable: true, waterAccess: true },
    attendees: 250, budget: 85000, quotedPrice: 78000,
    status: 'quoted', assignedTrucks: ['t1'], assignedStaff: ['u5', 'u7'],
    equipment: [], menu: [], createdAt: '2026-01-05'
  },
  {
    id: 'e3', title: 'Activación Corona Summer', type: 'brand_activation', clientId: 'c1',
    startDate: '2026-04-10', endDate: '2026-04-12', startTime: '14:00', endTime: '22:00',
    location: { name: 'Playa del Carmen', address: '5ta Avenida', city: 'Playa del Carmen', indoor: false, powerAvailable: true, waterAccess: true },
    attendees: 3000, budget: 250000, quotedPrice: 235000,
    status: 'confirmed', assignedTrucks: ['t1', 't2'], assignedStaff: ['u5', 'u6', 'u7', 'u8'],
    equipment: [], menu: [], createdAt: '2025-11-15'
  },
  {
    id: 'e4', title: 'Fiesta Corporativa Banco Nacional', type: 'corporate', clientId: 'c4',
    startDate: '2026-02-28', endDate: '2026-02-28', startTime: '18:00', endTime: '23:00',
    location: { name: 'Hotel Four Seasons', address: 'Paseo de la Reforma 500', city: 'CDMX', indoor: true, powerAvailable: true, waterAccess: true },
    attendees: 150, budget: 95000, quotedPrice: 88000,
    status: 'confirmed', assignedTrucks: ['t3'], assignedStaff: ['u5', 'u7'],
    equipment: [], menu: [], createdAt: '2026-01-10'
  },
  {
    id: 'e5', title: 'Live Nation - Festival Cervecero', type: 'festival', clientId: 'c6',
    startDate: '2026-05-01', endDate: '2026-05-03', startTime: '12:00', endTime: '00:00',
    location: { name: 'Foro Sol', address: 'Viaducto Río de la Piedad', city: 'CDMX', indoor: false, powerAvailable: true, waterAccess: true },
    attendees: 25000, budget: 850000, quotedPrice: 780000,
    status: 'inquiry', assignedTrucks: [], assignedStaff: [],
    equipment: [], menu: [], createdAt: '2026-01-14'
  },
];

export const leads: Lead[] = [
  { id: 'l1', name: 'Corona Events', email: 'events@corona.com', phone: '+52 55 1000 2000', company: 'Corona', source: 'referral', status: 'qualified', value: 500000, assignedTo: 'u3', tags: ['premium', 'marca'], createdAt: '2026-01-10', updatedAt: '2026-01-14' },
  { id: 'l2', name: 'Cervecería Artesanal MX', email: 'info@cerveceria.mx', phone: '+52 55 2000 3000', company: 'Cervecería Artesanal MX', source: 'web', status: 'proposal', value: 120000, assignedTo: 'u3', tags: ['artesanal', 'distribución'], createdAt: '2026-01-08', updatedAt: '2026-01-13' },
  { id: 'l3', name: 'Wedding Planner Sofía', email: 'sofia@wp.com', phone: '+52 55 3000 4000', source: 'instagram', status: 'contacted', value: 85000, assignedTo: 'u5', tags: ['boda', 'premium'], createdAt: '2026-01-12', updatedAt: '2026-01-14' },
  { id: 'l4', name: 'Startup Hub CDMX', email: 'events@startuphub.mx', phone: '+52 55 4000 5000', company: 'Startup Hub', source: 'event', status: 'new', value: 95000, tags: ['tech', 'coworking'], createdAt: '2026-01-15', updatedAt: '2026-01-15' },
  { id: 'l5', name: 'MegaFest 2026', email: 'ops@megafest.mx', phone: '+52 55 5000 6000', company: 'MegaFest', source: 'cold_call', status: 'negotiation', value: 450000, assignedTo: 'u3', tags: ['festival', 'premium', 'volumen'], createdAt: '2025-12-20', updatedAt: '2026-01-14' },
];

export const invoices: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'FAC-2026-0001', saleId: 's1', clientId: 'c1', items: [{ description: 'Hazy IPA Artesanal x3', quantity: 3, unitPrice: 2800, tax: 1344, total: 8400 }, { description: 'Lager Premium x2', quantity: 2, unitPrice: 1800, tax: 576, total: 3600 }], subtotal: 12000, tax: 1920, total: 13920, currency: 'MXN', status: 'paid', dueDate: '2026-02-14', paidDate: '2026-01-15', createdAt: '2026-01-15' },
  { id: 'inv2', invoiceNumber: 'FAC-2026-0002', saleId: 's2', clientId: 'c2', items: [{ description: 'Productos varios', quantity: 1, unitPrice: 23100, tax: 3696, total: 26796 }], subtotal: 23100, tax: 3696, total: 26796, currency: 'MXN', status: 'sent', dueDate: '2026-02-13', createdAt: '2026-01-14' },
  { id: 'inv3', invoiceNumber: 'FAC-2026-0003', saleId: 's3', clientId: 'c6', items: [{ description: 'Servicios de evento', quantity: 1, unitPrice: 53000, tax: 8480, total: 61480 }], subtotal: 53000, tax: 8480, total: 61480, currency: 'MXN', status: 'paid', dueDate: '2026-02-12', paidDate: '2026-01-10', createdAt: '2026-01-13' },
  { id: 'inv4', invoiceNumber: 'FAC-2026-0004', saleId: 's5', clientId: 'c4', items: [{ description: 'Stout Imperial x8 + IPA x5', quantity: 1, unitPrice: 39600, tax: 6336, total: 45936 }], subtotal: 39600, tax: 6336, total: 45936, currency: 'MXN', status: 'overdue', dueDate: '2026-01-12', createdAt: '2026-01-12' },
];

export const transactions: Transaction[] = [
  { id: 'tr1', type: 'income', category: 'Ventas', description: 'Venta VT-2026-0001', amount: 13920, currency: 'MXN', date: '2026-01-15', reference: 'VT-2026-0001', paymentMethod: 'transfer', status: 'completed', createdAt: '2026-01-15' },
  { id: 'tr2', type: 'income', category: 'Ventas', description: 'Venta VT-2026-0002', amount: 26516, currency: 'MXN', date: '2026-01-14', reference: 'VT-2026-0002', paymentMethod: 'card', status: 'completed', createdAt: '2026-01-14' },
  { id: 'tr3', type: 'income', category: 'Eventos', description: 'Pago evento Live Nation', amount: 61055, currency: 'MXN', date: '2026-01-13', reference: 'VT-2026-0003', paymentMethod: 'transfer', status: 'completed', createdAt: '2026-01-13' },
  { id: 'tr4', type: 'expense', category: 'Inventario', description: 'Compra de materia prima', amount: 18500, currency: 'MXN', date: '2026-01-14', paymentMethod: 'transfer', status: 'completed', createdAt: '2026-01-14' },
  { id: 'tr5', type: 'expense', category: 'Nómina', description: 'Nómina quincenal enero', amount: 85000, currency: 'MXN', date: '2026-01-15', paymentMethod: 'transfer', status: 'completed', createdAt: '2026-01-15' },
  { id: 'tr6', type: 'expense', category: 'Combustible', description: 'Gasolina flotilla', amount: 4500, currency: 'MXN', date: '2026-01-15', paymentMethod: 'card', status: 'completed', createdAt: '2026-01-15' },
  { id: 'tr7', type: 'expense', category: 'Mantenimiento', description: 'Mantenimiento BT-04', amount: 12000, currency: 'MXN', date: '2026-01-14', paymentMethod: 'card', status: 'completed', createdAt: '2026-01-14' },
  { id: 'tr8', type: 'income', category: 'Ventas', description: 'Venta en mostrador', amount: 498.8, currency: 'MXN', date: '2026-01-15', paymentMethod: 'cash', status: 'completed', createdAt: '2026-01-15' },
];

export const campaigns: Campaign[] = [
  {
    id: 'camp1', name: 'Lanzamiento Nueva IPA', type: 'email', status: 'completed',
    targetSegment: 'vip', content: { subject: '¡Prueba nuestra nueva Hazy IPA!', body: 'Descubre el sabor tropical...', cta: 'Ordena ahora' },
    stats: { sent: 450, delivered: 442, opened: 285, clicked: 120, converted: 45 },
    createdAt: '2026-01-10'
  },
  {
    id: 'camp2', name: 'Promoción Enero', type: 'whatsapp', status: 'active',
    targetSegment: 'regular', content: { body: '🍺 ¡20% de descuento en combos este fin de semana!' },
    stats: { sent: 1200, delivered: 1180, opened: 950, clicked: 320, converted: 85 },
    createdAt: '2026-01-12'
  },
  {
    id: 'camp3', name: 'Reactivación Clientes', type: 'sms', status: 'active',
    targetSegment: 'inactive', content: { body: 'Te extrañamos 🍻 Vuelve y recibe 15% off' },
    stats: { sent: 200, delivered: 195, opened: 0, clicked: 0, converted: 0 },
    createdAt: '2026-01-14'
  },
  {
    id: 'camp4', name: 'Newsletter Semanal', type: 'email', status: 'scheduled',
    targetSegment: 'all', content: { subject: 'Nuevos sabores esta semana', body: 'Descubre nuestras cervezas...', cta: 'Ver catálogo' },
    createdAt: '2026-01-15'
  },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'warning', title: 'Stock Bajo', message: 'IPA Lata 355ml por debajo del mínimo en BT-01', read: false, actionUrl: '/inventory', createdAt: '2026-01-15T10:00:00Z' },
  { id: 'n2', type: 'success', title: 'Pago Recibido', message: 'Transferencia de Grupo Modelo Events por $13,920 MXN', read: false, createdAt: '2026-01-15T09:30:00Z' },
  { id: 'n3', type: 'info', title: 'Nuevo Lead', message: 'Startup Hub CDMX interesado en evento corporativo', read: false, actionUrl: '/crm/leads', createdAt: '2026-01-15T08:45:00Z' },
  { id: 'n4', type: 'error', title: 'Factura Vencida', message: 'FAC-2026-0004 de Banco Nacional está vencida', read: false, actionUrl: '/finance', createdAt: '2026-01-15T08:00:00Z' },
  { id: 'n5', type: 'warning', title: 'Mantenimiento Pendiente', message: 'BT-04 Express requiere mantenimiento programado', read: true, actionUrl: '/logistics', createdAt: '2026-01-14T17:00:00Z' },
  { id: 'n6', type: 'success', title: 'Evento Confirmado', message: 'Fiesta Corporativa Banco Nacional confirmada para Feb 28', read: true, actionUrl: '/events', createdAt: '2026-01-14T15:00:00Z' },
];

export const stockAlerts: StockAlert[] = [
  { id: 'sa1', type: 'low_stock', productId: 'p6', location: 'BT-01', currentStock: 45, minStock: 100, severity: 'high', createdAt: '2026-01-15', resolved: false },
  { id: 'sa2', type: 'low_stock', productId: 'p8', location: 'Almacén Central', currentStock: 18, minStock: 20, severity: 'medium', createdAt: '2026-01-15', resolved: false },
  { id: 'sa3', type: 'expiring', productId: 'p3', location: 'BT-02', currentStock: 8, minStock: 5, severity: 'low', createdAt: '2026-01-14', resolved: false },
];

export const tickets: Ticket[] = [
  { id: 'tk1', subject: 'Grifo #3 BT-01 pierde presión', description: 'El grifo 3 del camión BT-01 presenta fuga de presión', status: 'in_progress', priority: 'high', category: 'Mantenimiento', assignedTo: 'u9', createdAt: '2026-01-15', updatedAt: '2026-01-15' },
  { id: 'tk2', subject: 'Sistema POS sin conexión', description: 'El POS del BT-02 no conecta a internet desde anoche', status: 'open', priority: 'critical', category: 'Tecnología', assignedTo: 'u2', createdAt: '2026-01-15', updatedAt: '2026-01-15' },
  { id: 'tk3', subject: 'Solicitud de reabastecimiento', description: 'Se solicita reabastecimiento urgente para BT-03', status: 'open', priority: 'medium', category: 'Inventario', assignedTo: 'u9', createdAt: '2026-01-14', updatedAt: '2026-01-14' },
];

export const cashFlowData: CashFlow[] = [
  { date: '01 Ene', income: 45000, expenses: 32000, net: 13000, balance: 13000 },
  { date: '02 Ene', income: 38000, expenses: 28000, net: 10000, balance: 23000 },
  { date: '03 Ene', income: 52000, expenses: 35000, net: 17000, balance: 40000 },
  { date: '04 Ene', income: 28000, expenses: 22000, net: 6000, balance: 46000 },
  { date: '05 Ene', income: 65000, expenses: 42000, net: 23000, balance: 69000 },
  { date: '06 Ene', income: 72000, expenses: 38000, net: 34000, balance: 103000 },
  { date: '07 Ene', income: 58000, expenses: 30000, net: 28000, balance: 131000 },
  { date: '08 Ene', income: 48000, expenses: 35000, net: 13000, balance: 144000 },
  { date: '09 Ene', income: 35000, expenses: 25000, net: 10000, balance: 154000 },
  { date: '10 Ene', income: 62000, expenses: 40000, net: 22000, balance: 176000 },
  { date: '11 Ene', income: 78000, expenses: 45000, net: 33000, balance: 209000 },
  { date: '12 Ene', income: 95000, expenses: 52000, net: 43000, balance: 252000 },
  { date: '13 Ene', income: 110000, expenses: 58000, net: 52000, balance: 304000 },
  { date: '14 Ene', income: 85000, expenses: 48000, net: 37000, balance: 341000 },
  { date: '15 Ene', income: 42000, expenses: 102000, net: -60000, balance: 281000 },
];

export const kpis: DashboardKPI[] = [
  { label: 'Ingresos del Mes', value: 847500, change: 12.5, changeType: 'increase', format: 'currency' },
  { label: 'Ventas Hoy', value: 45415, change: 8.3, changeType: 'increase', format: 'currency' },
  { label: 'Clientes Activos', value: 156, change: 5.2, changeType: 'increase', format: 'number' },
  { label: 'Eventos del Mes', value: 8, change: 33.3, changeType: 'increase', format: 'number' },
  { label: 'Tickets Abiertos', value: 3, change: -25, changeType: 'decrease', format: 'number' },
  { label: 'Margen de Ganancia', value: 42.5, change: 2.1, changeType: 'increase', format: 'percentage' },
];

export const salesByDay = [
  { name: 'Lun', ventas: 42000, eventos: 0 },
  { name: 'Mar', ventas: 38000, eventos: 15000 },
  { name: 'Mié', ventas: 45000, eventos: 0 },
  { name: 'Jue', ventas: 52000, eventos: 28000 },
  { name: 'Vie', ventas: 78000, eventos: 65000 },
  { name: 'Sáb', ventas: 95000, eventos: 120000 },
  { name: 'Dom', ventas: 68000, eventos: 45000 },
];

export const topProducts = [
  { name: 'Hazy IPA', ventas: 185000, unidades: 66 },
  { name: 'Lager Premium', ventas: 142000, unidades: 79 },
  { name: 'Stout Imperial', ventas: 128000, unidades: 40 },
  { name: 'Combo Fiesta', ventas: 85000, unidades: 10 },
  { name: 'Wheat Ale', ventas: 72000, unidades: 30 },
  { name: 'IPA Lata', ventas: 48000, unidades: 738 },
];

export const revenueByChannel = [
  { name: 'Eventos', value: 45, fill: '#ef9a11' },
  { name: 'Ventas Directas', value: 25, fill: '#d97706' },
  { name: 'Catering', value: 15, fill: '#b45309' },
  { name: 'Online', value: 10, fill: '#92400e' },
  { name: 'Suscripciones', value: 5, fill: '#78350f' },
];
