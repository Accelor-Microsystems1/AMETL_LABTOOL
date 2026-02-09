import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const equipmentAPI = {
  // Get all equipments
  getAll: (params) => api.get('/equipment', { params }),
  
  // Get single equipment with all records
  getById: (id) => api.get(`/equipment/${id}`),
  
  // Create equipment
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/equipment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update equipment
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/equipment/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete equipment
  delete: (id) => api.delete(`/equipment/${id}`),
  
  // Update status
  updateStatus: (id, status) => api.patch(`/equipment/${id}/status`, { status }),
  
  getStats: () => api.get('/equipment/stats')
};

export const calibrationAPI = {
  getByEquipmentId: (equipmentId) => api.get(`/calibrations/equipment/${equipmentId}`),
  getById: (id) => api.get(`/calibrations/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/calibrations/${data.equipmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => api.put(`/calibrations/${id}`, data),
  delete: (id) => api.delete(`/calibrations/${id}`),
  getUpcoming: (days = 30) => api.get('/calibrations/upcoming', { params: { days } }),
  getOverdue: () => api.get('/calibrations/overdue')
};

export const performanceAPI = {
  getByEquipmentId: (equipmentId) => api.get(`/performances/equipment/${equipmentId}`),
  getById: (id) => api.get(`/performances/${id}`),
  create: (data) => api.post(`/performances/${data.equipmentId}`, data),
  update: (id, data) => api.put(`/performances/${id}`, data),
  delete: (id) => api.delete(`/performances/${id}`)
};

export const maintenanceAPI = {
  getByEquipmentId: (equipmentId) => api.get(`/maintenances/equipment/${equipmentId}`),
  getById: (id) => api.get(`/maintenances/${id}`),
  create: (data) => api.post(`/maintenances/${data.equipmentId}`, data),
  update: (id, data) => api.put(`/maintenances/${id}`, data),
  delete: (id) => api.delete(`/maintenances/${id}`)
};

export const incidentAPI = {
  getByEquipmentId: (equipmentId) => api.get(`/incidents/equipment/${equipmentId}`),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post(`/incidents/${data.equipmentId}`, data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
  getOpen: () => api.get('/incidents/open')
};

export default api;