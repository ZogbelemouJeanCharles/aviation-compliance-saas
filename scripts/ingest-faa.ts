// Ingests the FAA Airmen Certification Releasable File into FaaAirmenRecord.
//
// Usage:
//   npx tsx scripts/ingest-faa.ts <path-to-unzipped-faa-folder>
//
// Download the CSV database from:
//   https://www.faa.gov/licenses_certificates/airmen_certification/releasable_airmen_download
// ("Database in Comma Separated Format (csv)"), unzip it, and pass the folder
// containing PILOT_BASIC.csv / NONPILOT_BASIC.csv.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { clearFaaAirmenRecords, ingestFaaBasicFile } from "@/lib/faa/ingest";

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error("Usage: npx tsx scripts/ingest-faa.ts <path-to-unzipped-faa-folder>");
    process.exit(1);
  }

  const pilotPath = join(folder, "PILOT_BASIC.csv");
  const nonPilotPath = join(folder, "NONPILOT_BASIC.csv");

  if (!existsSync(pilotPath) && !existsSync(nonPilotPath)) {
    console.error(`Neither PILOT_BASIC.csv nor NONPILOT_BASIC.csv found in ${folder}`);
    process.exit(1);
  }

  console.log("Clearing existing FAA snapshot...");
  await clearFaaAirmenRecords();

  let totalIngested = 0;

  if (existsSync(pilotPath)) {
    console.log("Ingesting PILOT_BASIC.csv...");
    const result = await ingestFaaBasicFile(readFileSync(pilotPath, "utf-8"), "PILOT");
    console.log(`  ${result.recordsIngested} / ${result.rowsParsed} rows ingested`);
    totalIngested += result.recordsIngested;
  }

  if (existsSync(nonPilotPath)) {
    console.log("Ingesting NONPILOT_BASIC.csv...");
    const result = await ingestFaaBasicFile(readFileSync(nonPilotPath, "utf-8"), "NON_PILOT");
    console.log(`  ${result.recordsIngested} / ${result.rowsParsed} rows ingested`);
    totalIngested += result.recordsIngested;
  }

  console.log(`Done — ${totalIngested} FAA airmen name records ingested.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
