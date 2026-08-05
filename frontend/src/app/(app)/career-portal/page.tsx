"use client";

import { useEffect, useState } from "react";
import { Briefcase, Building2, Check, ExternalLink, Eye, Globe, Image as ImageIcon, Palette, Send, Share2, Sparkles } from "lucide-react";

import { PageHero } from "@/components/ui/PageHero";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { StatCard } from "@/components/ui/StatCard";
import { useApi } from "@/lib/swr";
import type { Job } from "@/lib/types";

export default function CareerPortalPage() {
  const { data, isLoading: loading } = useApi<Job[]>("/jobs");
  const jobs = data || [];
  const [companyName, setCompanyName] = useState("Acme Technologies");
  const [tagline, setTagline] = useState("Building the future of artificial intelligence & cloud infrastructure");
  const [brandColor, setBrandColor] = useState("#2a7553");
  const [logoUrl, setLogoUrl] = useState("/images/career-portal/hero.png");
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"desktop" | "branding">("branding");

  const publishedCount = jobs.filter((j) => j.status === "active" || j.status === "Published" || !j.status).length;

  const handleShare = () => {
    navigator.clipboard.writeText("https://air-recruit.com/careers/acme");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bgSvgPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a7553' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen" style={{ backgroundImage: bgSvgPattern }}>
      <PageHero
        title="Career Portal"
        subtitle="Your company's public-facing talent gateway — showcase opportunities and attract top talent"
        image="/images/career-portal/hero.png"
        badge="Talent Gateway"
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={handleShare} className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-md">
              {copied ? <Check className="h-4 w-4 mr-1.5 text-emerald-300" /> : <Share2 className="h-4 w-4 mr-1.5" />}
              {copied ? "Link Copied!" : "Copy Portal Link"}
            </Button>
            <a href="/careers" target="_blank" rel="noreferrer">
              <Button className="bg-white text-brand-700 hover:bg-white/90 font-semibold shadow-sm">
                <ExternalLink className="h-4 w-4 mr-1.5" /> View Public Portal
              </Button>
            </a>
          </div>
        }
      />

      {/* Top Portal Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="animate-fade-slide-up stagger-1">
          <StatCard label="Monthly Page Views" value="14.2k" icon={Eye} accent="#2a7553" spark={[8, 10, 12, 14, 15, 18, 22]} />
        </div>
        <div className="animate-fade-slide-up stagger-2">
          <StatCard label="Total Applications" value="412" icon={Send} accent="#16a34a" spark={[2, 4, 6, 8, 10, 12, 15]} />
        </div>
        <div className="animate-fade-slide-up stagger-3">
          <StatCard label="Employee Referrals" value="68" icon={Share2} accent="#d97706" spark={[1, 2, 2, 3, 4, 5, 7]} />
        </div>
        <div className="animate-fade-slide-up stagger-4">
          <StatCard label="Published Jobs" value={String(publishedCount || jobs.length)} icon={Globe} accent="#8b5cf6" spark={[3, 3, 4, 5, 5, 6, 8]} />
        </div>
      </div>

      {/* Portal Configuration and Live Preview Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Customization Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 shadow-xs animate-fade-slide-up stagger-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-line/60">
              <Palette className="h-5 w-5 text-brand-600" />
              <h3 className="font-display text-base font-bold text-ink-900">Portal Branding &amp; Customization</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label>Hero Tagline / Mission Statement</Label>
                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-line p-3 text-sm focus:border-brand-500 focus:outline-none bg-white"
                />
              </div>
              <div>
                <Label>Primary Brand Accent Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-1"
                  />
                  <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 font-mono text-xs rounded-xl" />
                </div>
              </div>
              <div>
                <Label>Company Logo / Banner Image</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 border border-line flex items-center justify-center overflow-hidden shrink-0">
                    <img src={logoUrl} alt="Logo" className="max-h-8 w-auto object-contain" />
                  </div>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="h-10 text-xs rounded-xl flex-1" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Live Interactive Preview */}
        <div className="lg:col-span-7">
          <Card className="p-0 overflow-hidden shadow-md animate-fade-slide-up stagger-6">
            {/* Header bar of mock portal browser window */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-line/80">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-ink-500 truncate">https://air-recruit.com/careers/{companyName.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
              <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">Live Preview</span>
            </div>

            {/* Simulated Career Portal Page Render */}
            <div className="p-6 space-y-6 bg-slate-50/50 min-h-[420px]">
              {/* Header Hero Banner inside preview */}
              <div className="rounded-2xl p-6 text-white shadow-md relative overflow-hidden" style={{ backgroundColor: brandColor }}>
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-white/80" />
                      <span className="font-display font-bold text-lg">{companyName}</span>
                    </div>
                    <p className="text-sm text-white/90 max-w-md font-body leading-relaxed">{tagline}</p>
                  </div>
                  <div className="hidden sm:block p-2 bg-white/10 backdrop-blur-md rounded-xl">
                    <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                  </div>
                </div>
              </div>

              {/* Published Jobs Grid inside preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-bold text-ink-900 text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-brand-600" /> Open Positions ({publishedCount || jobs.length})
                  </h4>
                  <span className="text-xs text-ink-400">Apply directly online</span>
                </div>

                {loading ? (
                  <SkeletonTable rows={3} cols={3} />
                ) : jobs.length === 0 ? (
                  <EmptyState
                    title="No Jobs Published Yet"
                    description="Create active job positions to publish them on your career portal and start receiving applications."
                  />
                ) : (
                  <div className="space-y-2.5">
                    {jobs.slice(0, 4).map((j) => (
                      <div key={j.id} className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-white shadow-2xs hover:border-brand-300 transition-colors">
                        <div>
                          <p className="font-semibold text-ink-900 text-sm">{j.title}</p>
                          <p className="text-xs text-ink-500">{j.department || "Engineering"} • {j.location || "Remote"}</p>
                        </div>
                        <Button size="sm" style={{ backgroundColor: brandColor }} className="text-white hover:opacity-90">
                          Apply Now
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

