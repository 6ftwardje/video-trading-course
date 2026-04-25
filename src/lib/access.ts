export const FULL_ACCESS_LEVEL = 2
export const FREE_MODULE_ORDER_LIMIT = 6

export function hasFullAccess(accessLevel: number | null | undefined) {
  return (accessLevel ?? 1) >= FULL_ACCESS_LEVEL
}

export function isFreeModuleOrder(moduleOrder: number | null | undefined) {
  return typeof moduleOrder === 'number' && moduleOrder <= FREE_MODULE_ORDER_LIMIT
}

export function canAccessModuleByOrder(
  accessLevel: number | null | undefined,
  moduleOrder: number | null | undefined,
) {
  return hasFullAccess(accessLevel) || isFreeModuleOrder(moduleOrder)
}

export function getModuleAccessLabel(moduleOrder: number | null | undefined) {
  return isFreeModuleOrder(moduleOrder) ? 'Gratis' : 'Full toegang'
}
