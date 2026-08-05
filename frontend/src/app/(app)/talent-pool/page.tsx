"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Bookmark, Briefcase, Calendar, CheckCircle2, Clock, Filter, Layers, Search, Sparkles, Star, UserCheck, Users } from "lucide-react";

import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkillChip } from "@/components/ui/SkillChip";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { Candidate } from "@/lib/types";

export default function TalentPoolPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [expFilter, setExpFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  useEffect(() => {
    api<Candidate[]>("/candidates?sort=score")
      .then((data) => setCandidates(data || []))
      .catch((err) => console.error("Failed to load talent pool candidates", err))
      .finally(() => setLoading(false));
  }, []);

  // Compute all unique skills across candidates
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => (c.matched_skills || c.skills || []).forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 10);
  }, [candidates]);

  // Filter candidates based on tag selections, search, experience, availability
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.job_title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedSkill && !(c.matched_skills || c.skills || []).some(s => s.toLowerCase() === selectedSkill.toLowerCase())) return false;
      
      const years = c.experience_years || 0;
      if (expFilter === "junior" && years > 2) return false;
      if (expFilter === "mid" && (years < 3 || years > 5)) return false;
      if (expFilter === "senior" && years < 6) return false;

      // Simulated availability attribute mapping
      const candidateAvailability = (c as any).availability || (c.overall_score >= 80 ? "Immediate" : c.overall_score >= 60 ? "2-Week Notice" : "1-Month Notice");
      if (availabilityFilter && candidateAvailability !== availabilityFilter) return false;

      return true;
    });
  }, [candidates, search, selectedSkill, expFilter, availabilityFilter]);

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Talent Pool"
        subtitle="Maintain a rich database of pre-vetted candidates ready for future opportunities"
        badge="Pre-Vetted Talent"
      />

      {/* Talent Pool Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="animate-fade-slide-up stagger-1">
          <StatCard label="Saved Talent Candidates" value={String(candidates.length)} icon={Bookmark} accent="#2a7553" spark={[12, 14, 18, 22, 26, 30, 35]} />
        </div>
        <div className="animate-fade-slide-up stagger-2">
          <StatCard label="Silver Medalists (80%+)" value={String(candidates.filter(c => c.overall_score >= 80).length)} icon={Award} accent="#d97706" spark={[4, 6, 8, 10, 12, 14, 16]} />
        </div>
        <div className="animate-fade-slide-up stagger-3">
          <StatCard label="AI Rediscovered Candidates" value={String(Math.ceil(candidates.length * 0.4))} icon={Sparkles} accent="#16a34a" spark={[2, 3, 5, 7, 8, 11, 14]} />
        </div>
        <div className="animate-fade-slide-up stagger-4">
          <StatCard label="Available Immediately" value={String(candidates.filter(c => c.overall_score >= 80).length)} icon={UserCheck} accent="#8b5cf6" spark={[5, 5, 6, 7, 9, 10, 12]} />
        </div>
      </div>

      {/* Filter Options & Skill Tag Chips Bar */}
      <Card className="p-4 border border-line/80 bg-white/90 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search talent by candidate name or past role…"
              className="h-10 w-full rounded-xl border border-line bg-white/90 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500"
            />
          </div>

          <Select value={expFilter} onChange={(e) => setExpFilter(e.target.value)} className="h-10 w-44 rounded-xl">
            <option value="">All Experience</option>
            <option value="junior">Junior (0 - 2 yrs)</option>
            <option value="mid">Mid-Level (3 - 5 yrs)</option>
            <option value="senior">Senior (6+ yrs)</option>
          </Select>

          <Select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="h-10 w-48 rounded-xl">
            <option value="">All Availability</option>
            <option value="Immediate">Immediate Availability</option>
            <option value="2-Week Notice">2-Week Notice</option>
            <option value="1-Month Notice">1-Month Notice</option>
          </Select>
        </div>

        {/* Skill Tag Filter Chips */}
        {allSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/60">
            <span className="text-xs font-semibold text-ink-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-brand-600" /> Skill Filter:
            </span>
            <button
              onClick={() => setSelectedSkill("")}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                !selectedSkill ? "bg-brand-600 text-white shadow-xs" : "bg-slate-100 text-ink-600 hover:bg-slate-200"
              }`}
            >
              All Skills
            </button>
            {allSkills.map((sk) => (
              <button
                key={sk}
                onClick={() => setSelectedSkill(sk)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  selectedSkill === sk ? "bg-brand-600 text-white shadow-xs" : "bg-slate-100 text-ink-600 hover:bg-slate-200"
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Grid of Candidate Cards in Talent Pool */}
      {loading ? (
        <SkeletonTable rows={4} cols={4} showAvatar />
      ) : filtered.length === 0 ? (
        <Card className="p-8 border border-line/80 bg-white/90">
          <EmptyState
            title="No Candidates Found in Talent Pool"
            description="No pre-vetted candidates matched your selected skill, experience level, or availability filters. Try clearing your search parameters."
            action={
              <Button onClick={() => { setSearch(""); setSelectedSkill(""); setExpFilter(""); setAvailabilityFilter(""); }}>
                Reset All Filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, idx) => {
            const staggerClass = `stagger-${(idx % 6) + 1}`;
            const skillsList = c.matched_skills || c.skills || [];
            const expYears = c.experience_years || 2;
            const expPct = Math.min(100, Math.round((expYears / 10) * 100));

            const availability = (c as any).availability || (c.overall_score >= 80 ? "Immediate" : c.overall_score >= 60 ? "2-Week Notice" : "1-Month Notice");
            const availBadgeClass = 
              availability === "Immediate" 
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : availability === "2-Week Notice"
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-blue-100 text-blue-800 border-blue-300";

            return (
              <Card
                key={c.id}
                className={`p-5 border border-line/80 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between animate-fade-slide-up ${staggerClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size="md" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-ink-900 text-base truncate">{c.name}</h4>
                        <p className="text-xs text-ink-500 truncate">{c.job_title || "Software Engineer"}</p>
                      </div>
                    </div>
                    <ScoreRing score={c.overall_score} size={46} stroke={4} showLabel={false} />
                  </div>

                  {/* Skill Chips */}
                  <div className="my-3">
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1.5">Core Competencies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.slice(0, 4).map((s) => (
                        <SkillChip key={s} label={s} matched />
                      ))}
                      {skillsList.length > 4 && (
                        <span className="inline-flex items-center text-xs font-medium text-ink-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          +{skillsList.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Experience Bar Visualization */}
                  <div className="my-3 space-y-1">
                    <div className="flex justify-between text-xs font-medium text-ink-600">
                      <span>Experience Level</span>
                      <strong className="text-ink-800">{expYears} Years ({expYears >= 6 ? "Senior" : expYears >= 3 ? "Mid-Level" : "Junior"})</strong>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${expPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${availBadgeClass}`}>
                    <Clock className="h-3 w-3" /> {availability}
                  </span>
                  <a href="/candidates" className="text-xs font-bold text-brand-700 hover:underline">
                    View Candidate Details &rarr;
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

