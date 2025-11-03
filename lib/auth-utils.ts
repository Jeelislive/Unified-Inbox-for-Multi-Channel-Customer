import { auth } from "./auth";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { headers } from "next/headers";

/**
 * Get the current session from Better Auth
 * Server-side only
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Get the current authenticated user with full details from database
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      team: true,
    },
  });

  return user;
}

/**
 * Require authentication - throws if not authenticated
 * Use in server actions and API routes
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return user;
}

/**
 * Check if user has required role
 * @param requiredRole - Minimum role required (ADMIN > EDITOR > VIEWER)
 */
export async function requireRole(requiredRole: Role) {
  const user = await requireAuth();

  const roleHierarchy: Record<Role, number> = {
    ADMIN: 3,
    EDITOR: 2,
    VIEWER: 1,
  };

  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error(`Forbidden: ${requiredRole} role required`);
  }

  return user;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return requireRole(Role.ADMIN);
}

/**
 * Check if user is editor or higher
 */
export async function requireEditor() {
  return requireRole(Role.EDITOR);
}

/**
 * Check if user has permission to access a resource
 * @param resourceTeamId - Team ID of the resource
 */
export async function requireTeamAccess(resourceTeamId: string) {
  const user = await requireAuth();

  if (user.teamId !== resourceTeamId && user.role !== Role.ADMIN) {
    throw new Error("Forbidden: Access denied to this resource");
  }

  return user;
}
