import { NextRequest, NextResponse } from "next/server";
import { runExpirationAlerts } from "@/lib/alerts/run-expiration-alerts";

// Triggered by Vercel Cron (see vercel.json) once a day. Vercel signs the
// request with `Authorization: Bearer $CRON_SECRET` — verify it so this
// endpoint can't be used by anyone else to mass-email every tenant.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse(null, { status: 401 });
    }
  }

  const summary = await runExpirationAlerts();
  return NextResponse.json(summary);
}
