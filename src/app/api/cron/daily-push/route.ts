import { NextRequest, NextResponse } from "next/server";
import { deliverPendingLowStockPushes, sendDailyPushReminders } from "@/lib/push";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Push reminder cron is not configured: CRON_SECRET is missing");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const lowStock = await deliverPendingLowStockPushes();
    const reminders = await sendDailyPushReminders();
    return NextResponse.json({ lowStock, reminders });
  } catch (error) {
    console.error("Daily push notification job failed", error);
    return NextResponse.json({ error: "Unable to send scheduled notifications" }, { status: 500 });
  }
}
