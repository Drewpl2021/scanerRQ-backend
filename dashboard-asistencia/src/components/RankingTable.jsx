const MEDALLAS = { 0: '🥇', 1: '🥈', 2: '🥉' };

const PARIENTE_COLOR = {
  'Madre': '#ec4899',
  'Padre': '#3b82f6',
  'Apoderado': '#8b5cf6',
  'Tío/Tía': '#f59e0b',
  'Abuelo/Abuela': '#10b981',
};

export default function RankingTable({ data }) {
  if (!data.length) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin registros aún</p>;

  return (
    <div style={{ overflowX: 'auto', maxHeight: 320, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <tr>
            {['#', 'Alumno', 'Salón', 'Hora', 'Acompañante'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((a, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '10px 12px', fontSize: 18 }}>{MEDALLAS[i] || <span style={{ color: '#94a3b8', fontSize: 13 }}>{i + 1}</span>}</td>
              <td style={{ padding: '10px 12px', fontWeight: i < 3 ? 700 : 400, color: '#1e293b' }}>
                {a.apellido}, {a.nombre}
              </td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ background: '#eff6ff', color: '#3b82f6', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {a.salon}
                </span>
              </td>
              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                {a.hora}
              </td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{
                  background: `${PARIENTE_COLOR[a.pariente] || '#94a3b8'}18`,
                  color: PARIENTE_COLOR[a.pariente] || '#94a3b8',
                  borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600
                }}>
                  {a.pariente || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}