import { prisma } from "../prisma";

export interface AlertNotificationPayload {
  monitorId?: string | null;
  scanRunId: string;
  companyName: string;
  violationsFound: number;
  fineExposure: string;
  criticalJobs: { title: string; location: string; violation: string }[];
  reportUrl: string;
  recipients: string[];
}

export async function dispatchComplianceAlert(payload: AlertNotificationPayload): Promise<void> {
  const hasResendKey = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5;

  const emailSubject = `[ACTION REQUIRED] Paylit Compliance Alert: ${payload.violationsFound} non-compliant postings for ${payload.companyName}`;
  const plainText = `
Paylit Pay-Transparency Compliance Alert
Company: ${payload.companyName}
Violations Detected: ${payload.violationsFound}
Estimated Fine Exposure: ${payload.fineExposure}

Critical Items Requiring Immediate Remediation:
${payload.criticalJobs.map((j, i) => `${i + 1}. ${j.title} (${j.location}) - ${j.violation}`).join("\n")}

View full audit & copy compliant clauses:
${payload.reportUrl}

Note: Automated screening aid, not legal advice.
  `.trim();

  if (hasResendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Paylit Alerts <alerts@paylit.compliance>",
          to: payload.recipients,
          subject: emailSubject,
          text: plainText,
        }),
      });

      const resData = await res.json();
      await prisma.alertEvent.create({
        data: {
          monitorId: payload.monitorId || null,
          scanRunId: payload.scanRunId,
          channel: "email",
          status: res.ok ? "delivered" : "failed",
          details: JSON.stringify(resData),
        },
      });
      return;
    } catch (err: any) {
      console.error("[Paylit Alert Email Error]", err);
    }
  }

  // Console transport fallback
  console.log("------------------------------------------------------------");
  console.log(`[PAYLIT DISPATCH - CONSOLE TRANSPORT] To: ${payload.recipients.join(", ")}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(plainText);
  console.log("------------------------------------------------------------");

  await prisma.alertEvent.create({
    data: {
      monitorId: payload.monitorId || null,
      scanRunId: payload.scanRunId,
      channel: "console",
      status: "delivered",
      details: "Delivered via dev console fallback transport",
    },
  });
}
