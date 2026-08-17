import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCertificationDocument } from "@/lib/db/certifications";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await params;
  const certification = await getCertificationDocument(session.companyId, id);

  if (!certification || !certification.documentData) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(certification.documentData), {
    headers: {
      "Content-Type": certification.documentMimeType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${certification.documentFileName ?? "document"}"`,
    },
  });
}
