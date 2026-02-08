import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

const api = {
  // Policy Generation
  generatePolicies: (intent) =>
    apiClient.post("/api/v1/policies/generate", intent),

  // Policy Management
  listPolicies: () => apiClient.get("/api/v1/policies"),
  getPolicy: (policyId) => apiClient.get(`/api/v1/policies/${policyId}`),
  deletePolicy: (policyId) => apiClient.delete(`/api/v1/policies/${policyId}`),
  deployPolicies: (data) => apiClient.post("/api/v1/policies/deploy", data),

  // Drift Detection
  getDriftEvents: (limit = 100) =>
    apiClient.get(`/api/v1/drift/events?limit=${limit}`),
  analyzeDrift: () => apiClient.post("/api/v1/drift/analyze"),
  simulateDriftEvents: (count = 10) =>
    apiClient.post(`/api/v1/drift/simulate?count=${count}`),

  // Risk Scoring
  getRiskScore: () => apiClient.get("/api/v1/risk/score"),
  getRiskBreakdown: () => apiClient.get("/api/v1/risk/breakdown"),

  // Metrics
  getMetrics: () => apiClient.get("/api/v1/metrics"),

  // Cluster Info
  getServices: () => apiClient.get("/api/v1/services"),
  getNamespaces: () => apiClient.get("/api/v1/namespaces"),

  // Health Check
  healthCheck: () => apiClient.get("/health"),
};

export default api;
