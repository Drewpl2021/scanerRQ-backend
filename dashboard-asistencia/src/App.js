import { useState, useEffect } from 'react';
import { getEventos } from './api';
import useAsistencia from './hooks/useAsistencia';
import MetricCard from './components/MetricCard';
import SalonesChart from './components/SalonesChart';
import NivelesChart from './components/NivelesChart';
import ParientesChart from './components/ParientesChart';
import RankingTable from './components/RankingTable';
import './App.css';

export default function App() {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const { data, loading, ultimaActualizacion, refetch } = useAsistencia(eventoSeleccionado?.id);

  useEffect(() => {
    getEventos().then(res => {
      setEventos(res.data);
      if (res.data.length > 0) setEventoSeleccionado(res.data[0]);
    });
  }, []);

  const primerRegistro = data.ranking[0];
  const nivelMasTemprano = data.niveles[0];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📋</div>
          <span className="logo-text">AsistenciaQR</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-label">Evento activo</div>
          {eventos.map(ev => (
            <button
              key={ev.id}
              className={`nav-item ${eventoSeleccionado?.id === ev.id ? 'active' : ''}`}
              onClick={() => setEventoSeleccionado(ev)}
            >
              <span className="nav-dot"></span>
              {ev.nombre}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {ultimaActualizacion && (
            <div className="update-info">
              <div className="update-dot"></div>
              <span>Actualizado {ultimaActualizacion.toLocaleTimeString()}</span>
            </div>
          )}
          <button className="refresh-btn" onClick={refetch}>
            ↻ Actualizar ahora
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        {/* Header */}
        <header className="main-header">
          <div>
            <h1 className="main-title">Dashboard de Asistencia</h1>
            <p className="main-sub">
              {eventoSeleccionado?.nombre} · {eventoSeleccionado?.fecha_inicio}
            </p>
          </div>
          <div className="live-badge">
            <span className="live-dot"></span>
            En vivo
          </div>
        </header>

        {/* Métricas */}
        <div className="metrics-grid">
          <MetricCard
            icon="👥"
            label="Total registrados"
            value={loading ? '...' : data.total}
            sub="alumnos con asistencia"
            color="#3b82f6"
          />
          <MetricCard
            icon="⏰"
            label="Primer registro"
            value={loading ? '...' : primerRegistro?.hora || '—'}
            sub={primerRegistro ? `${primerRegistro.nombre} ${primerRegistro.apellido}` : 'Sin registros aún'}
            color="#10b981"
          />
          <MetricCard
            icon="🏫"
            label="Salones registrados"
            value={loading ? '...' : data.salones.length}
            sub="con al menos 1 asistencia"
            color="#f59e0b"
          />
          <MetricCard
            icon="🏆"
            label="Nivel más puntual"
            value={loading ? '...' : nivelMasTemprano?.nivel || '—'}
            sub={nivelMasTemprano ? `${nivelMasTemprano.total_asistencias} asistencias` : ''}
            color="#8b5cf6"
          />
        </div>

        {/* Fila 1 */}
        <div className="row-2-1">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Asistencias por salón</span>
              <span className="card-badge">{data.salones.length} salones</span>
            </div>
            <SalonesChart data={data.salones} />
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Por nivel educativo</span>
            </div>
            <NivelesChart data={data.niveles} />
          </div>
        </div>

        {/* Fila 2 */}
        <div className="row-1-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quién acompaña</span>
            </div>
            <ParientesChart data={data.parientes} />
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">🏅 Top 15 más puntuales</span>
              <span className="card-badge">{data.ranking.length} registros</span>
            </div>
            <RankingTable data={data.ranking} />
          </div>
        </div>

      </main>
    </div>
  );
}