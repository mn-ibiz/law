import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import {
  practiceAreas,
  billingRates,
  firmSettings,
  customFields,
  tags,
  emailTemplates,
  smsTemplates,
  auditLog,
} from "@/lib/db/schema/settings";
import { branches, branchUsers } from "@/lib/db/schema/branches";
import { eq, desc, inArray } from "drizzle-orm";

// Dynamic imports to avoid circular deps - read schema directly
export async function getUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500);
}

export async function getUserById(id: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      avatar: users.avatar,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getPracticeAreas() {
  return db.select().from(practiceAreas).orderBy(practiceAreas.name);
}

export async function getBillingRates() {
  return db.select().from(billingRates).orderBy(billingRates.name);
}

export async function getFirmSettings() {
  return db.select().from(firmSettings).orderBy(firmSettings.key);
}

export async function getBranches() {
  return db.select().from(branches).orderBy(desc(branches.isMain), branches.name);
}

export async function getBranchWithUsers(branchId: string) {
  const branch = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
  if (!branch[0]) return null;

  const assignedUsers = await db
    .select({
      id: branchUsers.id,
      userId: branchUsers.userId,
      isPrimary: branchUsers.isPrimary,
      userName: users.name,
      userEmail: users.email,
    })
    .from(branchUsers)
    .leftJoin(users, eq(branchUsers.userId, users.id))
    .where(eq(branchUsers.branchId, branchId));

  return { ...branch[0], users: assignedUsers };
}

export async function getCustomFields(entityType?: string) {
  if (entityType) {
    return db
      .select()
      .from(customFields)
      .where(eq(customFields.entityType, entityType))
      .orderBy(customFields.order);
  }
  return db.select().from(customFields).orderBy(customFields.entityType, customFields.order);
}

export async function getTags(entityType?: string) {
  if (entityType) {
    return db
      .select()
      .from(tags)
      .where(eq(tags.entityType, entityType))
      .orderBy(tags.name);
  }
  return db.select().from(tags).orderBy(tags.name);
}

export async function getEmailTemplates() {
  return db.select().from(emailTemplates).orderBy(emailTemplates.name);
}

export async function getSmsTemplates() {
  return db.select().from(smsTemplates).orderBy(smsTemplates.name);
}

export async function getAuditLogs(limit = 100) {
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
      userId: auditLog.userId,
    })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

export async function getFirmBranding() {
  const brandingKeys = [
    // Identity
    "firm_logo_url",
    "firm_name",
    "firm_tagline",
    "firm_email",
    "firm_phone",
    "firm_website",
    // Address fields (may be stored separately)
    "firm_address",
    "firm_po_box",
    "firm_city",
    "firm_county",
    // Colors
    "firm_primary_color",
    "firm_accent_color",
    "firm_sidebar_color",
    "firm_sidebar_text_color",
    "firm_email_header_color",
    // Typography & documents
    "firm_font_family",
    "firm_invoice_footer",
  ];
  const settings = await db
    .select({ key: firmSettings.key, value: firmSettings.value })
    .from(firmSettings)
    .where(inArray(firmSettings.key, brandingKeys));
  const map: Record<string, string> = {};
  for (const s of settings) {
    if (s.value) map[s.key] = s.value;
  }

  // Build a composite address from individual fields if firm_address is empty
  let address = map.firm_address || null;
  if (!address) {
    const parts = [map.firm_po_box, map.firm_city, map.firm_county].filter(Boolean);
    address = parts.length > 0 ? parts.join("\n") : null;
  }

  return {
    logoUrl: map.firm_logo_url || null,
    firmName: map.firm_name || null,
    tagline: map.firm_tagline || null,
    email: map.firm_email || null,
    phone: map.firm_phone || null,
    website: map.firm_website || null,
    primaryColor: map.firm_primary_color || null,
    accentColor: map.firm_accent_color || null,
    sidebarColor: map.firm_sidebar_color || null,
    sidebarTextColor: map.firm_sidebar_text_color || null,
    fontFamily: map.firm_font_family || null,
    invoiceFooter: map.firm_invoice_footer || null,
    address,
    emailHeaderColor: map.firm_email_header_color || null,
  };
}

export async function getRecentDataOperations(limit = 50) {
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(inArray(auditLog.action, ["create", "update", "delete"]))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}
