export type Role = "user" | "admin";

export function isValidRole(value: string): value is Role {
  return value === "user" || value === "admin";
}
