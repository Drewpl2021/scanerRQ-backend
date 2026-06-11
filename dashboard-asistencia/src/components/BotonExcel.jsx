import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getReporteCompleto } from '../api';

export default function BotonExcel({ eventoId, eventoNombre, fecha, estadisticas }) {
  const [loading, setLoading] = useState(false);

  const descargarExcel = async () => {
    setLoading(true);
    try {
      const res = await getReporteCompleto(eventoId, fecha);
      const asistentes = res.data;

      const libro = XLSX.utils.book_new();

      // ─── Hoja 1: Lista completa de asistentes ───
      const filasAsistentes = asistentes.map((a, i) => ({
        'N°': i + 1,
        'Apellidos': a.apellidos,
        'Nombres': a.nombres,
        'DNI': a.dni,
        'Nivel': a.nivel,
        'Grado': a.grado,
        'Sección': a.seccion,
        'Salón': a.salon,
        'Sede': a.sede,
        'Hora llegada': a.hora,
        'Fecha': a.fecha,
        'Acompañante': a.pariente,
        'Evento': a.evento,
      }));

      const hojaAsistentes = XLSX.utils.json_to_sheet(filasAsistentes);
      hojaAsistentes['!cols'] = [
        { wch: 5 },   // N°
        { wch: 25 },  // Apellidos
        { wch: 25 },  // Nombres
        { wch: 12 },  // DNI
        { wch: 12 },  // Nivel
        { wch: 8 },   // Grado
        { wch: 8 },   // Sección
        { wch: 20 },  // Salón
        { wch: 12 },  // Sede
        { wch: 12 },  // Hora
        { wch: 12 },  // Fecha
        { wch: 15 },  // Acompañante
        { wch: 25 },  // Evento
      ];
      XLSX.utils.book_append_sheet(libro, hojaAsistentes, 'Asistentes');

      // ─── Hoja 2: Resumen por salón ───
      const filasSalones = estadisticas.salones.map(s => ({
        'Salón': s.salon,
        'Grado': s.grado,
        'Sección': s.seccion,
        'Total asistentes': s.total_asistencias,
      }));
      const hojaSalones = XLSX.utils.json_to_sheet(filasSalones);
      hojaSalones['!cols'] = [
        { wch: 20 }, { wch: 8 }, { wch: 10 }, { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(libro, hojaSalones, 'Por Salón');

      // ─── Hoja 3: Resumen por nivel ───
      const filasNiveles = estadisticas.niveles.map(n => ({
        'Nivel': n.nivel,
        'Total asistentes': n.total_asistencias,
      }));
      const hojaNiveles = XLSX.utils.json_to_sheet(filasNiveles);
      hojaNiveles['!cols'] = [{ wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(libro, hojaNiveles, 'Por Nivel');

      // ─── Hoja 4: Resumen por acompañante ───
      const filasParientes = estadisticas.parientes.map(p => ({
        'Acompañante': p.pariente,
        'Total': p.total,
      }));
      const hojaParientes = XLSX.utils.json_to_sheet(filasParientes);
      hojaParientes['!cols'] = [{ wch: 18 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(libro, hojaParientes, 'Por Acompañante');

      // ─── Hoja 5: Resumen por sede ───
      const conteoSede = {};
      asistentes.forEach(a => {
        if (!conteoSede[a.sede]) conteoSede[a.sede] = 0;
        conteoSede[a.sede]++;
      });
      const filasSede = Object.entries(conteoSede).map(([sede, total]) => ({
        'Sede': sede,
        'Total asistentes': total,
      }));
      const hojaSede = XLSX.utils.json_to_sheet(filasSede);
      hojaSede['!cols'] = [{ wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(libro, hojaSede, 'Por Sede');

      // ─── Descarga ───
      const nombreArchivo = `Reporte_${eventoNombre}_${fecha}.xlsx`
        .replace(/\s+/g, '_')
        .replace(/\//g, '-');

      const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, nombreArchivo);

    } catch (err) {
      console.error('Error generando Excel:', err);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={descargarExcel}
      disabled={loading}
      style={{
        background: loading ? '#444' : '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
      }}
    >
      {loading ? '⏳ Generando...' : '📥 Descargar Excel'}
    </button>
  );
}