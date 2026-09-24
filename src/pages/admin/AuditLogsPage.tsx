import { useState, useEffect } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import { auditService } from "@/services/auditService";
import type { AuditLog } from "@/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await auditService.getAll();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
      (l.target && l.target.toLowerCase().includes(search.toLowerCase())) ||
      (l.actor?.email && l.actor.email.toLowerCase().includes(search.toLowerCase())) ||
      (l.actor?.displayName && l.actor.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const csv =
      "Timestamp,Action,Actor,Target,Details,Result\n" +
      filteredLogs
        .map(
          (l) =>
            `"${new Date(l.timestamp).toISOString()}","${l.action}","${l.actor?.email || "system"}","${l.target || ""}","${(l.details || "").replace(/"/g, '""')}","${l.result}"`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nsoc_audit_logs_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Audit Trail & Compliance Log
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Immutable trace of all administrative decisions, credential generation events, and dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Audit Log CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, actor, target ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background/50 pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground border-b border-border/60">
            <tr>
              <th className="px-5 py-3">Timestamp</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Target Reference</th>
              <th className="px-5 py-3">Details</th>
              <th className="px-5 py-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No audit entries found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] font-semibold text-primary rounded bg-primary/10 px-2 py-0.5">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground">{log.actor?.displayName || "Administrator"}</div>
                    <div className="text-[11px] text-muted-foreground">{log.actor?.email || "admin@nsoc.dev"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-amber-400">
                    {log.target || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-xs truncate" title={log.details || ""}>
                    {log.details || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        log.result === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
