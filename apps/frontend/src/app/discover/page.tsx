// apps/frontend/src/app/discover/page.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { offresApi, entreprisesApi, type Offre } from "@/lib/api";
import { HeroSection }     from "./_components/HeroSection";
import { StatsBar }        from "./_components/StatsBar";
import { FeaturedSlider }  from "./_components/FeaturedSlider";
import { FiltersSection }  from "./_components/FiltersSection";
import { CompanyCarousel } from "./_components/CompanyCarousel";
import { JobDrawer } from "./_components/JobDrawer";

function Footer() {
  return (
    <footer style={{ background:"#10406B", padding:"40px 64px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #EE813D, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span className="font-display" style={{ color:"white", fontSize:16, fontWeight:900 }}>N</span>
        </div>
        <span className="font-display" style={{ fontSize:18, fontWeight:800, color:"white" }}>nexus</span>
      </div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>
        © 2026 Nexus · La plateforme de recrutement de demain
      </div>
      <div style={{ display:"flex", gap:20 }}>
        {["Confidentialité","CGU","Contact"].map(link => (
          <span key={link} style={{ fontSize:13, color:"rgba(255,255,255,0.45)", cursor:"pointer", fontWeight:500 }}>{link}</span>
        ))}
      </div>
    </footer>
  );
}

export default function DiscoverPage() {
  const [keyword,      setKeyword]      = useState("");
  const [location,     setLocation]     = useState("");
  const [activeKw,     setActiveKw]     = useState<string | null>(null);
  const [contractType, setContractType] = useState<string | null>(null);
  const [search,       setSearch]       = useState({ keyword:"", location:"" });
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasFilters = !!(search.keyword || search.location || activeKw || contractType);

  const scrollToResults = useCallback(() =>
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100), []);

  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: offresData, isLoading: loadingOffres } = useQuery({
    queryKey: ["offres", search.keyword, search.location, activeKw, contractType],
    queryFn:  () => offresApi.getAll({
      keyword:      search.keyword || activeKw || undefined,
      localisation: search.location            || undefined,
      type_contrat: contractType               || undefined,
      limit: 20,
    }).then(r => r.data),
  });

  const { data: entreprisesData } = useQuery({
    queryKey: ["entreprises"],
    queryFn:  () => entreprisesApi.getAll().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const offres      = offresData?.data  ?? [];
  const total       = offresData?.total ?? 0;
  const featured    = offres.slice(0, 5);
  const entreprises = entreprisesData   ?? [];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = () => {
    setActiveKw(null);
    setSearch({ keyword, location });
    scrollToResults();
  };

  const handleTag = (tag: string) => {
    setKeyword(tag);
    setActiveKw(null);
    setSearch({ keyword: tag, location });
    scrollToResults();
  };

  const handleApply = (offre: Offre) => setSelectedOffre(offre);


  const clearFilters = () => {
    setKeyword(""); setLocation(""); setActiveKw(null); setContractType(null);
    setSearch({ keyword:"", location:"" });
  };

  return (
    <AppShell pageTitle="Découvrir les offres" fullWidth>
      <HeroSection
        keyword={keyword} location={location} total={total}
        onKeyword={setKeyword} onLocation={setLocation}
        onSearch={handleSearch} onTag={handleTag}
      />
      <StatsBar/>
      <FeaturedSlider offres={featured} loading={loadingOffres} onApply={handleApply} selectedId={selectedOffre?.id}/>
      <FiltersSection
        resultsRef={resultsRef}
        offres={offres} total={total} loading={loadingOffres}
        activeKw={activeKw} contractType={contractType}
        hasFilters={hasFilters} search={search}
        onCategory={kw => { setActiveKw(kw); setSearch({ keyword:"", location:search.location }); }}
        onContract={setContractType}
        onClear={clearFilters}
        onApply={handleApply}
        selectedId={selectedOffre?.id}
      />
      <CompanyCarousel entreprises={entreprises}/>
      <Footer/>
      <JobDrawer offre={selectedOffre} onClose={() => setSelectedOffre(null)}/>
    </AppShell>
  );
}