import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
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

export default api;
