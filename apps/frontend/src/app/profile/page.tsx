// frontend/src/app/profile/page.tsx
"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { candidatsApi } from "@/lib/api";
import { AddExperienceModal } from "./_components/AddExperienceModal";
import { AddFormationModal } from "./_components/AddFormationModal";
import { AddLangueModal } from "./_components/AddLangueModal";
import { AddSkillModal } from "./_components/AddSkillModal";
import { BioCard } from "./_components/BioCard";
import { ContactCard } from "./_components/ContactCard";
import { EditProfileModal } from "./_components/EditProfileModal";
import { IdentityCard } from "./_components/IdentityCard";
import { TabsPanel } from "./_components/TabsPanel";
import { type ModalType } from "./_components/types";

type Tab = "skills" | "experience" | "formation" | "langues";

const COPY = {
  fr: { loading: "Chargement du profil...", eyebrow: "Mon espace", title: "Mon Profil" },
  en: { loading: "Loading profile...",      eyebrow: "My space",   title: "My Profile" },
} as const;

export default function ProfilePage() {
  const { user }                  = useAuth();
  const { language, setLanguage } = useAppLanguage();
  const copy                      = COPY[language];
  const qc                        = useQueryClient();
  const fileRef                   = useRef<HTMLInputElement>(null);
  const isMobile                  = useIsMobile();

  const [tab,          setTab]          = useState<Tab>("skills");
  const [modal,        setModal]        = useState<ModalType>(null);
  const [editingItem,  setEditingItem]  = useState<any>(null);
  const [showChangePw, setShowChangePw] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn:  () => candidatsApi.getProfile().then((r) => r.data),
  });

  const uploadCv = useMutation({
    mutationFn: (file: File) => candidatsApi.uploadCv(file),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["profile"] }); toast.success(language === "fr" ? "CV importé !" : "Resume uploaded!"); },
    onError:    () => toast.error(language === "fr" ? "Erreur lors de l'upload" : "Upload failed"),
  });

  if (isLoading) {
    return (
      <AppShell pageTitle={copy.title}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, gap: 12 }}>
          <Loader2 size={28} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>{copy.loading}</span>
        </div>
      </AppShell>
    );
  }

  if (!profile) return null;

  const sharedIdentity = {
    profile,
    uploadPending: uploadCv.isPending,
    onEdit:        () => setModal("editProfile"),
    onUploadCv:    () => fileRef.current?.click(),
    language,
  };

  const tabsProps = {
    profile, tab, onTabChange: setTab, language,
    onAddSkill:  () => setModal("addSkill"),
    onAddExp:    () => { setEditingItem(null); setModal("addExp"); },
    onAddForm:   () => { setEditingItem(null); setModal("addForm"); },
    onAddLang:   () => { setEditingItem(null); setModal("addLang"); },
    onEditExp:   (item: any) => { setEditingItem(item); setModal("addExp"); },
    onEditForm:  (item: any) => { setEditingItem(item); setModal("addForm"); },
    onEditLang:  (item: any) => { setEditingItem(item); setModal("addLang"); },
  };

  const contactProps = {
    profile,
    email:      user?.email ?? "—",
    onEdit:     () => setModal("editProfile"),
    onChangePw: () => setShowChangePw(true),
    language,
  };

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <IdentityCard {...sharedIdentity} isMobile={false} />
      {profile.bio && <BioCard bio={profile.bio} language={language} />}
      <ContactCard {...contactProps} />
    </div>
  );

  return (
    <AppShell pageTitle={copy.title}>
      {modal === "editProfile" && <EditProfileModal profile={profile} onClose={() => setModal(null)} language={language}/>}
      {modal === "addSkill"    && <AddSkillModal    onClose={() => setModal(null)} language={language}/>}
      {modal === "addExp"      && <AddExperienceModal onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem} language={language}/>}
      {modal === "addForm"     && <AddFormationModal  onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem} language={language}/>}
      {modal === "addLang"     && <AddLangueModal     onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem} language={language} />}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadCv.mutate(file); }}
      />

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#EE813D" }}>{copy.eyebrow}</div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
        <h1 className="font-display" style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em" }}>{copy.title}</h1>
      </div>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <IdentityCard {...sharedIdentity} isMobile />
          {profile.bio && <BioCard bio={profile.bio} language={language} />}
          <ContactCard {...contactProps} />
          <TabsPanel {...tabsProps} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
          {sidebar}
          <TabsPanel {...tabsProps} />
        </div>
      )}
    </AppShell>
  );
}