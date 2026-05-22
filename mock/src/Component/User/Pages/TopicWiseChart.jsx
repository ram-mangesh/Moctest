import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTranslation } from "react-i18next";

const barColor = (score) =>
  score >= 80 ? "#059669" : score >= 60 ? "#F59E0B" : "#EF4444";

const barBg = (score) =>
  score >= 80 ? "#ECFDF5" : score >= 60 ? "#FFFBEB" : "#FEF2F2";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const color = barColor(score);
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0, letterSpacing: "-.03em" }}>
        {score}<span style={{ fontSize: 13, fontWeight: 500, color: "#64748B" }}>%</span>
      </p>
      <p style={{ fontSize: 11, color: "#94A3B8", margin: "4px 0 0", fontWeight: 500 }}>
        {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs improvement"}
      </p>
    </div>
  );
};

const TopicWiseChart = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", margin: 0 }}>
          {t("charts.noTopicData", "No topic data yet")}
        </p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div style={{ width: "100%", height: Math.max(260, sorted.length * 52 + 40) }}>
      <ResponsiveContainer>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 0, left: 8 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" horizontal={false} />

          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            tickFormatter={v => `${v}%`}
          />

          <YAxis
            type="category"
            dataKey="topic"
            width={90}
            tick={{ fill: "#374151", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />

          <Bar dataKey="avgScore" radius={[0, 8, 8, 0]} animationDuration={700} maxBarSize={28}>
            {sorted.map((d, i) => (
              <Cell key={i} fill={barColor(d.avgScore)} />
            ))}
            <LabelList
              dataKey="avgScore"
              position="right"
              formatter={v => `${v}%`}
              style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", fill: "#374151" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicWiseChart;