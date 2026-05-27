export default function MetricCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '1.25rem 1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      borderTop: `4px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
    </div>
  );
}