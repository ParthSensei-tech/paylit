import cron from "node-cron";

console.log("[Paylit Cron Worker] Initialized daily cron runner.");

// Run daily at midnight or every hour in dev demonstration
cron.schedule("0 0 * * *", async () => {
  console.log(`[Paylit Cron Worker] Triggering daily scan at ${new Date().toISOString()}`);
  try {
    const res = await fetch("http://localhost:3000/api/cron/daily", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || "paylit-dev-cron-secret-2026"}`,
      },
    });
    const data = await res.json();
    console.log("[Paylit Cron Worker] Daily scan executed successfully:", data);
  } catch (err) {
    console.error("[Paylit Cron Worker] Failed to run daily scan:", err.message);
  }
});
