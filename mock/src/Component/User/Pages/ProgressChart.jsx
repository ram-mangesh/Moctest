import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTranslation } from "react-i18next";

const CustomTooltip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: "#6366F1", margin: 0, letterSpacing: "-.03em" }}>
        {payload[0].value}<span style={{ fontSize: 13, fontWeight: 500 }}>%</span>
      </p>
    </div>
  );
};

const ProgressChart = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/>
        </svg>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", margin: 0 }}>
          {t("charts.noData", "No attempt data yet")}
        </p>
      </div>
    );
  }

  const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length);

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#6366F1"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />

          <ReferenceLine
            y={avg}
            stroke="#6366F1"
            strokeDasharray="5 4"
            strokeOpacity={0.35}
            strokeWidth={1.5}
            label={{
              value: `avg ${avg}%`,
              position: "insideTopRight",
              fontSize: 10,
              fontWeight: 600,
              fill: "#6366F1",
              opacity: 0.55,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip t={t} />} cursor={{ stroke: "#6366F1", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: .4 }} />

          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#fff", stroke: "#6366F1", strokeWidth: 2.5 }}
            activeDot={{ r: 6, fill: "#6366F1", stroke: "#fff", strokeWidth: 2.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
