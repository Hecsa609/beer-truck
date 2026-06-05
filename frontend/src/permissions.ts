export type UserRole =
  | 'owner'
  | 'admin'
  | 'gerente'
  | 'staff'
  | 'bartender'
  | 'chofer'
  | 'vendedor'

export interface ModulePermission {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface RolePermissions {
  dashboard: ModulePermission
  crm: ModulePermission
  ventas: ModulePermission
  inventario: ModulePermission
  eventos: ModulePermission
  logistica: ModulePermission
  finanzas: ModulePermission
  reportes: ModulePermission
  usuarios: ModulePermission
  configuracion: ModulePermission
}

const fullAccess: ModulePermission = {
  canView: true, canCreate: true, canEdit: true, canDelete: true
}
const readOnly: ModulePermission = {
  canView: true, canCreate: false, canEdit: false, canDelete: false
}
const noAccess: ModulePermission = {
  canView: false, canCreate: false, canEdit: false, canDelete: false
}
const createEdit: ModulePermission = {
  canView: true, canCreate: true, canEdit: true, canDelete: false
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // Propietario — acceso completo
  owner: {
    dashboard: fullAccess,
    crm: fullAccess,
    ventas: fullAccess,
    inventario: fullAccess,
    eventos: fullAccess,
    logistica: fullAccess,
    finanzas: fullAccess,
    reportes: fullAccess,
    usuarios: fullAccess,
    configuracion: fullAccess,
  },
  // Administrador — todo excepto config financiera
  admin: {
    dashboard: noAccess,
    crm: fullAccess,
    ventas: fullAccess,
    inventario: fullAccess,
    eventos: fullAccess,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: createEdit,
    configuracion: noAccess,
  },
  // Gerente — Inventario, Eventos, Reportes
  gerente: {
    dashboard: noAccess,
    crm: noAccess,
    ventas: noAccess,
    inventario: fullAccess,
    eventos: fullAccess,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: readOnly,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  // Staff — POS + Inventario lectura
  staff: {
    dashboard: noAccess,
    crm: noAccess,
    ventas: fullAccess,
    inventario: readOnly,
    eventos: noAccess,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  // Bartender — POS + Inventario lectura
  bartender: {
    dashboard: noAccess,
    crm: noAccess,
    ventas: fullAccess,
    inventario: readOnly,
    eventos: noAccess,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  // Chofer — Logística (rutas, GPS)
  chofer: {
    dashboard: noAccess,
    crm: noAccess,
    ventas: noAccess,
    inventario: noAccess,
    eventos: noAccess,
    logistica: readOnly,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  // Vendedor — POS, Clientes, Cotizaciones
  vendedor: {
    dashboard: noAccess,
    crm: createEdit,
    ventas: fullAccess,
    inventario: noAccess,
    eventos: noAccess,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
}

export const getPermissions = (role: string): RolePermissions => {
  return ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.staff
}

export const canAccess = (role: string, module: keyof RolePermissions): boolean => {
  return getPermissions(role)[module].canView
}
