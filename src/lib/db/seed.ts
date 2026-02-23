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

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || "Password123!";
const SALT_ROUNDS = 10;

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("ERROR: Seed script cannot run in production.");
    process.exit(1);
  }

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

  // 10. Seed Pipeline Stages (default / universal)
  console.log("Seeding pipeline stages...");
  const stages = [
    { name: "Intake", description: "New case intake and initial review", order: 1, color: "#6366f1", maxDurationDays: 7 },
    { name: "Investigation", description: "Gathering facts and evidence", order: 2, color: "#f59e0b", maxDurationDays: 30 },
    { name: "Preparation", description: "Preparing filings and documentation", order: 3, color: "#3b82f6", maxDurationDays: 21 },
    { name: "Filing", description: "Filed with court", order: 4, color: "#8b5cf6", maxDurationDays: 14 },
    { name: "Discovery", description: "Discovery phase", order: 5, color: "#ec4899", maxDurationDays: 60 },
    { name: "Negotiation", description: "Settlement negotiations", order: 6, color: "#14b8a6", maxDurationDays: 30 },
    { name: "Trial/Hearing", description: "Court proceedings", order: 7, color: "#f97316", maxDurationDays: 45 },
    { name: "Resolution", description: "Case resolved or settled", order: 8, color: "#22c55e" },
  ];
  const stageIds: Record<string, string> = {};
  for (const stage of stages) {
    const existing = await db
      .select()
      .from(schema.pipelineStages)
      .where(eq(schema.pipelineStages.name, stage.name));
    if (existing.length === 0) {
      const [inserted] = await db.insert(schema.pipelineStages).values(stage).returning();
      stageIds[stage.name] = inserted.id;
    } else {
      stageIds[stage.name] = existing[0].id;
      // Update existing stages with maxDurationDays if missing
      if ("maxDurationDays" in stage && stage.maxDurationDays) {
        await db
          .update(schema.pipelineStages)
          .set({ maxDurationDays: stage.maxDurationDays })
          .where(eq(schema.pipelineStages.id, existing[0].id));
      }
    }
  }
  console.log(`  ✓ ${stages.length} default pipeline stages seeded`);

  // 10b. Seed practice-area-specific pipeline stages
  console.log("Seeding practice-area pipeline stages...");
  const allPracticeAreas = await db.select().from(schema.practiceAreas);
  const paMap: Record<string, string> = {};
  for (const pa of allPracticeAreas) {
    paMap[pa.name] = pa.id;
  }

  const paStages: { practiceArea: string; stages: { name: string; description: string; order: number; color: string; maxDurationDays?: number }[] }[] = [
    {
      practiceArea: "Conveyancing",
      stages: [
        { name: "Instruction", description: "Client instruction received", order: 1, color: "#6366f1", maxDurationDays: 5 },
        { name: "Due Diligence", description: "Property search and verification", order: 2, color: "#f59e0b", maxDurationDays: 14 },
        { name: "Draft Agreement", description: "Drafting sale agreement", order: 3, color: "#3b82f6", maxDurationDays: 10 },
        { name: "Execution", description: "Agreement signing and stamping", order: 4, color: "#8b5cf6", maxDurationDays: 7 },
        { name: "Registration", description: "Title transfer at lands office", order: 5, color: "#ec4899", maxDurationDays: 30 },
        { name: "Completion", description: "Handover of title and keys", order: 6, color: "#22c55e" },
      ],
    },
    {
      practiceArea: "Litigation",
      stages: [
        { name: "Case Assessment", description: "Initial case evaluation", order: 1, color: "#6366f1", maxDurationDays: 7 },
        { name: "Pleadings", description: "Drafting and filing pleadings", order: 2, color: "#f59e0b", maxDurationDays: 14 },
        { name: "Discovery", description: "Document discovery and interrogatories", order: 3, color: "#3b82f6", maxDurationDays: 45 },
        { name: "Pre-Trial", description: "Pre-trial conferences and motions", order: 4, color: "#8b5cf6", maxDurationDays: 21 },
        { name: "Trial", description: "Court trial proceedings", order: 5, color: "#f97316", maxDurationDays: 60 },
        { name: "Judgment", description: "Awaiting and receiving judgment", order: 6, color: "#22c55e" },
      ],
    },
    {
      practiceArea: "Corporate & Commercial",
      stages: [
        { name: "Engagement", description: "Client engagement and scope", order: 1, color: "#6366f1", maxDurationDays: 5 },
        { name: "Research", description: "Legal research and analysis", order: 2, color: "#f59e0b", maxDurationDays: 14 },
        { name: "Drafting", description: "Document drafting", order: 3, color: "#3b82f6", maxDurationDays: 14 },
        { name: "Review", description: "Client review and negotiation", order: 4, color: "#8b5cf6", maxDurationDays: 21 },
        { name: "Execution", description: "Document execution", order: 5, color: "#ec4899", maxDurationDays: 7 },
        { name: "Closing", description: "Transaction closing", order: 6, color: "#22c55e" },
      ],
    },
  ];

  let paStageCount = 0;
  for (const paConfig of paStages) {
    const practiceAreaId = paMap[paConfig.practiceArea];
    if (!practiceAreaId) continue;
    for (const stage of paConfig.stages) {
      const existing = await db
        .select()
        .from(schema.pipelineStages)
        .where(eq(schema.pipelineStages.name, `${paConfig.practiceArea}: ${stage.name}`));
      if (existing.length === 0) {
        await db.insert(schema.pipelineStages).values({
          ...stage,
          name: `${paConfig.practiceArea}: ${stage.name}`,
          practiceAreaId,
        });
        paStageCount++;
      }
    }
  }
  console.log(`  ✓ ${paStageCount} practice-area pipeline stages seeded`);

  // 10c. Seed sample stage automations
  console.log("Seeding stage automations...");
  const trialStageId = stageIds["Trial/Hearing"];
  const resolutionStageId = stageIds["Resolution"];
  if (trialStageId) {
    const existing = await db
      .select()
      .from(schema.stageAutomations)
      .where(eq(schema.stageAutomations.stageId, trialStageId));
    if (existing.length === 0) {
      await db.insert(schema.stageAutomations).values({
        stageId: trialStageId,
        triggerOn: "enter",
        actionType: "send_notification",
        actionConfig: JSON.stringify({
          title: "Case entering Trial/Hearing",
          message: "A case assigned to you has entered the Trial/Hearing stage.",
        }),
        isActive: true,
      });
    }
  }
  if (resolutionStageId) {
    const existing = await db
      .select()
      .from(schema.stageAutomations)
      .where(eq(schema.stageAutomations.stageId, resolutionStageId));
    if (existing.length === 0) {
      await db.insert(schema.stageAutomations).values({
        stageId: resolutionStageId,
        triggerOn: "enter",
        actionType: "update_status",
        actionConfig: JSON.stringify({ status: "resolved" }),
        isActive: true,
      });
    }
  }
  console.log("  ✓ Sample stage automations seeded");

  // 10d. Backfill stageEnteredAt and caseStageHistory for existing pipeline-assigned cases
  console.log("Backfilling stage_entered_at for existing cases...");
  await db.execute(
    `UPDATE cases SET stage_entered_at = updated_at WHERE pipeline_stage_id IS NOT NULL AND stage_entered_at IS NULL`
  );
  // Insert initial caseStageHistory records for existing cases that have no history yet
  await db.execute(
    `INSERT INTO case_stage_history (id, case_id, stage_id, entered_at)
     SELECT gen_random_uuid(), c.id, c.pipeline_stage_id, COALESCE(c.stage_entered_at, c.updated_at)
     FROM cases c
     LEFT JOIN case_stage_history csh ON csh.case_id = c.id AND csh.stage_id = c.pipeline_stage_id
     WHERE c.pipeline_stage_id IS NOT NULL AND csh.id IS NULL`
  );
  console.log("  ✓ Backfill completed");

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
  - ${stages.length} default pipeline stages + practice-area-specific stages
  - Stage automations + backfilled stage history

Default password for all users: ${DEFAULT_PASSWORD}
`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
