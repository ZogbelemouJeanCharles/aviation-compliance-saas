export type AirmenReferenceRecord = {
  certificateNumber: string;
  firstName: string;
  lastName: string;
};

export type CertificationToVerify = {
  certificateNumber: string;
  firstName: string;
  lastName: string;
  issuingAuthority: "FAA" | "EASA" | "OTHER";
};

export type MatchResult =
  | { status: "VERIFIED"; matchedRecord: AirmenReferenceRecord }
  | { status: "NOT_FOUND"; reason: string }
  | {
      status: "MANUAL_REVIEW_REQUIRED";
      reason: string;
      candidates?: AirmenReferenceRecord[];
    };
