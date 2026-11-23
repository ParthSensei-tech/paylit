import { NextRequest, NextResponse } from "next/server";
import { evaluateJobCompliance } from "@/lib/rules/engine";
import { fetchJobsFromSource } from "@/lib/ats/detector";
import { validateUrlForSsrf } from "@/lib/ssrf";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, url, title, location } = body;

    let jobToEvaluate: any = {
      externalId: "cand-" + Date.now(),
      title: title || "Job Opportunity",
      location: location || "Remote – US",
      rawText: text || "",
    };

    if (url && typeof url === "string" && url.startsWith("http")) {
      const ssrfCheck = await validateUrlForSsrf(url);
      if (ssrfCheck.valid && ssrfCheck.normalizedUrl) {
        try {
          const fetchResult = await fetchJobsFromSource(ssrfCheck.normalizedUrl);
          if (fetchResult.jobs && fetchResult.jobs.length > 0) {
            jobToEvaluate = fetchResult.jobs[0];
          }
        } catch {
          // Fallback to text provided
        }
      }
    }

    if (!jobToEvaluate.rawText && !text) {
      return NextResponse.json(
        { error: "Please provide either the job description text or a public job posting URL." },
        { status: 400 }
      );
    }

    if (!jobToEvaluate.rawText && text) {
      jobToEvaluate.rawText = text;
    }

    const evaluation = evaluateJobCompliance(jobToEvaluate);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error("[Candidate Check Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to evaluate listing." },
      { status: 500 }
    );
  }
}
