# Story 1.3: Seed Data — Kenya Courts, Practice Areas & Sample Data

Status: ready-for-dev

## Story

As a developer,
I want seed data for Kenya reference tables and sample data,
so that the app is immediately usable for dev/demo.

## Acceptance Criteria (ACs)

1. Kenya court hierarchy seeded: Supreme Court, Court of Appeal, High Court, Environment & Land Court (ELC), Employment & Labour Relations Court (ELRC), Magistrate Courts, Kadhi's Courts, Tribunals
2. Court stations seeded for all 47 Kenya counties (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, etc.)
3. 15 practice areas seeded (e.g., Civil Litigation, Criminal Law, Family Law, Corporate/Commercial, Conveyancing/Property, Employment/Labour, Environment/Land, Intellectual Property, Tax Law, Banking/Finance, Insurance, Constitutional Law, Alternative Dispute Resolution, Immigration, Probate/Succession)
4. Sample users created: 1 Admin, 3 Attorneys, 2 Clients — all with bcrypt-hashed passwords
5. Sample cases created and linked to sample attorneys and clients
6. Sample attorneys created with LSK numbers, practising certificates, and CPD records
7. All passwords hashed with bcryptjs (minimum 10 salt rounds)
8. Seed script is idempotent (safe to run multiple times without duplicating data)
9. Seed script is executable via `npm run seed` command

## Tasks / Subtasks

- [ ] Create `src/lib/db/seed.ts` as the main seed script entry point (AC8, AC9)
- [ ] Create `src/lib/db/seed-data/courts.ts` — Define Kenya court hierarchy data: court types (Supreme, Appeal, High, ELC, ELRC, Magistrate, Kadhi's, Tribunals) with descriptions and hierarchy levels (AC1)
- [ ] Create `src/lib/db/seed-data/court-stations.ts` — Define court stations for all 47 counties: Nairobi (Milimani, Kibera, Makadara), Mombasa (Mombasa Law Courts), Kisumu, Nakuru, Eldoret (Uasin Gishu), Nyeri, Meru, Machakos, Kitale, Kakamega, Bungoma, Kisii, Garissa, Nanyuki, Thika, Kiambu, Malindi, etc. (AC2)
- [ ] Create `src/lib/db/seed-data/practice-areas.ts` — Define 15 practice areas: Civil Litigation, Criminal Law, Family Law, Corporate/Commercial, Conveyancing/Property, Employment/Labour, Environment/Land, Intellectual Property, Tax Law, Banking/Finance, Insurance Law, Constitutional Law, Alternative Dispute Resolution, Immigration Law, Probate/Succession (AC3)
- [ ] Create `src/lib/db/seed-data/users.ts` — Define sample users with roles: Admin (admin@lawfirm.co.ke), 3 Attorneys (attorney1@lawfirm.co.ke, attorney2@lawfirm.co.ke, attorney3@lawfirm.co.ke), 2 Clients (client1@example.com, client2@example.com) with bcrypt-hashed passwords (AC4, AC7)
- [ ] Create sample attorney records linked to attorney users with LSK numbers (e.g., LSK/2015/12345), bar numbers, jurisdictions ("Kenya"), titles (Partner, Senior Associate, Associate), departments, hourly rates in KES, dates admitted (AC6)
- [ ] Create sample practising certificates for each attorney: certificate number, year (2025, 2026), issue dates, expiry dates (Dec 31), status (Valid/Expired) (AC6)
- [ ] Create sample CPD records for attorneys: event names (e.g., "LSK Annual Conference 2025", "AML/CFT Compliance Workshop"), providers, units earned, dates (AC6)
- [ ] Create sample client records linked to client users: individual clients with Kenya-specific fields (county, phone +254 format, KRA PINs) (AC4)
- [ ] Create sample cases linked to attorneys and clients: at least 3-5 cases with varied statuses (Open, In Progress, Hearing, Resolved), case numbers (2026-0001 format), practice areas, courts, billing types (AC5)
- [ ] Create a sample branch record (Main Office — Nairobi) (AC4)
- [ ] Implement idempotency: check for existing records before inserting, use upsert or conditional insert patterns (AC8)
- [ ] Add `"seed": "npx tsx src/lib/db/seed.ts"` script to `package.json` (AC9)
- [ ] Test seed script runs successfully against Neon database (AC9)
- [ ] Verify seed script is idempotent by running it twice without errors or duplicate data (AC8)

## Dev Notes

### Architecture & Constraints
- The seed script runs outside Next.js context — use `tsx` to execute TypeScript directly
- Import the Drizzle database instance from `src/lib/db/index.ts`
- Use bcryptjs with 10 salt rounds for password hashing
- All monetary values (hourly rates, case values) in KES
- Phone numbers in +254 format (Kenya)
- Default password for all sample users: `Password123!` (meets min 8 chars, uppercase + lowercase + number requirement)
- The seed script should log progress to console (e.g., "Seeding courts... done", "Seeding users... done")

### Idempotency Pattern
```typescript
// Check before insert pattern
const existingUser = await db.select().from(users).where(eq(users.email, 'admin@lawfirm.co.ke'));
if (existingUser.length === 0) {
  await db.insert(users).values({ ... });
}

// Or use onConflictDoNothing
await db.insert(users).values({ ... }).onConflictDoNothing({ target: users.email });
```

### Sample Data Details
- **Admin:** John Kamau, admin@lawfirm.co.ke, role: admin
- **Attorney 1:** Jane Wanjiku, attorney1@lawfirm.co.ke, Partner, LSK/2010/54321, Litigation
- **Attorney 2:** Peter Ochieng, attorney2@lawfirm.co.ke, Senior Associate, LSK/2015/12345, Corporate
- **Attorney 3:** Mary Akinyi, attorney3@lawfirm.co.ke, Associate, LSK/2020/67890, Family Law
- **Client 1:** David Mwangi, client1@example.com, Individual, Nairobi County
- **Client 2:** Sarah Njeri, client2@example.com, Individual, Mombasa County

### Kenya Court Stations (47 Counties)
Nairobi, Mombasa, Kisumu, Nakuru, Uasin Gishu (Eldoret), Kiambu, Machakos, Kajiado, Nyeri, Meru, Embu, Tharaka-Nithi, Isiolo, Marsabit, Garissa, Wajir, Mandera, Turkana, West Pokot, Samburu, Trans-Nzoia (Kitale), Baringo, Laikipia (Nanyuki), Nandi, Kericho, Bomet, Kakamega, Vihiga, Bungoma, Busia, Siaya, Kisii, Nyamira, Migori, Homa Bay, Kilifi (Malindi), Kwale, Taita-Taveta (Voi), Lamu, Tana River, Muranga, Kirinyaga, Nyandarua, Narok, Elgeyo-Marakwet, Makueni, Kitui

### Project Structure Notes

Files to create:
- `src/lib/db/seed.ts` — Main seed script entry point
- `src/lib/db/seed-data/courts.ts` — Court types and hierarchy data
- `src/lib/db/seed-data/court-stations.ts` — Court stations per county
- `src/lib/db/seed-data/practice-areas.ts` — Practice area definitions
- `src/lib/db/seed-data/users.ts` — Sample user, attorney, client data

Files to modify:
- `package.json` — Add `"seed"` script

### References

- [Source: a.md — Module 16: Kenya Court & E-Filing Integration]
- [Source: a.md — Kenya Court System Hierarchy]
- [Source: a.md — Module 15: Kenya Compliance & Practising Certificate Management]
- [Source: epics.md — Epic 1, Story 1.3]
- [Source: a.md — Implementation Phases, Phase 1, step 6]
