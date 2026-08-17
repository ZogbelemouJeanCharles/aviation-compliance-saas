import "server-only";
import { Resend } from "resend";
import { CERTIFICATION_TYPE_LABELS, CLEARANCE_LEVEL_LABELS } from "@/lib/labels";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export type ExpiringCertificationSummary = {
  candidateName: string;
  type: keyof typeof CERTIFICATION_TYPE_LABELS;
  certificateNumber: string;
  expirationDate: Date;
};

export type ExpiringClearanceSummary = {
  candidateName: string;
  level: keyof typeof CLEARANCE_LEVEL_LABELS;
  expirationDate: Date;
};

export async function sendExpirationAlertEmail(params: {
  to: string[];
  companyName: string;
  certifications: ExpiringCertificationSummary[];
  clearances: ExpiringClearanceSummary[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping expiration alert email.");
    return;
  }

  const certRows = params.certifications
    .map(
      (c) =>
        `<tr><td>${c.candidateName}</td><td>${CERTIFICATION_TYPE_LABELS[c.type]} (${c.certificateNumber})</td><td>${dateFormatter.format(c.expirationDate)}</td></tr>`
    )
    .join("");

  const clearanceRows = params.clearances
    .map(
      (c) =>
        `<tr><td>${c.candidateName}</td><td>${CLEARANCE_LEVEL_LABELS[c.level]}</td><td>${dateFormatter.format(c.expirationDate)}</td></tr>`
    )
    .join("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #111;">
      <h2>Upcoming expirations — ${params.companyName}</h2>
      <p>The following certifications and clearances expire within the next 30 days:</p>
      ${
        params.certifications.length > 0
          ? `<h3>Certifications</h3>
             <table cellpadding="6" style="border-collapse: collapse;">
               <tr><th align="left">Candidate</th><th align="left">Certification</th><th align="left">Expires</th></tr>
               ${certRows}
             </table>`
          : ""
      }
      ${
        params.clearances.length > 0
          ? `<h3>Security clearances</h3>
             <table cellpadding="6" style="border-collapse: collapse;">
               <tr><th align="left">Candidate</th><th align="left">Level</th><th align="left">Expires</th></tr>
               ${clearanceRows}
             </table>`
          : ""
      }
      <p><a href="${appUrl}/candidates">Open the candidate list</a></p>
    </div>
  `;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "alerts@aerovet-compliance.dev",
    to: params.to,
    subject: `[AeroVet Compliance] Upcoming expirations for ${params.companyName}`,
    html,
  });
}
