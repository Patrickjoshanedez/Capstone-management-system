import axios from 'axios';

// Use environment variable in production, fallback to proxy in development
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            if (parsed?.token) {
                config.headers.Authorization = `Bearer ${parsed.token}`;
            }
        } catch {
            // Ignore JSON parsing issues
        }
    }

    return config;
});

// Auth endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Project endpoints
export const projectAPI = {
    list: () => api.get('/projects'),
    getById: (projectId) => api.get(`/projects/${projectId}`),
    create: (projectData) => api.post('/projects', projectData),
    checkTitleSimilarity: (title) => api.post('/projects/check-title', { title }),
    uploadDocument: (projectId, formData, onUploadProgress) => 
        api.post(`/projects/${projectId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress,
        }),
    updateStatus: (projectId, status) => 
        api.patch(`/projects/${projectId}/status`, { status }),
    getLogs: (projectId) => api.get(`/projects/${projectId}/logs`),
};

// Notification endpoints (placeholder - can be implemented later)
export const notificationAPI = {
    list: () => api.get('/notifications'),
    markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
