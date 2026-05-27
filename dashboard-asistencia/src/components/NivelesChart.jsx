import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const TooltipCustom = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 600 }}>{payload[0].name}</div>
      <div style={{ color: '#94a3b8' }}>{payload[0].value} alumnos</div>
    </div>
  );
};

export default function NivelesChart({ data }) {
  if (!data.length) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin datos aún</p>;

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="total_asistencias" nameKey="nivel" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
          </Pie>
          <Tooltip content={<TooltipCustom />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORES[i % COLORES.length], display: 'inline-block' }}></span>
            {d.nivel} ({d.total_asistencias})
          </div>
        ))}
      </div>
    </div>
  );
}