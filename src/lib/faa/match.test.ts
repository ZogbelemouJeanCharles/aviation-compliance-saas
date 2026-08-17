import { describe, expect, it } from "vitest";
import { matchCertification } from "./match";
import type { AirmenReferenceRecord } from "./types";

const registry: AirmenReferenceRecord[] = [
  { certificateNumber: "3456789", firstName: "JOHN", lastName: "SMITH" },
  { certificateNumber: "1112223", firstName: "MARIA", lastName: "GARCIA" },
  // Two different people who happen to share the same last name, to make
  // sure matching doesn't accidentally key off last name alone.
  { certificateNumber: "9998887", firstName: "ALEX", lastName: "CHEN" },
  { certificateNumber: "9998888", firstName: "DAVID", lastName: "CHEN" },
];

describe("matchCertification", () => {
  it("verifies an exact match on certificate number and name", () => {
    const result = matchCertification(
      {
        certificateNumber: "3456789",
        firstName: "John",
        lastName: "Smith",
        issuingAuthority: "FAA",
      },
      registry
    );

    expect(result).toEqual({
      status: "VERIFIED",
      matchedRecord: { certificateNumber: "3456789", firstName: "JOHN", lastName: "SMITH" },
    });
  });

  it("is case-insensitive and tolerates extra whitespace", () => {
    const result = matchCertification(
      {
        certificateNumber: "  3456789 ",
        firstName: "john",
        lastName: "  smith",
        issuingAuthority: "FAA",
      },
      registry
    );

    expect(result.status).toBe("VERIFIED");
  });

  it("returns NOT_FOUND when the certificate number isn't in the registry", () => {
    const result = matchCertification(
      {
        certificateNumber: "0000000",
        firstName: "John",
        lastName: "Smith",
        issuingAuthority: "FAA",
      },
      registry
    );

    expect(result.status).toBe("NOT_FOUND");
  });

  it("requires manual review when the certificate number matches but the name doesn't", () => {
    const result = matchCertification(
      {
        certificateNumber: "3456789",
        firstName: "Jonathan",
        lastName: "Smith",
        issuingAuthority: "FAA",
      },
      registry
    );

    expect(result.status).toBe("MANUAL_REVIEW_REQUIRED");
    if (result.status === "MANUAL_REVIEW_REQUIRED") {
      expect(result.candidates).toHaveLength(1);
    }
  });

  it("does not cross-match two different people who share a certificate-number prefix by coincidence", () => {
    const result = matchCertification(
      {
        certificateNumber: "9998887",
        firstName: "David",
        lastName: "Chen",
        issuingAuthority: "FAA",
      },
      registry
    );

    // Certificate 9998887 belongs to Alex Chen, not David Chen.
    expect(result.status).toBe("MANUAL_REVIEW_REQUIRED");
  });

  it("always routes EASA certifications to manual review — there is no public EASA registry", () => {
    const result = matchCertification(
      {
        certificateNumber: "3456789",
        firstName: "John",
        lastName: "Smith",
        issuingAuthority: "EASA",
      },
      registry
    );

    expect(result.status).toBe("MANUAL_REVIEW_REQUIRED");
    if (result.status === "MANUAL_REVIEW_REQUIRED") {
      expect(result.reason).toMatch(/EASA/);
    }
  });

  it("routes any other issuing authority to manual review too", () => {
    const result = matchCertification(
      {
        certificateNumber: "3456789",
        firstName: "John",
        lastName: "Smith",
        issuingAuthority: "OTHER",
      },
      registry
    );

    expect(result.status).toBe("MANUAL_REVIEW_REQUIRED");
  });
});
