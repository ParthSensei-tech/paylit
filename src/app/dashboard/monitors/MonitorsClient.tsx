"use client";

import React, { useState } from "react";
import { Radio, Plus, Trash2, Send, CheckCircle2, Clock, Globe, Mail } from "lucide-react";

interface MonitorItem {
  id: string;
  name: string;
  careersUrl: string;
  atsType: string;
  schedule: string;
  alertEmails: string;
  webhookUrl: string | null;
  active: boolean;
  createdAt: string;
  scanRuns: {
    startedAt: string;
    complianceScore: number;
    violations: number;
  }[];
}

export default function MonitorsClient({
  initialMonitors,
}: {
  initialMonitors: MonitorItem[];
}) {
  const [monitors, setMonitors] = useState<MonitorItem[]>(initialMonitors);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [careersUrl, setCareersUrl] = useState<string>("");
  const [ownerEmail, setOwnerEmail] = useState<string>("counsel@acmecloud.example");
  const [schedule, setSchedule] = useState<string>("daily");
  const [alertEmailsStr, setAlertEmailsStr] = useState<string>("counsel@acmecloud.example, hr-ops@acmecloud.example");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const emailList = alertEmailsStr.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          careersUrl,
          ownerEmail,
          schedule,
          alertEmails: emailList,
          webhookUrl: webhookUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.monitor) {
        setMonitors([data.monitor, ...monitors]);
        setShowAddModal(false);
        setName("");
        setCareersUrl("");
      } else {
        alert(data.error || "Failed to create monitor");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAlert = async (monitorId: string) => {
    setTestingId(monitorId);
    setTestStatus(null);
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_alert", monitorId }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus(`Dispatched: ${data.message}`);
      } else {
        setTestStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setTestStatus(`Failed: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to stop monitoring this careers board?")) return;
    try {
      await fetch(`/api/monitors?id=${id}`, { method: "DELETE" });
      setMonitors(monitors.filter((m) => m.id !== id));
    } catch (err: any) {
      alert("Failed to delete monitor");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-brand-hairline pb-4 gap-2">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            Configured Company Monitors
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Automated compliance crawlers scheduled to audit public ATS endpoints.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-hover flex items-center gap-2 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Monitored Board</span>
        </button>
      </div>

      {testStatus && (
        <div className="p-3 bg-brand-subtle border border-brand-hairline rounded text-xs text-ink flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-status-pass" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Monitors List */}
      <div className="space-y-4">
        {monitors.length === 0 ? (
          <div className="p-8 text-center bg-white border border-dashed border-brand-hairline rounded-lg space-y-3">
            <p className="font-serif text-lg font-bold text-ink">No Monitored Boards Configured</p>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Add your Greenhouse, Lever, Ashby, or custom careers board to schedule automated daily audits and receive instant breach alerts before regulators cite your postings.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-hover shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure First Board</span>
            </button>
          </div>
        ) : (
          monitors.map((m) => {
          let emails: string[] = [];
          try {
            emails = JSON.parse(m.alertEmails);
          } catch {
            emails = [m.alertEmails];
          }
          const latestScan = m.scanRuns[0];

          return (
            <div
              key={m.id}
              className="p-6 bg-white border border-brand-hairline rounded-lg hover:border-brand/40 transition-colors space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-xl font-bold text-ink">{m.name}</h3>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-brand-subtle border border-brand-hairline text-brand">
                      {m.atsType}
                    </span>
                    <span className="text-[11px] font-semibold text-status-pass flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-status-pass" />
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-ink-light" />
                      <a href={m.careersUrl} target="_blank" rel="noreferrer" className="underline hover:text-brand">
                        {m.careersUrl}
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ink-light" />
                      Schedule: {m.schedule.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTestAlert(m.id)}
                    disabled={testingId === m.id}
                    className="px-3 py-1.5 text-xs font-medium text-ink-muted border border-brand-hairline rounded hover:bg-brand-subtle flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3 text-brand" />
                    <span>{testingId === m.id ? "Sending..." : "Test Alert"}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-ink-light hover:text-status-violation rounded hover:bg-brand-subtle"
                    title="Remove Monitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alert Recipients & Latest Scan Overview */}
              <div className="pt-4 border-t border-brand-hairline grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase font-semibold block mb-1">
                    Alert Dispatch Recipients
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {emails.map((em, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-brand-subtle border border-brand-hairline text-ink-muted text-[11px] flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3 text-ink-light" />
                        {em}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-ink-muted uppercase font-semibold block mb-1">
                    Latest Monitored Audit Run
                  </span>
                  {latestScan ? (
                    <div className="text-ink-muted">
                      Score: <strong className="text-ink">{latestScan.complianceScore}%</strong> • Flagged:{" "}
                      <strong className="text-status-violation">{latestScan.violations}</strong> • Scanned:{" "}
                      {new Date(latestScan.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  ) : (
                    <span className="text-ink-light">Pending initial schedule execution</span>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Add Monitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-brand-hairline rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="border-b border-brand-hairline pb-3">
              <h3 className="font-serif text-xl font-bold text-ink">Add Careers Board Monitor</h3>
              <p className="text-xs text-ink-muted">Automate daily or weekly compliance evaluations.</p>
            </div>

            <form onSubmit={handleAddMonitor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stripe, Acme Corp"
                  className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Careers Page or ATS Board URL</label>
                <input
                  type="url"
                  required
                  value={careersUrl}
                  onChange={(e) => setCareersUrl(e.target.value)}
                  placeholder="https://boards.greenhouse.io/company or https://jobs.lever.co/company"
                  className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
                />
                <span className="text-[11px] text-ink-light mt-0.5 block">
                  Supports Greenhouse, Lever, Ashby, or custom HTML career portals.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink mb-1">Schedule Frequency</label>
                  <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
                  >
                    <option value="daily">Daily (Secured Cron)</option>
                    <option value="weekly">Weekly (Monday Digest)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Primary Counsel Email</label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Alert Email Recipients (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={alertEmailsStr}
                  onChange={(e) => setAlertEmailsStr(e.target.value)}
                  placeholder="counsel@company.com, vp-talent@company.com"
                  className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.company.com/webhooks/paylit"
                  className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
                />
              </div>

              <div className="pt-4 border-t border-brand-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-brand-hairline rounded text-ink-muted hover:bg-brand-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand text-white font-semibold rounded hover:bg-brand-hover"
                >
                  {isSubmitting ? "Detecting & Adding..." : "Activate Monitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
