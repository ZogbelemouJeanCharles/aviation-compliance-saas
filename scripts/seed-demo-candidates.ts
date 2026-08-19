// Adds a set of realistic-but-fictional demo candidates to the seeded demo
// company, covering the different states a recruiter would see: pending,
// verified, rejected, manual review (EASA), and a clearance expiring soon
// (to show the expiration alert email in action).
//
// Usage: npx tsx scripts/seed-demo-candidates.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const company = await prisma.company.findUnique({ where: { id: "demo-company" } });
  if (!company) {
    throw new Error('Demo company not found — run "npx prisma db seed" first.');
  }

  const candidates = [
    {
      firstName: "James",
      lastName: "Whitfield",
      email: "james.whitfield@example.com",
      workAuthorizationStatus: "US_CITIZEN" as const,
      certifications: [
        {
          type: "PILOT_LICENSE" as const,
          certificateNumber: "4471203",
          issuingAuthority: "FAA" as const,
          ratingsOrTypes: "ATP, B737",
          issueDate: daysFromNow(-800),
          expirationDate: daysFromNow(400),
          verificationStatus: "PENDING" as const,
        },
      ],
      clearances: [],
    },
    {
      firstName: "Maria",
      lastName: "Alonso",
      email: "maria.alonso@example.com",
      workAuthorizationStatus: "PERMANENT_RESIDENT" as const,
      certifications: [
        {
          type: "AP_MECHANIC" as const,
          certificateNumber: "3305567",
          issuingAuthority: "FAA" as const,
          ratingsOrTypes: "Airframe, Powerplant",
          issueDate: daysFromNow(-1200),
          expirationDate: null,
          verificationStatus: "MANUALLY_VERIFIED" as const,
          verificationNotes: "Confirmed on FAA Airmen Inquiry — exact name + certificate match.",
        },
      ],
      clearances: [
        {
          level: "SECRET" as const,
          grantedDate: daysFromNow(-900),
          expirationOrReinvestigationDate: daysFromNow(20),
          verificationStatus: "MANUALLY_VERIFIED" as const,
          verificationNotes: "Verified via client-provided clearance letter.",
        },
      ],
    },
    {
      firstName: "David",
      lastName: "Chen",
      email: "david.chen@example.com",
      workAuthorizationStatus: "VISA_HOLDER" as const,
      workAuthorizationNotes: "H-1B, employer-sponsored transfer in progress",
      certifications: [
        {
          type: "TYPE_RATING" as const,
          certificateNumber: "EASA-FCL-88213",
          issuingAuthority: "EASA" as const,
          ratingsOrTypes: "A320",
          issueDate: daysFromNow(-500),
          expirationDate: daysFromNow(600),
          verificationStatus: "MANUAL_REVIEW_REQUIRED" as const,
        },
      ],
      clearances: [],
    },
    {
      firstName: "Sophie",
      lastName: "Laurent",
      email: "sophie.laurent@example.com",
      workAuthorizationStatus: "SPONSORSHIP_REQUIRED" as const,
      certifications: [
        {
          type: "PILOT_LICENSE" as const,
          certificateNumber: "9012345",
          issuingAuthority: "FAA" as const,
          ratingsOrTypes: "Commercial",
          issueDate: daysFromNow(-300),
          expirationDate: daysFromNow(1000),
          verificationStatus: "MANUALLY_REJECTED" as const,
          verificationNotes: "Certificate number returned no result on FAA Airmen Inquiry under this name.",
        },
      ],
      clearances: [],
    },
    {
      firstName: "Marcus",
      lastName: "Webb",
      email: "marcus.webb@example.com",
      workAuthorizationStatus: "US_CITIZEN" as const,
      certifications: [],
      clearances: [
        {
          level: "TOP_SECRET" as const,
          grantedDate: daysFromNow(-1500),
          expirationOrReinvestigationDate: daysFromNow(730),
          verificationStatus: "MANUALLY_VERIFIED" as const,
          verificationNotes: "Confirmed active via client facility security officer.",
        },
      ],
    },
    {
      firstName: "Elena",
      lastName: "Petrova",
      email: "elena.petrova@example.com",
      workAuthorizationStatus: "VISA_HOLDER" as const,
      certifications: [
        {
          type: "MEDICAL_CERTIFICATE" as const,
          certificateNumber: "5567891",
          issuingAuthority: "FAA" as const,
          ratingsOrTypes: "First Class",
          issueDate: daysFromNow(-100),
          expirationDate: daysFromNow(25),
          verificationStatus: "PENDING" as const,
        },
      ],
      clearances: [
        {
          level: "CONFIDENTIAL" as const,
          grantedDate: daysFromNow(-200),
          expirationOrReinvestigationDate: daysFromNow(900),
          verificationStatus: "MANUAL_REVIEW_REQUIRED" as const,
        },
      ],
    },
  ];

  for (const { certifications, clearances, ...candidateData } of candidates) {
    const candidate = await prisma.candidate.create({
      data: { ...candidateData, companyId: company.id },
    });

    for (const cert of certifications) {
      await prisma.certification.create({ data: { ...cert, candidateId: candidate.id } });
    }
    for (const clearance of clearances) {
      await prisma.securityClearance.create({ data: { ...clearance, candidateId: candidate.id } });
    }

    console.log(`Created ${candidate.firstName} ${candidate.lastName}`);
  }

  console.log(`Done — ${candidates.length} demo candidates created.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
