// Manual ingestion trigger for the FAA Airmen Certification Releasable File.
//
// Usage:
//   npx tsx scripts/ingest-faa.ts path/to/file.csv CERT_NUMBER_COLUMN FIRST_NAME_COLUMN LAST_NAME_COLUMN CERT_TYPE_COLUMN
//
// The column names are whatever headers the downloaded FAA CSV actually
// uses — inspect the file first. See src/lib/faa/ingest.ts for why the
// mapping isn't hard-coded.
import { readFileSync } from "node:fs";
import { ingestFaaAirmenCsv } from "@/lib/faa/ingest";

async function main() {
  const [filePath, certificateNumber, firstName, lastName, certificationType] = process.argv.slice(2);

  if (!filePath || !certificateNumber || !firstName || !lastName || !certificationType) {
    console.error(
      "Usage: npx tsx scripts/ingest-faa.ts <file.csv> <certNumberColumn> <firstNameColumn> <lastNameColumn> <certTypeColumn>"
    );
    process.exit(1);
  }

  const csvContent = readFileSync(filePath, "utf-8");
  const result = await ingestFaaAirmenCsv(csvContent, {
    certificateNumber,
    firstName,
    lastName,
    certificationType,
  });

  console.log(`Parsed ${result.rowsParsed} rows, ingested ${result.recordsIngested} FAA airmen records.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
