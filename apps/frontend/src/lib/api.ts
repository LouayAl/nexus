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
    const url = err.config?.url ?? "";
    const isAuthRoute = url.includes("/auth/me") || url.includes("/auth/login") || url.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthRoute) {
      Cookies.remove(TOKEN_KEY);
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export const setToken    = (token: string) =>
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "strict" });
export const removeToken = () => Cookies.remove(TOKEN_KEY);
export const getToken    = () => Cookies.get(TOKEN_KEY);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>("/auth/login", { email, password }),
  register: (data: RegisterPayload) =>
    api.post<{ access_token: string; user: User }>("/auth/register", data),
  me: () => api.get<UserFull>("/auth/me"),
};

// ── OFFRES ────────────────────────────────────────────────────────────────────
export const offresApi = {
  getAll:       (params?: OffresParams)              => api.get<OffrePaginee>("/offres", { params }),
  getById:      (id: number)                         => api.get<Offre>(`/offres/${id}`),
  create:       (data: CreateOffreDto)               => api.post<Offre>("/offres", data),
  update:       (id: number, data: Partial<CreateOffreDto>) => api.patch<Offre>(`/offres/${id}`, data),
  delete:       (id: number)                         => api.delete(`/offres/${id}`),
  mesOffres:    ()                                   => api.get<Offre[]>("/offres/mes-offres/list"),
  updateStatut: (id: number, statut: string)         => api.patch(`/offres/${id}/statut`, { statut }),
};

// ── CANDIDATURES ──────────────────────────────────────────────────────────────
export const candidaturesApi = {
  apply:        (offreId: number, lettre?: string)   =>
    api.post<Candidature>("/candidatures", { offreId, lettre }),
  getMy:        ()                                   => api.get<Candidature[]>("/candidatures/mes-candidatures"),
  getByOffre:   (offreId: number)                    => api.get<Candidature[]>(`/candidatures/offre/${offreId}`),
  getByEntreprise: ()                                => api.get<Candidature[]>("/candidatures/entreprise"),
  updateStatut: (id: number, statut: string)         =>
    api.patch<Candidature>(`/candidatures/${id}/statut`, { statut }),
  withdraw:     (id: number)                         => api.delete(`/candidatures/${id}`),
};

// ── CANDIDATS ─────────────────────────────────────────────────────────────────
export const candidatsApi = {
  getProfile:    () => api.get<CandidatProfile>("/candidats/profile"),
  updateProfile: (data: Partial<CandidatProfile>) =>
    api.patch<CandidatProfile>("/candidats/profile", data),
};

// ── ENTREPRISES ───────────────────────────────────────────────────────────────
export const entreprisesApi = {
  getAll:        ()                                  => api.get<EntreprisePublic[]>("/entreprises"),
  getProfile:    ()                                  => api.get<EntrepriseProfile>("/entreprises/profile"),
  updateProfile: (data: Partial<EntrepriseProfile>)  =>
    api.patch<EntrepriseProfile>("/entreprises/profile", data),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getPending:   ()           => api.get<Offre[]>("/offres?statut=EN_ATTENTE"),
  approveOffre: (id: number) => api.patch(`/offres/${id}/statut`, { statut: "OUVERTE" }),
  rejectOffre:  (id: number) => api.patch(`/offres/${id}/statut`, { statut: "FERMEE" }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll:      ()           => api.get<Notification[]>("/notifications"),
  unreadCount: ()           => api.get<{ count: number }>("/notifications/unread-count"),
  markRead:    (id: number) => api.patch(`/notifications/${id}/read`),
  markAll:     ()           => api.patch("/notifications/read-all"),
};

// ── TYPES ─────────────────────────────────────────────────────────────────────
export interface User {
  id:    number;
  email: string;
  role:  "CANDIDAT" | "ENTREPRISE" | "ADMIN";
}

export interface UserFull extends User {
  createdAt:  string;
  candidat?:  CandidatProfile;
  entreprise?: EntrepriseProfile;
}

export interface RegisterPayload {
  email:          string;
  password:       string;
  role:           "CANDIDAT" | "ENTREPRISE" | "ADMIN";
  prenom?:        string;
  nom?:           string;
  nomEntreprise?: string;
}

// Matches backend response shape exactly
export interface Offre {
  id:                number;
  titre:             string;
  description:       string;
  type_contrat:      string;
  niveau_experience?: string;
  statut:            string;
  localisation?:     string;
  salaire_min?:      number;
  salaire_max?:      number;
  createdAt:         string;
  entreprise:        { id: number; nom: string; logoUrl?: string; localisation?: string };
  competences?:      { competenceId: number; competence: { id: number; nom: string } }[];
  _count?:           { candidatures: number };
}

export interface OffrePaginee {
  data:       Offre[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface OffresParams {
  page?:               number;
  limit?:              number;
  keyword?:            string;
  localisation?:       string;
  type_contrat?:       string;
  niveau_experience?:  string;
}

export interface CreateOffreDto {
  titre:              string;
  description:        string;
  type_contrat:       string;
  niveau_experience?: string;
  localisation?:      string;
  salaire_min?:       number;
  salaire_max?:       number;
  competences?:       string[];
}

export interface Candidature {
  id:         number;
  candidatId: number;
  offreId:    number;
  statut:     string;
  lettre?:    string;
  createdAt:  string;
  offre?:     Offre;
  candidat?:  CandidatProfile;
}

export interface CandidatProfile {
  id:           number;
  utilisateurId:number;
  prenom:       string;
  nom:          string;
  telephone?:   string;
  titre?:       string;
  bio?:         string;
  localisation?: string;
  cvUrl?:       string;
  competences?: { competenceId: number; niveau: number; competence: { id: number; nom: string } }[];
}

export interface EntrepriseProfile {
  id:           number;
  utilisateurId:number;
  nom:          string;
  description?: string;
  secteur?:     string;
  siteWeb?:     string;
  localisation?: string;
  logoUrl?:     string;
}

export interface EntreprisePublic {
  id:           number;
  nom:          string;
  secteur?:     string;
  localisation?: string;
  logoUrl?:     string;
  _count:       { offres: number };
}

export interface Notification {
  id:            number;
  utilisateurId: number;
  titre:         string;
  message:       string;
  lu:            boolean;
  createdAt:     string;
}