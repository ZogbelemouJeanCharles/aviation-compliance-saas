// This module deliberately does NOT import the shared Prisma singleton from
// "@/lib/db/client" (which is marked `import "server-only"`). It's invoked
// by the standalone CLI script (scripts/ingest-faa.ts), which runs under
// plain Node/tsx rather than inside the Next.js server bundle — the
// "server-only" guard throws unconditionally outside that bundle. Creating
// its own short-lived PrismaClient keeps this module usable from both the
// CLI script and, later, an in-app admin route if we add one.
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "./csv";

const prisma = new PrismaClient();

export type FaaCsvColumnMapping = {
  certificateNumber: string;
  firstName: string;
  lastName: string;
  certificationType: string;
};

/**
 * The FAA "Airmen Certification Releasable File" download has its own set of
 * column headers that we haven't hard-coded here — inspect the CSV you
 * download from https://www.faa.gov/licenses_certificates/airmen_certification/releasable_airmen_download
 * and pass the matching header names in `mapping`. This keeps the ingestion
 * logic decoupled from a specific header layout that may vary between the
 * FAA's file variants (pilot, mechanic, etc.) or change over time.
 */
export async function ingestFaaAirmenCsv(csvContent: string, mapping: FaaCsvColumnMapping) {
  const rows = parseCsv(csvContent);

  const records = rows
    .map((row) => ({
      certificateNumber: row[mapping.certificateNumber]?.trim(),
      firstName: row[mapping.firstName]?.trim(),
      lastName: row[mapping.lastName]?.trim(),
      certificationType: row[mapping.certificationType]?.trim() ?? "",
    }))
    .filter((record) => record.certificateNumber && record.firstName && record.lastName) as {
    certificateNumber: string;
    firstName: string;
    lastName: string;
    certificationType: string;
  }[];

  // Full-refresh strategy: the FAA publishes a new snapshot periodically
  // rather than incremental updates, so each ingestion run replaces the
  // local reference table wholesale instead of trying to diff it.
  await prisma.$transaction([
    prisma.faaAirmenRecord.deleteMany({}),
    prisma.faaAirmenRecord.createMany({ data: records }),
  ]);

  return { rowsParsed: rows.length, recordsIngested: records.length };
}
