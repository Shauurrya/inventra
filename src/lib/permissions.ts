// Role-based permission system for Inventra
// ──────────────────────────────────────────
// Admin:   Full access (all features, manage users, settings)
// Auditor: View + Add (can view everything and add expenses/entries)
// Viewer:  Read-only (can only view data, no modifications)
// Staff:   Same as Auditor (legacy role, treated as auditor)

export type AppRole = "ADMIN" | "AUDITOR" | "VIEWER" | "STAFF";

export type Permission =
    | "dashboard:view"
    | "inventory:view"
    | "raw-materials:view"
    | "raw-materials:create"
    | "raw-materials:edit"
    | "raw-materials:delete"
    | "products:view"
    | "products:create"
    | "products:edit"
    | "products:delete"
    | "production:view"
    | "production:create"
    | "sales:view"
    | "sales:create"
    | "purchases:view"
    | "purchases:create"
    | "reports:view"
    | "analytics:view"
    | "alerts:view"
    | "alerts:manage"
    | "settings:view"
    | "settings:edit"
    | "users:manage"
    | "bom:view"
    | "bom:edit"
    | "stock:adjust";

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
    ADMIN: [
        "dashboard:view", "inventory:view",
        "raw-materials:view", "raw-materials:create", "raw-materials:edit", "raw-materials:delete",
        "products:view", "products:create", "products:edit", "products:delete",
        "production:view", "production:create",
        "sales:view", "sales:create",
        "purchases:view", "purchases:create",
        "reports:view", "analytics:view",
        "alerts:view", "alerts:manage",
        "settings:view", "settings:edit",
        "users:manage",
        "bom:view", "bom:edit",
        "stock:adjust",
    ],
    AUDITOR: [
        "dashboard:view", "inventory:view",
        "raw-materials:view", "raw-materials:create",
        "products:view",
        "production:view", "production:create",
        "sales:view", "sales:create",
        "purchases:view", "purchases:create",
        "reports:view", "analytics:view",
        "alerts:view",
        "bom:view",
    ],
    VIEWER: [
        "dashboard:view", "inventory:view",
        "raw-materials:view",
        "products:view",
        "production:view",
        "sales:view",
        "purchases:view",
        "reports:view", "analytics:view",
        "alerts:view",
        "bom:view",
    ],
    // Legacy role, treat same as AUDITOR
    STAFF: [
        "dashboard:view", "inventory:view",
        "raw-materials:view", "raw-materials:create",
        "products:view",
        "production:view", "production:create",
        "sales:view", "sales:create",
        "purchases:view", "purchases:create",
        "reports:view", "analytics:view",
        "alerts:view",
        "bom:view",
    ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
    if (!role) return false;
    const perms = ROLE_PERMISSIONS[role as AppRole];
    if (!perms) return false;
    return perms.includes(permission);
}

/**
 * Check if the role can access a specific sidebar nav item
 */
export function canAccessRoute(role: string | undefined, href: string): boolean {
    if (!role) return false;
    const routePermMap: Record<string, Permission> = {
        "/dashboard": "dashboard:view",
        "/dashboard/inventory": "inventory:view",
        "/dashboard/raw-materials": "raw-materials:view",
        "/dashboard/products": "products:view",
        "/dashboard/production": "production:view",
        "/dashboard/sales": "sales:view",
        "/dashboard/reports": "reports:view",
        "/dashboard/analytics": "analytics:view",
        "/dashboard/alerts": "alerts:view",
        "/dashboard/settings": "settings:view",
    };

    const permission = routePermMap[href];
    if (!permission) return true; // Unknown routes: allow by default
    return hasPermission(role, permission);
}

/**
 * Get human-readable role label
 */
export function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
        ADMIN: "Admin",
        AUDITOR: "Auditor",
        VIEWER: "Viewer",
        STAFF: "Staff",
    };
    return labels[role] || role;
}

/**
 * Get role badge color class
 */
export function getRoleBadgeColor(role: string): string {
    const colors: Record<string, string> = {
        ADMIN: "bg-purple-500/20 text-purple-400",
        AUDITOR: "bg-blue-500/20 text-blue-400",
        VIEWER: "bg-green-500/20 text-green-400",
        STAFF: "bg-slate-500/20 text-slate-400",
    };
    return colors[role] || "bg-slate-500/20 text-slate-400";
}

/**
 * Check permission from a session object (for API routes).
 * Returns null if allowed, or an error message if denied.
 */
export function checkPermission(session: any, permission: Permission): string | null {
    const role = session?.user?.role;
    if (!role) return "Unauthorized";
    if (!hasPermission(role, permission)) {
        return `Access denied: ${getRoleLabel(role)} role does not have "${permission}" permission`;
    }
    return null;
}
