import { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  Download,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { participantService } from "@/services/participantService";
import { certificateService } from "@/services/certificateService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CATEGORY_COLORS = ["#6366f1", "#38bdf8", "#fbbf24", "#34d399", "#f43f5e"];

const DAILY_VERIFICATION_TRENDS = [
  { day: "Day 1", queries: 0, success: 0, notFound: 0 },
  { day: "Day 2", queries: 0, success: 0, notFound: 0 },
  { day: "Day 3", queries: 0, success: 0, notFound: 0 },
  { day: "Day 4", queries: 0, success: 0, notFound: 0 },
  { day: "Day 5", queries: 0, success: 0, notFound: 0 },
  { day: "Day 6", queries: 0, success: 0, notFound: 0 },
  { day: "Day 7", queries: 0, success: 0, notFound: 0 },
];

export default function AnalyticsPage() {
  const [participantsCount, setParticipantsCount] = useState(0);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    async function load() {
      const [parts, certs] = await Promise.all([
        participantService.getAll(),
        certificateService.getAll(),
      ]);
      setParticipantsCount(parts.length);
      setCertificatesCount(certs.length);

      // Aggregate categories
      const counts: Record<string, number> = {};
      certs.forEach((c) => {
        counts[c.certificateType] = (counts[c.certificateType] || 0) + 1;
      });
      const pieData = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }));
      setCategoryData(pieData);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Analytics & Insights
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Verification traffic, category distribution, and credential throughput metrics.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registrations"
          value={participantsCount}
          change={12.5}
          icon={Users}
          color="text-indigo-400"
        />
        <StatCard
          title="Issued Certificates"
          value={certificatesCount}
          change={32.1}
          icon={Award}
          color="text-amber-400"
        />
        <StatCard
          title="Lookup Inquiries"
          value="1,890"
          change={48.0}
          icon={ShieldCheck}
          color="text-cyan-400"
        />
        <StatCard
          title="Verification Accuracy"
          value="99.4%"
          change={0.2}
          icon={TrendingUp}
          color="text-emerald-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Volume Bar Chart */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-1">
            Daily Verification Volume
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Inbound queries processed through public verification gateway
          </p>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_VERIFICATION_TRENDS}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="queries" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Queries" />
                <Bar dataKey="success" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Valid Matches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Certificate Breakdown Pie Chart */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-1">
            Credential Distribution by Track
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Proportion of certificates issued across hackathon tracks
          </p>

          <div className="h-[280px] w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center">
                No certificates issued yet to categorize.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
