import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

export const getEventos = () => api.get('/eventos/');

export const getEstadisticasSalones = (eventoId, fecha) =>
  api.get(`/asistencia/estadisticas/salones/${eventoId}${fecha ? `?fecha=${fecha}` : ''}`);

export const getRankingPrimeros = (eventoId, fecha) =>
  api.get(`/asistencia/ranking/primeros/${eventoId}?limite=15${fecha ? `&fecha=${fecha}` : ''}`);

export const getEstadisticasNiveles = (eventoId, fecha) =>
  api.get(`/asistencia/estadisticas/niveles/${eventoId}${fecha ? `?fecha=${fecha}` : ''}`);

export const getEstadisticasParientes = (eventoId, fecha) =>
  api.get(`/asistencia/estadisticas/parientes/${eventoId}${fecha ? `?fecha=${fecha}` : ''}`);

export const getTotalAsistencias = (eventoId, fecha) =>
  api.get(`/asistencia/total/${eventoId}${fecha ? `?fecha=${fecha}` : ''}`);

export const getReporteCompleto = (eventoId, fecha) =>
  api.get(`/asistencia/reporte/completo/${eventoId}${fecha ? `?fecha=${fecha}` : ''}`);

export const getReportePorcentaje = (eventoId, fecha) =>
  api.get(`/asistencia/reporte/porcentaje/${eventoId}${fecha ? `?fecha=${fecha}` : ''}`);