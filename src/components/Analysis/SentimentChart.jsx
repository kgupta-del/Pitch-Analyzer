import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-lg px-3 py-2 text-xs text-white shadow-lg">
        Sentiment: <span className="text-cyan-400 font-bold">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export default function SentimentChart({ data = [] }) {
  const chartData = data.map((val, i) => ({ segment: `S${i + 1}`, sentiment: val }));

  return (
    <div className="bg-[#0d1f3a] border border-[#1a2d4d] rounded-xl p-5">
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium">Sentiment Over Time</p>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} barSize={14} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis dataKey="segment" tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="sentiment" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.sentiment >= 70 ? '#22d3ee' : entry.sentiment >= 40 ? '#3b82f6' : '#1e3a5f'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
