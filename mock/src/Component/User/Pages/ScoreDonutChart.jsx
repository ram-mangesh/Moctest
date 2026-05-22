import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTranslation } from "react-i18next";

const PALETTE = [
  { fill: "#059669", bg: "#ECFDF5", border: "#A7F3D0", label: "Excellent" },
  { fill: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", label: "Good"      },
  { fill: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", label: "Needs Work"},
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".06em" }}>{d.name}</p>
      <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: d.payload.fill }}>
        {d.value} <span style={{ fontSize: 12, fontWeight: 500, color: "#64748B" }}>attempts</span>
      </p>
    </div>
  );
};

const renderLegend = (dist) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, paddingLeft: 16 }}>
    {dist.map((d, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: PALETTE[i].fill, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 }}>{d.name}</p>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{d.value} attempts</p>
        </div>
        <div style={{
          minWidth: 34,
          background: PALETTE[i].bg,
          border: `1px solid ${PALETTE[i].border}`,
          borderRadius: 20,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 700,
          color: PALETTE[i].fill,
          textAlign: "center",
        }}>
          {d.pct}%
        </div>
      </div>
    ))}
  </div>
);

const ScoreDonutChart = ({ attempts }) => {
  const { t } = useTranslation();

  if (!attempts || attempts.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", margin: 0 }}>
          {t("charts.noDistribution", "No data yet")}
        </p>
      </div>
    );
  }

  const total = attempts.length;
  const counts = [
    attempts.filter(a => a.scorePercent >= 80).length,
    attempts.filter(a => a.scorePercent >= 60 && a.scorePercent < 80).length,
    attempts.filter(a => a.scorePercent < 60).length,
  ];

  const dist = [
    { name: t("charts.excellent", "Excellent ≥80%"), value: counts[0], pct: Math.round(counts[0] / total * 100) },
    { name: t("charts.good", "Good 60–79%"),         value: counts[1], pct: Math.round(counts[1] / total * 100) },
    { name: t("charts.needsWork", "Needs Work <60%"), value: counts[2], pct: Math.round(counts[2] / total * 100) },
  ];

  const avgScore = Math.round(attempts.reduce((s, a) => s + a.scorePercent, 0) / total);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {/* Donut */}
      <div style={{ width: "55%", height: 240, position: "relative", flexShrink: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dist}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={105}
              paddingAngle={4}
              cornerRadius={6}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {dist.map((_, i) => (
                <Cell key={i} fill={PALETTE[i].fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: "-.04em", lineHeight: 1 }}>
            {avgScore}<span style={{ fontSize: 14, fontWeight: 500, color: "#64748B" }}>%</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 3 }}>
            avg score
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {renderLegend(dist)}
      </div>
    </div>
  );
};

export default ScoreDonutChart;