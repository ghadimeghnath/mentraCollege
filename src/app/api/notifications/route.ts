import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: true, notifications: [] });
}

export async function POST() {
  return NextResponse.json({ success: true, message: "Notification created" });
}
