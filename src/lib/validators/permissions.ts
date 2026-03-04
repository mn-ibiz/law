import { z } from "zod";

const resourceEnum = z.enum([
  "attorneys",
  "clients",
  "cases",
  "documents",
  "calendar",
  "time-tracking",
  "expenses",
  "billing",
  "trust-accounts",
  "messages",
  "reports",
  "settings",
  "audit-log",
  "users",
]);

const actionEnum = z.enum(["create", "read", "update", "delete", "export"]);

export const updateRolePermissionsSchema = z.object({
  role: z.enum(["attorney", "client"]), // admin is immutable
  permissions: z.array(
    z.object({
      resource: resourceEnum,
      actions: z.array(actionEnum).min(1),
    })
  ),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
