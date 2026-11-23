import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, metadata } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType is required." }, { status: 400 });
    }

    const event = await prisma.eventLog.create({
      data: {
        eventType,
        metadata: metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log event" }, { status: 500 });
  }
}
