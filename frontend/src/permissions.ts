export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'comercial' 
  | 'administrativo' 
  | 'operador' 
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
  admin: {
    dashboard: fullAccess,
    crm: fullAccess,
    ventas: fullAccess,
    inventario: fullAccess,
    eventos: fullAccess,
    logistica: fullAccess,
    finanzas: readOnly,
    reportes: fullAccess,
    usuarios: createEdit,
    configuracion: readOnly,
  },
  comercial: {
    dashboard: readOnly,
    crm: fullAccess,
    ventas: createEdit,
    inventario: readOnly,
    eventos: fullAccess,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: readOnly,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  administrativo: {
    dashboard: readOnly,
    crm: readOnly,
    ventas: readOnly,
    inventario: readOnly,
    eventos: readOnly,
    logistica: noAccess,
    finanzas: fullAccess,
    reportes: fullAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  operador: {
    dashboard: readOnly,
    crm: noAccess,
    ventas: fullAccess,
    inventario: createEdit,
    eventos: readOnly,
    logistica: readOnly,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
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
  chofer: {
    dashboard: readOnly,
    crm: noAccess,
    ventas: readOnly,
    inventario: readOnly,
    eventos: readOnly,
    logistica: readOnly,
    finanzas: noAccess,
    reportes: noAccess,
    usuarios: noAccess,
    configuracion: noAccess,
  },
  vendedor: {
    dashboard: readOnly,
    crm: createEdit,
    ventas: fullAccess,
    inventario: readOnly,
    eventos: readOnly,
    logistica: noAccess,
    finanzas: noAccess,
    reportes: readOnly,
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