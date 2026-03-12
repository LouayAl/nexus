import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "nexus_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove(TOKEN_KEY);
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export const setToken   = (token: string) =>
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "strict" });
export const removeToken = () => Cookies.remove(TOKEN_KEY);
export const getToken    = () => Cookies.get(TOKEN_KEY);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>("/auth/login", { email, password }),
  register: (data: RegisterPayload) =>
    api.post<{ access_token: string; user: User }>("/auth/register", data),
  me: () => api.get<User>("/auth/me"),
};

// ── OFFRES ────────────────────────────────────────────────────────────────────
export const offresApi = {
  getAll:   (params?: OffresParams) => api.get<OffrePaginee>("/offres-emploi", { params }),
  getById:  (id: number)            => api.get<Offre>(`/offres-emploi/${id}`),
  create:   (data: CreateOffreDto)  => api.post<Offre>("/offres-emploi", data),
  update:   (id: number, data: Partial<CreateOffreDto>) =>
    api.patch<Offre>(`/offres-emploi/${id}`, data),
  delete:   (id: number) => api.delete(`/offres-emploi/${id}`),
};

// ── CANDIDATURES ──────────────────────────────────────────────────────────────
export const candidaturesApi = {
  apply:        (offreId: number) =>
    api.post<Candidature>("/candidatures", { offreId }),
  getMy:        () => api.get<Candidature[]>("/candidatures/me"),
  getByOffre:   (offreId: number) =>
    api.get<Candidature[]>(`/candidatures/offre/${offreId}`),
  updateStatus: (id: number, statut: string) =>
    api.patch<Candidature>(`/candidatures/${id}/statut`, { statut }),
};

// ── CANDIDATS ─────────────────────────────────────────────────────────────────
export const candidatsApi = {
  getProfile:    () => api.get<CandidatProfile>("/candidats/me"),
  updateProfile: (data: Partial<CandidatProfile>) =>
    api.patch<CandidatProfile>("/candidats/me", data),
  uploadCV: (file: File) => {
    const form = new FormData();
    form.append("cv", file);
    return api.post("/candidats/me/cv", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ── ENTREPRISES ───────────────────────────────────────────────────────────────
export const entreprisesApi = {
  getProfile:    () => api.get<EntrepriseProfile>("/entreprises/me"),
  updateProfile: (data: Partial<EntrepriseProfile>) =>
    api.patch<EntrepriseProfile>("/entreprises/me", data),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getPendingOffres: () => api.get<Offre[]>("/admin/offres/pending"),
  approveOffre:     (id: number) => api.patch(`/admin/offres/${id}/approve`),
  rejectOffre:      (id: number) => api.patch(`/admin/offres/${id}/reject`),
  getStats:         () => api.get<AdminStats>("/admin/stats"),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll:   () => api.get<Notification[]>("/notifications"),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAll:  () => api.patch("/notifications/read-all"),
};

// ── TYPES ─────────────────────────────────────────────────────────────────────
export interface User {
  id:    number;
  email: string;
  role:  "CANDIDAT" | "ENTREPRISE" | "ADMIN";
}

export interface RegisterPayload {
  email:          string;
  password:       string;
  role:           "CANDIDAT" | "ENTREPRISE";
  prenom?:        string;
  nom?:           string;
  telephone?:     string;
  nomEntreprise?: string;
  adresse?:       string;
}

export interface Offre {
  id:                number;
  titre:             string;
  description:       string;
  type_contrat:      string;
  niveau_experience: string;
  statut:            string;
  localisation?:     string;
  salaire_min?:      number;
  salaire_max?:      number;
  entreprise:        { utilisateur_id: number; nom: string };
  competences?:      { id: number; nom: string }[];
  date_publication?: string;
}

export interface OffrePaginee {
  data:  Offre[];
  total: number;
  page:  number;
  limit: number;
}

export interface OffresParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  type?:         string;
  localisation?: string;
}

export interface CreateOffreDto {
  titre:             string;
  description:       string;
  type_contrat:      string;
  niveau_experience: string;
  localisation?:     string;
  salaire_min?:      number;
  salaire_max?:      number;
  competenceIds?:    number[];
}

export interface Candidature {
  id:               number;
  candidat_id:      number;
  offre_id:         number;
  date_candidature: string;
  statut:           string;
  offre?:           Offre;
  candidat?:        CandidatProfile;
}

export interface CandidatProfile {
  utilisateur_id:       number;
  prenom:               string;
  nom:                  string;
  telephone?:           string;
  titre_professionnel?: string;
  bio?:                 string;
  localisation?:        string;
  competences?:         { id: number; nom: string; niveau: string }[];
  experiences?:         Experience[];
}

export interface Experience {
  id:         number;
  entreprise: string;
  poste:      string;
  duree:      string;
}

export interface EntrepriseProfile {
  utilisateur_id: number;
  nom:            string;
  adresse?:       string;
  description?:   string;
}

export interface AdminStats {
  totalOffres:       number;
  offresEnAttente:   number;
  totalCandidats:    number;
  totalEntreprises:  number;
  totalCandidatures: number;
}

export interface Notification {
  id:      number;
  message: string;
  date:    string;
  lue:     boolean;
}