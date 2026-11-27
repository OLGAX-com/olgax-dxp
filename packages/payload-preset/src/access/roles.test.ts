import { describe, expect, it } from "vitest";
import { getUserRole, isAdminUser, isEditorOrAdmin } from "./roles";

describe("RBAC role helpers", () => {
  it("returns null for unauthenticated users", () => {
    expect(getUserRole(null)).toBeNull();
    expect(getUserRole(undefined)).toBeNull();
    expect(isAdminUser(null)).toBe(false);
    expect(isEditorOrAdmin(null)).toBe(false);
  });

  it("treats legacy users without a role field as admin", () => {
    expect(getUserRole({})).toBe("admin");
    expect(isAdminUser({})).toBe(true);
    expect(isEditorOrAdmin({})).toBe(true);
  });

  it("enforces admin, editor, and author boundaries", () => {
    expect(isAdminUser({ role: "admin" })).toBe(true);
    expect(isEditorOrAdmin({ role: "admin" })).toBe(true);

    expect(isAdminUser({ role: "editor" })).toBe(false);
    expect(isEditorOrAdmin({ role: "editor" })).toBe(true);

    expect(isAdminUser({ role: "author" })).toBe(false);
    expect(isEditorOrAdmin({ role: "author" })).toBe(false);
  });
});
