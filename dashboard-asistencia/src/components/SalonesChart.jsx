import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORES = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#14b8a6'];

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#94a3b8' }}>{payload[0].value} alumnos</div>
    </div>
  );
};

export default function SalonesChart({ data }) {
  if (!data.length) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin datos aún</p>;

  const dataFormateada = data.map(d => ({
    nombre: `${d.grado}° ${d.seccion}`,
    asistencias: d.total_asistencias,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dataFormateada} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="asistencias" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {dataFormateada.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}