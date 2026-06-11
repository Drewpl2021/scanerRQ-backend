import axios from 'axios';

const BASE_URL = 'http://192.168.0.231:8000';

const api = axios.create({ baseURL: BASE_URL });

export const getEventos = () => api.get('/eventos/');
export const buscarAlumnoPorCodigo = (codigo) => api.get(`/alumnos/codigo/${codigo}`);
export const registrarAsistencia = (codigo, evento_id, pariente) =>
  api.post(`/asistencia/registrar/${codigo}?evento_id=${evento_id}`, { pariente });