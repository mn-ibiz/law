import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "super_admin" | "admin" | "attorney" | "client";
      email: string;
      name: string;
      image?: string | null;
      organizationId: string;
      organizationSlug: string;
      /** Set when a super_admin is impersonating an org */
      impersonating?: {
        superAdminId: string;
        superAdminName: string;
        targetOrgName: string;
      } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "super_admin" | "admin" | "attorney" | "client";
    image?: string | null;
    organizationId: string;
    organizationSlug: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "super_admin" | "admin" | "attorney" | "client";
    email: string;
    name: string;
    image?: string | null;
    organizationId: string;
    organizationSlug: string;
  }
}
