export const CANDIDATE_STATUSES = ['Pending', 'Reviewed', 'Hired'] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export type Candidate = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: CandidateStatus;
  resumeUrl?: string;
  resumeFileName?: string;
  referredBy?: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  } | string;
  createdAt: string;
  updatedAt: string;
};

export type CandidateFilterState = {
  status?: CandidateStatus | '';
  jobTitle?: string;
  q?: string;
};

export type CandidateFormPayload = {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  resume?: File | null;
};

export type CandidateMetrics = {
  total: number;
  byStatus: Record<CandidateStatus, number>;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
};

export type Profile = {
  _id: string;
  user: string;
  headline?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileUpdatePayload = {
  headline?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  bio?: string;
};

export type AdminUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
};

export type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
  totalCandidates: number;
  candidatesByStatus: Record<string, number>;
  topReferrers: Array<{
    _id: string;
    name: string;
    email: string;
    count: number;
  }>;
  recentCandidates: Candidate[];
};

