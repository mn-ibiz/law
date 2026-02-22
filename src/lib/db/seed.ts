import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import * as schema from "./schema";
import { courtData } from "./seed-data/courts";
import { courtStationData } from "./seed-data/court-stations";
import { practiceAreaData } from "./seed-data/practice-areas";
import { userData, sampleCases } from "./seed-data/users";

const DEFAULT_PASSWORD = "Password123!";
const SALT_ROUNDS = 10;

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle({ client: sql, schema });

  console.log("Starting seed...\n");

  // 1. Seed Practice Areas
  console.log("Seeding practice areas...");
  for (const pa of practiceAreaData) {
    await db
      .insert(schema.practiceAreas)
      .values(pa)
      .onConflictDoNothing({ target: schema.practiceAreas.name });
  }
  console.log(`  ✓ ${practiceAreaData.length} practice areas seeded`);

  // 2. Seed Courts
  console.log("Seeding courts...");
  const courtIds: Record<string, string> = {};
  for (const court of courtData) {
    const existing = await db
      .select()
      .from(schema.courts)
      .where(eq(schema.courts.name, court.name));
    if (existing.length === 0) {
      const [inserted] = await db.insert(schema.courts).values(court).returning();
      courtIds[court.level] = inserted.id;
    } else {
      courtIds[court.level] = existing[0].id;
    }
  }
  console.log(`  ✓ ${courtData.length} courts seeded`);

  // 3. Seed Court Stations (link to Magistrate Courts by default)
  console.log("Seeding court stations...");
  const magistrateCourtId = courtIds["magistrate"];
  for (const station of courtStationData) {
    const existing = await db
      .select()
      .from(schema.courtStations)
      .where(eq(schema.courtStations.name, station.name));
    if (existing.length === 0) {
      await db.insert(schema.courtStations).values({
        ...station,
        courtId: magistrateCourtId,
      });
    }
  }
  console.log(`  ✓ ${courtStationData.length} court stations seeded`);

  // 4. Seed Branch
  console.log("Seeding branches...");
  const existingBranch = await db
    .select()
    .from(schema.branches)
    .where(eq(schema.branches.name, "Main Office — Nairobi"));
  let branchId: string;
  if (existingBranch.length === 0) {
    const [branch] = await db
      .insert(schema.branches)
      .values({
        name: "Main Office — Nairobi",
        address: "Kimathi Street, Nairobi CBD",
        city: "Nairobi",
        county: "Nairobi",
        phone: "+254200000001",
        email: "info@lawfirm.co.ke",
        isMain: true,
      })
      .returning();
    branchId = branch.id;
  } else {
    branchId = existingBranch[0].id;
  }
  console.log("  ✓ Main branch seeded");

  // 5. Hash password
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // 6. Seed Admin User
  console.log("Seeding admin user...");
  const existingAdmin = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, userData.admin.email));
  let adminId: string;
  if (existingAdmin.length === 0) {
    const [admin] = await db
      .insert(schema.users)
      .values({
        ...userData.admin,
        password: hashedPassword,
        branchId,
      })
      .returning();
    adminId = admin.id;
  } else {
    adminId = existingAdmin[0].id;
  }
  console.log(`  ✓ Admin: ${userData.admin.email}`);

  // 7. Seed Attorneys
  console.log("Seeding attorneys...");
  const attorneyUserIds: string[] = [];
  const attorneyIds: string[] = [];

  for (const attyData of userData.attorneys) {
    // Create user
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, attyData.user.email));
    let userId: string;
    if (existingUser.length === 0) {
      const [user] = await db
        .insert(schema.users)
        .values({
          ...attyData.user,
          password: hashedPassword,
          branchId,
        })
        .returning();
      userId = user.id;
    } else {
      userId = existingUser[0].id;
    }
    attorneyUserIds.push(userId);

    // Create attorney record
    const existingAtty = await db
      .select()
      .from(schema.attorneys)
      .where(eq(schema.attorneys.userId, userId));
    let attorneyId: string;
    if (existingAtty.length === 0) {
      const [attorney] = await db
        .insert(schema.attorneys)
        .values({
          ...attyData.attorney,
          userId,
        })
        .returning();
      attorneyId = attorney.id;
    } else {
      attorneyId = existingAtty[0].id;
    }
    attorneyIds.push(attorneyId);

    // Create practising certificates
    for (const cert of attyData.practisingCertificates) {
      const existingCert = await db
        .select()
        .from(schema.practisingCertificates)
        .where(eq(schema.practisingCertificates.certificateNumber, cert.certificateNumber!));
      if (existingCert.length === 0) {
        await db.insert(schema.practisingCertificates).values({
          ...cert,
          attorneyId,
        });
      }
    }

    // Create CPD records
    for (const cpd of attyData.cpdRecords) {
      const existingCpd = await db
        .select()
        .from(schema.cpdRecords)
        .where(eq(schema.cpdRecords.title, cpd.title));
      if (existingCpd.length === 0) {
        await db.insert(schema.cpdRecords).values({
          ...cpd,
          attorneyId,
        });
      }
    }

    console.log(`  ✓ Attorney: ${attyData.user.email} (${attyData.attorney.title})`);
  }

  // 8. Seed Clients
  console.log("Seeding clients...");
  const clientIds: string[] = [];

  for (const clientData of userData.clients) {
    // Create user
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, clientData.user.email));
    let userId: string;
    if (existingUser.length === 0) {
      const [user] = await db
        .insert(schema.users)
        .values({
          ...clientData.user,
          password: hashedPassword,
          branchId,
        })
        .returning();
      userId = user.id;
    } else {
      userId = existingUser[0].id;
    }

    // Create client record
    const existingClient = await db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.email, clientData.client.email));
    let clientId: string;
    if (existingClient.length === 0) {
      const [client] = await db
        .insert(schema.clients)
        .values({
          ...clientData.client,
          userId,
        })
        .returning();
      clientId = client.id;
    } else {
      clientId = existingClient[0].id;
    }
    clientIds.push(clientId);

    console.log(`  ✓ Client: ${clientData.user.email}`);
  }

  // 9. Seed Cases
  console.log("Seeding cases...");
  for (let i = 0; i < sampleCases.length; i++) {
    const caseData = sampleCases[i];
    const existingCase = await db
      .select()
      .from(schema.cases)
      .where(eq(schema.cases.caseNumber, caseData.caseNumber));
    if (existingCase.length === 0) {
      const clientId = clientIds[i % clientIds.length];
      const [newCase] = await db
        .insert(schema.cases)
        .values({
          ...caseData,
          clientId,
        })
        .returning();

      // Assign an attorney
      const attorneyUserId = attorneyUserIds[i % attorneyUserIds.length];
      await db.insert(schema.caseAssignments).values({
        caseId: newCase.id,
        userId: attorneyUserId,
        role: i === 0 ? "lead" : "assigned",
      });

      console.log(`  ✓ Case: ${caseData.caseNumber} — ${caseData.title.substring(0, 40)}...`);
    }
  }

  // 10. Seed Pipeline Stages
  console.log("Seeding pipeline stages...");
  const stages = [
    { name: "Intake", description: "New case intake and initial review", order: 1, color: "#6366f1" },
    { name: "Investigation", description: "Gathering facts and evidence", order: 2, color: "#f59e0b" },
    { name: "Preparation", description: "Preparing filings and documentation", order: 3, color: "#3b82f6" },
    { name: "Filing", description: "Filed with court", order: 4, color: "#8b5cf6" },
    { name: "Discovery", description: "Discovery phase", order: 5, color: "#ec4899" },
    { name: "Negotiation", description: "Settlement negotiations", order: 6, color: "#14b8a6" },
    { name: "Trial/Hearing", description: "Court proceedings", order: 7, color: "#f97316" },
    { name: "Resolution", description: "Case resolved or settled", order: 8, color: "#22c55e" },
  ];
  for (const stage of stages) {
    const existing = await db
      .select()
      .from(schema.pipelineStages)
      .where(eq(schema.pipelineStages.name, stage.name));
    if (existing.length === 0) {
      await db.insert(schema.pipelineStages).values(stage);
    }
  }
  console.log(`  ✓ ${stages.length} pipeline stages seeded`);

  console.log("\n✅ Seed completed successfully!");
  console.log(`
Summary:
  - ${practiceAreaData.length} practice areas
  - ${courtData.length} courts
  - ${courtStationData.length} court stations (47 counties)
  - 1 main branch (Nairobi)
  - 1 admin user
  - ${userData.attorneys.length} attorneys (with practising certificates & CPD records)
  - ${userData.clients.length} clients
  - ${sampleCases.length} cases (with attorney assignments)
  - ${stages.length} pipeline stages

Default password for all users: ${DEFAULT_PASSWORD}
`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
