
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getReportePorcentaje } from '../api';

export default function BotonExcelPorcentaje({ eventoId, eventoNombre, fecha }) {
  const [loading, setLoading] = useState(false);

  const descargarExcel = async () => {
    setLoading(true);
    try {
      const res = await getReportePorcentaje(eventoId, fecha);
      const { resumen, por_salon, por_nivel, por_sede } = res.data;

      const libro = XLSX.utils.book_new();

      // ─── Hoja 1: Resumen general ───
      const filasResumen = [
        { 'Descripción': 'Total de alumnos', 'Valor': resumen.total_alumnos },
        { 'Descripción': 'Asistieron', 'Valor': resumen.asistieron },
        { 'Descripción': 'No asistieron', 'Valor': resumen.no_asistieron },
        { 'Descripción': 'Porcentaje de asistencia', 'Valor': `${resumen.porcentaje_general}%` },
      ];
      const hojaResumen = XLSX.utils.json_to_sheet(filasResumen);
      hojaResumen['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen General');

      // ─── Hoja 2: Por salón ───
      const filasSalon = por_salon.map(s => ({
        'Nivel': s.nivel,
        'Grado': s.grado,
        'Sección': s.seccion,
        'Salón': s.salon,
        'Sede': s.sede,
        'Total alumnos': s.total_alumnos,
        'Asistieron': s.asistieron,
        'No asistieron': s.no_asistieron,
        'Porcentaje': `${s.porcentaje}%`,
      }));
      const hojaSalon = XLSX.utils.json_to_sheet(filasSalon);
      hojaSalon['!cols'] = [
        { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 20 },
        { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(libro, hojaSalon, 'Por Salón');

      // ─── Hoja 3: Por nivel ───
      const filasNivel = por_nivel.map(n => ({
        'Nivel': n.nivel,
        'Total alumnos': n.total_alumnos,
        'Asistieron': n.asistieron,
        'No asistieron': n.total_alumnos - n.asistieron,
        'Porcentaje': `${n.porcentaje}%`,
      }));
      const hojaNivel = XLSX.utils.json_to_sheet(filasNivel);
      hojaNivel['!cols'] = [
        { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(libro, hojaNivel, 'Por Nivel');

      // ─── Hoja 4: Por sede ───
      const filasSede = por_sede.map(s => ({
        'Sede': s.sede,
        'Total alumnos': s.total_alumnos,
        'Asistieron': s.asistieron,
        'No asistieron': s.total_alumnos - s.asistieron,
        'Porcentaje': `${s.porcentaje}%`,
      }));
      const hojaSede = XLSX.utils.json_to_sheet(filasSede);
      hojaSede['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(libro, hojaSede, 'Por Sede');

      // ─── Descarga ───
      const nombreArchivo = `Porcentaje_Asistencia_${eventoNombre}_${fecha}.xlsx`
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
        background: loading ? '#444' : '#8b5cf6',
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
      {loading ? '⏳ Generando...' : '📊 Reporte % Asistencia'}
    </button>
  );
}