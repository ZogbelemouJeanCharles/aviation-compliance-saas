// This module deliberately does NOT import the shared Prisma singleton from
// "@/lib/db/client" (which is marked `import "server-only"`). It's invoked
// by the standalone CLI script (scripts/ingest-faa.ts), which runs under
// plain Node/tsx rather than inside the Next.js server bundle — the
// "server-only" guard throws unconditionally outside that bundle.
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "./csv";

const prisma = new PrismaClient();

const CHUNK_SIZE = 5000;

export type FaaBasicFileSource = "PILOT" | "NON_PILOT";

/**
 * Parses one of the FAA's "*_BASIC.csv" files (PILOT_BASIC.csv or
 * NONPILOT_BASIC.csv from the Airmen Certification Releasable File download)
 * and inserts name records in chunks.
 *
 * These files use "UNIQUE ID, FIRST NAME, LAST NAME, ..." headers — confirmed
 * against a real download on 2026-08-19, see faa.gov's HelpComm.pdf. There is
 * no certificate number column: the FAA's own download page states plainly
 * that "this information does not include airmen certificate number data."
 * That's why FaaAirmenRecord only stores names — see
 * src/lib/faa/check-name-in-registry.ts for how this is used (a plausibility
 * hint, never a verification).
 */
export async function ingestFaaBasicFile(csvContent: string, source: FaaBasicFileSource) {
  const rows = parseCsv(csvContent);

  const records = rows
    .map((row) => ({
      firstName: row["FIRST NAME"]?.trim(),
      lastName: row["LAST NAME"]?.trim(),
      certificationType: source,
    }))
    .filter((record) => record.firstName && record.lastName) as {
    firstName: string;
    lastName: string;
    certificationType: string;
  }[];

  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    await prisma.faaAirmenRecord.createMany({ data: records.slice(i, i + CHUNK_SIZE) });
  }

  return { rowsParsed: rows.length, recordsIngested: records.length };
}

// Full-refresh strategy: the FAA publishes a new snapshot monthly rather than
// incremental updates, so each ingestion run replaces the local reference
// table wholesale instead of trying to diff it.
export async function clearFaaAirmenRecords() {
  await prisma.faaAirmenRecord.deleteMany({});
}
