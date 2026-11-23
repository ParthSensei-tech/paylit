import { z } from "zod";

export const ScanRequestSchema = z.object({
  url: z.string().min(3, "URL is required").max(500, "URL too long"),
  monitorId: z.string().optional(),
});

export const MonitorCreateSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  careersUrl: z.string().min(4, "Careers URL is required"),
  ownerEmail: z.string().email("Valid email required"),
  schedule: z.enum(["daily", "weekly"]).default("daily"),
  alertEmails: z.array(z.string().email()).min(1, "At least one alert email is required"),
  webhookUrl: z.string().url().optional().or(z.literal("")),
});

// In-memory token bucket rate limiter for /api/scan
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

export function checkScanRateLimit(ip: string, limit = 20, windowMs = 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipMap.get(ip);

  if (!record || now > record.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}
