// Mirrors User::isAdmin() in the backend — every staff role that should
// reach the admin panel at all. What each role can actually *do* once
// inside is decided by the backend's per-permission gates.
export const ADMIN_PANEL_ROLES = ["admin", "super_admin", "manager", "staff", "stagiaire"] as const;

export function canAccessAdminPanel(role: string): boolean {
  return (ADMIN_PANEL_ROLES as readonly string[]).includes(role);
}
