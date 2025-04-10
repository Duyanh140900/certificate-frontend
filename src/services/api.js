import axios from "axios";

const API_URL = "http://localhost:3001/api";

// Tạo instance của axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MzM1YmUxMy0wNjE3LTRlYTMtYTBkYS03ODk4Mzg3Y2U1MTciLCJpYXQiOjE3NDI4MDExODQsIkVtYWlsIjoiZHV5YW5oMTRAZ21haWwuY29tIiwiVXNlcklkIjoiNjc4NWU3ZTk0ZjVlYTY4NDRlN2Y4YzE3IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI2Nzg1ZTdlOTRmNWVhNjg0NGU3ZjhjMTciLCJ1c2VybmFtZSI6ImR1eWFuaDE0IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImR1eWFuaDE0IiwidW5pcXVlX25hbWUiOiJkdXlhbmgxNCIsInN1YiI6ImR1eWFuaDE0IiwiZnVsbG5hbWUiOiJQaOG6oW0gTmfhu41jIER1eSIsInNpdGVJZCI6MSwiZGVwYXJ0bWVudElkIjoxLCJHZW5kZXIiOiJPdGhlciIsInBvc2l0aW9uSWQiOjAsIlJvbGUiOiJTVFVERU5UIiwibmJmIjoxNzQyODAxMTg0LCJleHAiOjE3NDUzOTMxODQsImlzcyI6Ik1PT0NTLVBURFYiLCJhdWQiOiJNT09DUyJ9.12uxxBn2WpWxgoJjysc_IQKwR_G3ryISjrItM3ukmtw";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Upload API
export const uploadAPI = {
  // Upload file lên MinIO server
  uploadToMinIO: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("https://api.pm-ptdv.com/api/UploadMinIO", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onUploadProgress,
    });
  },
};

// API Template
export const templateAPI = {
  getAllTemplates: (params) => api.get("/templates", { params }),
  getTemplateById: (id) => api.get(`/templates/${id}`),
  getDefaultTemplate: () => api.get("/templates/default"),
  createTemplate: (data) => api.post("/templates", data),
  updateTemplate: (id, data) => api.put(`/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/templates/${id}`),
};

// API Certificate
export const certificateAPI = {
  getCertificates: (params) => api.get("/certificates", { params }),
  getCertificateById: (id) => api.get(`/certificates/${id}`),
  createCertificate: (data) => api.post("/certificates", data),
  verifyCertificate: (certificateId) =>
    api.get(`/certificates/verify/${certificateId}`),
  downloadCertificate: (id) =>
    api.get(`/certificates/${id}/download`, { responseType: "blob" }),
  previewCertificate: (id) =>
    api.get(`/certificates/${id}/preview`, { responseType: "blob" }),
  getImagePreview: (id) =>
    api.get(`/certificates/${id}/image`, { responseType: "blob" }),
  revokeCertificate: (id) => api.put(`/certificates/${id}/revoke`),
};

// API Auth
export const authAPI = {
  getMe: () => api.get("/auth/me"),
};

export default api;
