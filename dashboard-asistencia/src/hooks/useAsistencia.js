import { useState, useEffect, useCallback } from 'react';
import {
  getEstadisticasSalones,
  getRankingPrimeros,
  getEstadisticasNiveles,
  getEstadisticasParientes,
  getTotalAsistencias
} from '../api';

export default function useAsistencia(eventoId) {
  const [data, setData] = useState({
    salones: [],
    ranking: [],
    niveles: [],
    parientes: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const fetchData = useCallback(async () => {
    if (!eventoId) return;
    try {
      const [salones, ranking, niveles, parientes, total] = await Promise.all([
        getEstadisticasSalones(eventoId),
        getRankingPrimeros(eventoId),
        getEstadisticasNiveles(eventoId),
        getEstadisticasParientes(eventoId),
        getTotalAsistencias(eventoId),
      ]);
      setData({
        salones: salones.data,
        ranking: ranking.data,
        niveles: niveles.data,
        parientes: parientes.data,
        total: total.data.total,
      });
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    fetchData();
    const intervalo = setInterval(fetchData, 30000); // cada 30 segundos
    return () => clearInterval(intervalo);
  }, [fetchData]);

  return { data, loading, ultimaActualizacion, refetch: fetchData };
}