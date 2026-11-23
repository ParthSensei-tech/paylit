import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MonitorCreateSchema } from "@/lib/validation";
import { detectAtsType } from "@/lib/ats/detector";
import { dispatchComplianceAlert } from "@/lib/email/dispatcher";

export async function GET() {
  try {
    const monitors = await prisma.companyMonitor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        scanRuns: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ monitors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a test alert trigger
    if (body.action === "test_alert" && body.monitorId) {
      const monitor = await prisma.companyMonitor.findUnique({
        where: { id: body.monitorId },
      });
      if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

      let recipients: string[] = [];
      try {
        recipients = JSON.parse(monitor.alertEmails);
      } catch {
        recipients = [monitor.ownerEmail];
      }

      await dispatchComplianceAlert({
        monitorId: monitor.id,
        scanRunId: "test-scan-run",
        companyName: monitor.name,
        violationsFound: 2,
        fineExposure: "$2,000 – $15,000",
        criticalJobs: [
          { title: "Staff Software Engineer", location: "San Francisco, CA", violation: "Missing mandatory salary range (Cal. Lab. Code § 432.3)" },
          { title: "Senior Product Manager", location: "Denver, CO", violation: "Missing benefits & bonus overview (C.R.S. § 8-5-201)" },
        ],
        reportUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
        recipients,
      });

      return NextResponse.json({ success: true, message: `Test alert dispatched to ${recipients.join(", ")}` });
    }

    const parsed = MonitorCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { name, careersUrl, ownerEmail, schedule, alertEmails, webhookUrl } = parsed.data;
    const detected = detectAtsType(careersUrl);

    const monitor = await prisma.companyMonitor.create({
      data: {
        name,
        careersUrl,
        ownerEmail,
        atsType: detected.atsType,
        schedule,
        alertEmails: JSON.stringify(alertEmails),
        webhookUrl: webhookUrl || null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, monitor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.companyMonitor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
