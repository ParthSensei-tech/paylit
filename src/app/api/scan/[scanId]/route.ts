import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const { scanId } = params;

    // Check by id or by publicToken
    const scanRun = await prisma.scanRun.findFirst({
      where: {
        OR: [{ id: scanId }, { publicToken: scanId }],
      },
      include: {
        results: {
          orderBy: [
            { severity: "desc" },
            { fineHigh: "desc" },
          ],
        },
        auditSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        monitor: true,
      },
    });

    if (!scanRun) {
      return NextResponse.json({ error: "Scan run not found." }, { status: 404 });
    }

    return NextResponse.json({ scanRun });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve scan." }, { status: 500 });
  }
}
