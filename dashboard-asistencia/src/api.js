import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000'
});

export const getEventos = () => api.get('/eventos/');
export const getEstadisticasSalones = (eventoId) => api.get(`/asistencia/estadisticas/salones/${eventoId}`);
export const getRankingPrimeros = (eventoId) => api.get(`/asistencia/ranking/primeros/${eventoId}?limite=15`);
export const getEstadisticasNiveles = (eventoId) => api.get(`/asistencia/estadisticas/niveles/${eventoId}`);
export const getEstadisticasParientes = (eventoId) => api.get(`/asistencia/estadisticas/parientes/${eventoId}`);
export const getTotalAsistencias = (eventoId) => api.get(`/asistencia/total/${eventoId}`);