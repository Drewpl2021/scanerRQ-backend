import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORES = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function ParientesChart({ data }) {
  if (!data.length) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin datos aún</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="pariente" type="category" tick={{ fontSize: 12, fill: '#374151' }} width={90} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13 }}
          formatter={(v) => [`${v} personas`]}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}