export type UserRole = "admin" | "editor" | "author";

export const USER_ROLES: { label: string; value: UserRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Author", value: "author" },
];

type MaybeUser = object | null | undefined;

/**
 * Resolves a user's role. Pre-RBAC user rows with no `role` set are treated
 * as `admin` so existing single-user sites don't lose administrative access.
 */
export function getUserRole(user: MaybeUser): UserRole | null {
  if (!user) return null;
  const role = (user as { role?: unknown }).role;
  if (role === "admin" || role === "editor" || role === "author") {
    return role;
  }
  return "admin";
}

export function isAdminUser(user: MaybeUser): boolean {
  return getUserRole(user) === "admin";
}

export function isEditorOrAdmin(user: MaybeUser): boolean {
  const role = getUserRole(user);
  return role === "admin" || role === "editor";
}
