import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for large PDFs
});

// Attach Bearer token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medbios_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),

  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),

  me: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
};

export const uploadReport = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return response.data;
};

/**
 * Upload a report and get back {report_id, status: "pending"} immediately.
 * Use together with openPipelineSocket() to stream progress.
 */
export const uploadReportPending = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onUploadProgress && e.total) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return response.data; // { report_id, patient_id, status: "pending" }
};

export const getWsBase = () => {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WS_URL || `${proto}//${window.location.host}`;
  return host;
};

/**
 * Open a WebSocket to /ws/pipeline/{reportId}.
 * Returns the WebSocket instance; caller attaches .onmessage / .onerror.
 */
export const openPipelineSocket = (reportId) => {
  return new WebSocket(`${getWsBase()}/ws/pipeline/${reportId}`);
};

/**
 * Upload multiple PDF files as a batch.
 * Returns { batch_id, reports: [{ report_id, filename, status }] }
 */
export const uploadBatch = async (files, patientInfo = {}, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  if (patientInfo.name) formData.append('patient_name', patientInfo.name);
  if (patientInfo.age) formData.append('patient_age', String(patientInfo.age));
  if (patientInfo.gender) formData.append('patient_gender', patientInfo.gender);
  const response = await api.post('/reports/batch-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onUploadProgress && e.total) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return response.data;
};

/**
 * Open a WebSocket to /ws/batch/{batchId} for concurrent batch pipeline streaming.
 * Returns the WebSocket instance; caller attaches .onmessage / .onerror.
 */
export const openBatchSocket = (batchId) => {
  return new WebSocket(`${getWsBase()}/ws/batch/${batchId}`);
};

export const listReports = async (page = 1, pageSize = 20) => {
  const response = await api.get(`/reports/?page=${page}&page_size=${pageSize}`);
  return response.data;
};

export const getReport = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

export const getKnowledgeGraphStats = async () => {
  const response = await api.get('/reports/knowledge-graph/stats');
  return response.data;
};

export const queryKnowledgeGraph = async (entity, depth = 2) => {
  const response = await api.get(`/reports/knowledge-graph/query/${entity}?depth=${depth}`);
  return response.data;
};

export const checkDrugInteractions = async (medications, labValues = null) => {
  const endpoint = labValues
    ? '/reports/drug-interactions/lab-check'
    : '/reports/drug-interactions/check';
  const payload = { medications };
  if (labValues) payload.lab_values = labValues;
  const response = await api.post(endpoint, payload);
  return response.data;
};

export const getPatientTrends = async (patientId) => {
  const response = await api.get(`/reports/patient/${patientId}/trends`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/reports/analytics/dashboard');
  return response.data;
};

export const getReportPdfUrl = (reportId) => {
  return `${API_BASE}/reports/export/${reportId}/pdf`;
};

export const sendChatMessage = async (reportId, message) => {
  const response = await api.post(`/reports/${reportId}/chat`, { message });
  return response.data;
};

export const getRecommendations = async (reportId) => {
  const response = await api.get(`/reports/${reportId}/recommendations`);
  return response.data;
};

export default api;
