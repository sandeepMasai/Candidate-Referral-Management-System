import axios from 'axios';
import type {
  Candidate,
  CandidateFilterState,
  CandidateFormPayload,
  CandidateMetrics,
  CandidateStatus,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
  Profile,
  ProfileUpdatePayload,
  AdminUser,
  AdminStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const backendOrigin =
  import.meta.env.VITE_BACKEND_ORIGIN ??
  API_BASE_URL.replace(/\/api\/?$/, '');

export const listCandidates = async (filters: CandidateFilterState) => {
  const response = await apiClient.get<{ candidates: Candidate[] }>('/candidates', {
    params: {
      status: filters.status || undefined,
      jobTitle: filters.jobTitle || undefined,
      q: filters.q || undefined,
    },
  });
  return response.data.candidates;
};

export const fetchMetrics = async () => {
  const response = await apiClient.get<CandidateMetrics>('/candidates/metrics');
  return response.data;
};

export const createCandidate = async (payload: CandidateFormPayload) => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('email', payload.email);
  formData.append('phone', payload.phone);
  formData.append('jobTitle', payload.jobTitle);

  if (payload.resume) {
    formData.append('resume', payload.resume);
  }

  const response = await apiClient.post<{ candidate: Candidate; message: string }>(
    '/candidates',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data.candidate;
};

export const updateCandidateStatus = async (id: string, status: CandidateStatus) => {
  const response = await apiClient.put<{ candidate: Candidate; message: string }>(
    `/candidates/${id}/status`,
    { status }
  );
  return response.data.candidate;
};

export const deleteCandidate = async (id: string) => {
  await apiClient.delete(`/candidates/${id}`);
};

export const getResumeUrl = (resumePath?: string) => {
  if (!resumePath) {
    return null;
  }

  if (/^https?:\/\//i.test(resumePath)) {
    return resumePath;
  }

  return `${backendOrigin}${resumePath}`;
};

// Auth API functions
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  return response.data.user;
};

// Profile API functions
export const getProfile = async (): Promise<Profile | null> => {
  const response = await apiClient.get<{ profile: Profile | null }>('/profile');
  return response.data.profile;
};

export const updateProfile = async (payload: ProfileUpdatePayload): Promise<Profile> => {
  const response = await apiClient.post<{ profile: Profile }>('/profile', payload);
  return response.data.profile;
};

// Admin API functions
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
};

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<{ users: AdminUser[] }>('/admin/users');
  return response.data.users;
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user' | 'hr_manager'): Promise<AdminUser> => {
  const response = await apiClient.put<{ user: AdminUser }>(`/admin/users/${userId}/role`, { role });
  return response.data.user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
};

