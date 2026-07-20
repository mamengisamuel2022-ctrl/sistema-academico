import axios from 'axios';

// ✅ URL CORRETA do backend
const API_URL = 'https://sistema-academico-w5ov.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reclamacaoService = {
  criar: (data) => api.post('/reclamacoes', data),
  listar: (params) => api.get('/reclamacoes', { params }),
  buscar: (id) => api.get(`/reclamacoes/${id}`),
  atualizarStatus: (id, data) => api.patch(`/reclamacoes/${id}/status`, data),
  responder: (id, data) => api.post(`/reclamacoes/${id}/responder`, data),
  comentar: (id, data) => api.post(`/reclamacoes/${id}/comentario`, data),
  votar: (id, tipo) => api.post(`/reclamacoes/${id}/votar`, { tipo }),
  buscarPorMatricula: (matricula) => api.get(`/reclamacoes/matricula/${matricula}`),
  deletar: (id) => api.delete(`/reclamacoes/${id}`),
  dashboard: () => api.get('/reclamacoes/dashboard'),
  meusTickets: () => api.get('/reclamacoes/tickets/meus'),
  atribuirTicket: (ticketId, atendenteId) => api.post('/reclamacoes/tickets/atribuir', { ticketId, atendenteId }),
  iniciarAtendimento: (id) => api.patch(`/reclamacoes/tickets/${id}/iniciar`),
  encaminharTicket: (id, data) => api.patch(`/reclamacoes/tickets/${id}/encaminhar`, data),
  fecharTicket: (id, data) => api.patch(`/reclamacoes/tickets/${id}/fechar`, data)
};

export default api;