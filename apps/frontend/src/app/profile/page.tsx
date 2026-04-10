"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { candidatsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";

import { type ModalType } from "./_components/types";
import { EditProfileModal }   from "./_components/EditProfileModal";
import { AddSkillModal }      from "./_components/AddSkillModal";
import { AddExperienceModal } from "./_components/AddExperienceModal";
import { AddFormationModal }  from "./_components/AddFormationModal";
import { AddLangueModal }     from "./_components/AddLangueModal";
import { IdentityCard }       from "./_components/IdentityCard";
import { ContactCard }        from "./_components/ContactCard";
import { TabsPanel }          from "./_components/TabsPanel";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useIsMobile } from "@/hooks/useBreakpoint";

type Tab = "skills" | "experience" | "formation" | "langues";

function useWindowWidth() {
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function ProfilePage() {
  const { user }  = useAuth();
  const qc        = useQueryClient();
  const fileRef   = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const [tab,          setTab]          = useState<Tab>("skills");
  const [modal,        setModal]        = useState<ModalType>(null);
  const [editingItem,  setEditingItem]  = useState<any>(null);
  const [showChangePw, setShowChangePw] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn:  () => candidatsApi.getProfile().then(r => r.data),
  });

  const uploadCv = useMutation({
    mutationFn: (file: File) => candidatsApi.uploadCv(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success("CV importé !"); },
    onError:   () => toast.error("Erreur lors de l'upload"),
  });

  if (isLoading) return (
    <AppShell pageTitle="Mon Profil">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400, gap:12 }}>
        <Loader2 size={28} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
        <span style={{ color:"#5A7A96" }}>Chargement du profil…</span>
      </div>
    </AppShell>
  );

  if (!profile) return null;

  const BioCard = profile.bio ? (
    <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>À propos</div>
      <p style={{ fontSize:13, color:"#3D5A73", lineHeight:1.7, margin:0 }}>{profile.bio}</p>
    </div>
  ) : null;

  return (
    <AppShell pageTitle="Mon Profil">

      {/* ── Modals ── */}
      {modal === "editProfile" && <EditProfileModal profile={profile} onClose={() => setModal(null)}/>}
      {modal === "addSkill"    && <AddSkillModal onClose={() => setModal(null)}/>}
      {modal === "addExp"      && <AddExperienceModal onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem}/>}
      {modal === "addForm"     && <AddFormationModal  onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem}/>}
      {modal === "addLang"     && <AddLangueModal     onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem}/>}
      {showChangePw            && <ChangePasswordModal onClose={() => setShowChangePw(false)}/>}

      {/* Hidden CV input */}
      <input
        ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadCv.mutate(f); }}
      />

      {/* Page header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Mon espace</div>
        <h1 className="font-display" style={{ fontSize: isMobile ? 24 : 32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>Mon Profil</h1>
      </div>

      {isMobile ? (
        /* ── Mobile: single column ─────────────────────────────────────── */
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          
          <IdentityCard
            profile={profile}
            uploadPending={uploadCv.isPending}
            onEdit={() => setModal("editProfile")}
            onUploadCv={() => fileRef.current?.click()}
            isMobile={true}
          />
          <ContactCard
            profile={profile}
            email={user?.email ?? "—"}
            onEdit={() => setModal("editProfile")}
            onChangePw={() => setShowChangePw(true)}
          />
          {BioCard}
          <TabsPanel
            profile={profile}
            tab={tab}
            onTabChange={setTab}
            onAddSkill={() => setModal("addSkill")}
            onAddExp={() => { setEditingItem(null); setModal("addExp"); }}
            onAddForm={() => { setEditingItem(null); setModal("addForm"); }}
            onAddLang={() => { setEditingItem(null); setModal("addLang"); }}
            onEditExp={item  => { setEditingItem(item); setModal("addExp");  }}
            onEditForm={item => { setEditingItem(item); setModal("addForm"); }}
            onEditLang={item => { setEditingItem(item); setModal("addLang"); }}
          />
        </div>
      ) : (
        /* ── Desktop: two columns ──────────────────────────────────────── */
        <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <IdentityCard
              profile={profile}
              uploadPending={uploadCv.isPending}
              onEdit={() => setModal("editProfile")}
              onUploadCv={() => fileRef.current?.click()}
              isMobile={false}
            />
            <ContactCard
              profile={profile}
              email={user?.email ?? "—"}
              onEdit={() => setModal("editProfile")}
              onChangePw={() => setShowChangePw(true)}
            />
            {BioCard}
          </div>
          <TabsPanel
            profile={profile}
            tab={tab}
            onTabChange={setTab}
            onAddSkill={() => setModal("addSkill")}
            onAddExp={() => { setEditingItem(null); setModal("addExp"); }}
            onAddForm={() => { setEditingItem(null); setModal("addForm"); }}
            onAddLang={() => { setEditingItem(null); setModal("addLang"); }}
            onEditExp={item  => { setEditingItem(item); setModal("addExp");  }}
            onEditForm={item => { setEditingItem(item); setModal("addForm"); }}
            onEditLang={item => { setEditingItem(item); setModal("addLang"); }}
          />
        </div>
      )}
    </AppShell>
  );
}