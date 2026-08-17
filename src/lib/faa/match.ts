import type { AirmenReferenceRecord, CertificationToVerify, MatchResult } from "./types";

function normalize(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

/**
 * Matches a candidate-declared certification against the locally ingested
 * snapshot of the FAA Airmen Certification Releasable File (see ./ingest.ts).
 *
 * This is a pure function — it takes the candidate rows to compare against
 * rather than querying the database itself, so the matching rules can be
 * unit tested without a live DB (see match.test.ts).
 *
 * The FAA has no public real-time API, so `registry` is always a snapshot as
 * of the last ingestion run, not a live lookup — the caller is responsible
 * for surfacing how stale that snapshot is.
 */
export function matchCertification(
  certification: CertificationToVerify,
  registry: AirmenReferenceRecord[]
): MatchResult {
  if (certification.issuingAuthority !== "FAA") {
    // EASA (and any other authority) has no public registry we can check
    // automatically — always route to a human reviewer.
    return {
      status: "MANUAL_REVIEW_REQUIRED",
      reason: `No automated registry available for issuing authority "${certification.issuingAuthority}".`,
    };
  }

  const normalizedCertNumber = normalize(certification.certificateNumber);
  const byCertNumber = registry.filter(
    (record) => normalize(record.certificateNumber) === normalizedCertNumber
  );

  if (byCertNumber.length === 0) {
    return {
      status: "NOT_FOUND",
      reason: "No FAA airman record matches this certificate number.",
    };
  }

  const nameMatches = byCertNumber.filter(
    (record) =>
      normalize(record.firstName) === normalize(certification.firstName) &&
      normalize(record.lastName) === normalize(certification.lastName)
  );

  if (nameMatches.length === 1) {
    return { status: "VERIFIED", matchedRecord: nameMatches[0] };
  }

  if (nameMatches.length === 0) {
    return {
      status: "MANUAL_REVIEW_REQUIRED",
      reason:
        "The certificate number was found, but the name on file does not match exactly — could be a maiden name, a typo, or a stale FAA snapshot.",
      candidates: byCertNumber,
    };
  }

  // More than one exact name match on the same certificate number should be
  // essentially impossible (certificate numbers are unique), but if the
  // ingested snapshot ever contains a duplicate, don't silently pick one.
  return {
    status: "MANUAL_REVIEW_REQUIRED",
    reason: "Multiple FAA airman records match this certificate number and name.",
    candidates: nameMatches,
  };
}
