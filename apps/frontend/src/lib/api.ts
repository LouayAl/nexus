// frontend/src/lib/api.ts
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ??
  (isProd ? "https://recrutement.ifmia.ma/api" : "http://localhost:3001/api");

export const api = axios.create({
  baseURL,
  timeout: 10_000,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? "";
    const isAuthRoute =
      url.includes("/auth/me") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout");
    if (err.response?.status === 401 && !isAuthRoute) {
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post<{ user: User }>("/auth/login", { email, password }),
  register: (data: RegisterPayload) =>
    api.post<{ user: User }>("/auth/register", data),
  logout: () => api.post<{ message: string }>("/auth/logout"),
  me: () => api.get<UserFull>("/auth/me"),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/auth/change-password", data),
  sendCredentials: (data: { email: string; password: string; nom: string; role: string }) =>
    api.post("/auth/admin/send-credentials", data),
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
  apply:           (offreId: number, lettre?: string) =>
    api.post<Candidature>("/candidatures", { offreId, lettre }),

  getMy:           () => api.get<Candidature[]>("/candidatures/mes-candidatures"),

  getByOffre:      (offreId: number) =>
    api.get<Candidature[]>(`/candidatures/offre/${offreId}`),

  getByEntreprise: () =>
    api.get<Candidature[]>("/candidatures/entreprise"),

  // ✅ ADD THIS
  getOne: (id: number) =>
    api.get<Candidature>(`/candidatures/${id}`),

  updateStatut: (id: number, statut: string) =>
    api.patch<Candidature>(`/candidatures/${id}/statut`, { statut }),

  withdraw: (id: number) =>
    api.delete(`/candidatures/${id}`),
};

// ── CANDIDATS ─────────────────────────────────────────────────────────────────
export const candidatsApi = {
  getProfile:    () => api.get<CandidatProfile>("/candidats/profile"),
  updateProfile: (data: Partial<CandidatProfileUpdate>) =>
    api.patch<CandidatProfile>("/candidats/profile", data),

  // Skills — dedicated endpoint
  addSkill: (data: { nom: string; niveau: number }) =>
    api.post("/candidats/competences", data),
  deleteSkill: (competenceId: number) =>
    api.delete(`/candidats/competences/${competenceId}`),

  // CV
  uploadCv: (file: File) => {
    const form = new FormData();
    form.append("cv", file);
    return api.post<{ cvUrl: string }>("/candidats/cv", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post("/candidats/avatar", form); // no headers override
  },

  // Experiences
  addExperience:    (data: ExperienceDto)              => api.post<Experience>("/candidats/experiences", data),
  updateExperience: (id: number, data: Partial<ExperienceDto>) => api.patch<Experience>(`/candidats/experiences/${id}`, data),
  deleteExperience: (id: number)                       => api.delete(`/candidats/experiences/${id}`),

  // Formations
  addFormation:    (data: FormationDto)                => api.post<Formation>("/candidats/formations", data),
  updateFormation: (id: number, data: Partial<FormationDto>) => api.patch<Formation>(`/candidats/formations/${id}`, data),
  deleteFormation: (id: number)                        => api.delete(`/candidats/formations/${id}`),

  // Langues
  addLangue:    (data: LangueDto)                      => api.post<Langue>("/candidats/langues", data),
  updateLangue: (id: number, data: Partial<LangueDto>) => api.patch<Langue>(`/candidats/langues/${id}`, data),
  deleteLangue: (id: number)                           => api.delete(`/candidats/langues/${id}`),
};

// ── ENTREPRISES ───────────────────────────────────────────────────────────────
export const entreprisesApi = {
  getAll:        () => api.get<EntreprisePublic[]>("/entreprises"),
  getProfile:    () => api.get<EntrepriseProfile>("/entreprises/profile"),
  updateProfile: (data: Partial<EntrepriseProfile>) =>
    api.patch<EntrepriseProfile>("/entreprises/profile", data),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export interface AdminCreateOffreDto extends CreateOffreDto {
  entrepriseId: number;
}

export interface EntrepriseAdmin {
  id:            number;
  utilisateurId: number;
  nom:           string;
  secteur?:      string;
  localisation?: string;
  logoUrl?:      string;
  description?:  string;
  siteWeb?:      string;
  utilisateur:   { email: string; createdAt: string };
  offres:        { id: number; titre: string; statut: string; _count: { candidatures: number } }[];
  _count:        { offres: number };
}

export const adminApi = {
  getPending:          ()                          => api.get<Offre[]>("/offres/admin/pending"),
  approveOffre:        (id: number)                => api.patch(`/offres/${id}/statut`, { statut: "OUVERTE" }),
  rejectOffre:         (id: number)                => api.patch(`/offres/${id}/statut`, { statut: "FERMEE" }),
  createForEntreprise: (data: AdminCreateOffreDto) => api.post<Offre>("/offres/admin/create", data),
  getAllEntreprises:   ()                          => api.get<EntrepriseAdmin[]>("/entreprises/admin/all"),
  /** GET /candidats/admin/all */
  getAllCandidats: () =>
    api.get<CandidatAdmin[]>("/candidats/admin/all"),
 
  /** GET /candidats/admin/:id  (full profile + candidatures) */
  getCandidatById: (id: number) =>
    api.get<CandidatAdmin>(`/candidats/admin/${id}`),

  createCandidat:   (data: { email: string; password: string; prenom: string; nom: string }) =>
    api.post("/auth/admin/create-candidat", { ...data, role: "CANDIDAT" }),
  createEntreprise: (data: { email: string; password: string; nomEntreprise: string }) =>
    api.post("/auth/admin/create-entreprise", { ...data, role: "ENTREPRISE" }),

};

export interface CandidatAdmin {
  id:            number;
  utilisateurId: number;
  prenom:        string;
  nom:           string;
  titre?:        string;
  bio?:          string;
  telephone?:    string;
  localisation?: string;
  cvUrl?:        string;
  avatarUrl?:    string | null;
  createdAt:     string;
  updatedAt:     string;
  utilisateur?:  { email: string; createdAt: string };
  competences?:  { competenceId: number; niveau: number; competence: { id: number; nom: string } }[];
  experiences?:  Experience[];
  formations?:   Formation[];
  langues?:      Langue[];
  candidatures?: Candidature[];   // populated only in the detail call
  _count?: {
    candidatures: number;
    competences:  number;
    experiences?: number;
    formations?:  number;
  };
}


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
  createdAt:   string;
  candidat?:   CandidatProfile;
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

export interface Experience {
  id:          number;
  candidatId:  number;
  poste:       string;
  entreprise:  string;
  dateDebut:   string;
  dateFin?:    string;
  actuel:      boolean;
  description?: string;
  createdAt:   string;
}

export interface Formation {
  id:         number;
  candidatId: number;
  diplome:    string;
  ecole:      string;
  annee:      string;
  createdAt:  string;
}

export interface Langue {
  id:         number;
  candidatId: number;
  nom:        string;
  niveau:     string;
  createdAt:  string;
}

export interface ExperienceDto {
  poste:        string;
  entreprise:   string;
  dateDebut:    string;
  dateFin?:     string;
  actuel?:      boolean;
  description?: string;
}

export interface FormationDto {
  diplome: string;
  ecole:   string;
  annee:   string;
}

export interface LangueDto {
  nom:    string;
  niveau: string;
}

export interface CandidatProfile {
  id:            number;
  utilisateurId: number;
  prenom:        string;
  nom:           string;
  telephone?:    string;
  titre?:        string;
  bio?:          string;
  localisation?: string;
  cvUrl?:        string;
  competences?:  { competenceId: number; niveau: number; competence: { id: number; nom: string } }[];
  experiences?:  Experience[];
  formations?:   Formation[];
  langues?:      Langue[];
  utilisateur?:  { email: string; createdAt: string };
  avatarUrl?: string | null;
}

export interface CandidatProfileUpdate {
  prenom?:        string;
  nom?:           string;
  telephone?:     string;
  titre?:         string;
  bio?:           string;
  localisation?:  string;
  competences?:   { nom: string; niveau: number }[];
}

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
  page?:              number;
  limit?:             number;
  keyword?:           string;
  localisation?:      string;
  type_contrat?:      string;
  niveau_experience?: string;
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

export interface EntrepriseProfile {
  id:            number;
  utilisateurId: number;
  nom:           string;
  description?:  string;
  secteur?:      string;
  siteWeb?:      string;
  localisation?: string;
  logoUrl?:      string;
}

export interface EntreprisePublic {
  id:            number;
  nom:           string;
  secteur?:      string;
  localisation?: string;
  logoUrl?:      string;
  _count:        { offres: number };
}

export interface Notification {
  id:            number;
  utilisateurId: number;
  titre:         string;
  message:       string;
  lu:            boolean;
  createdAt:     string;
}
