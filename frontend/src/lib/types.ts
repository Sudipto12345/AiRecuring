export type Role = "super_admin" | "company_admin" | "hr" | "interviewer";

export type ModuleKey = "cvRanking" | "examPortal" | "interviewFace";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  company_id: string | null;
  title?: string | null;
  avatar_url?: string | null;
}

export interface SessionCompany {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  status: string;
}

export interface SessionSubscription {
  plan: string;
  modules: ModuleKey[];
  limits: Record<string, number>;
  status: string;
}

export interface Session {
  user: SessionUser;
  company: SessionCompany | null;
  subscription: SessionSubscription | null;
  credits: number;
}

export interface CreditTxn {
  id: string;
  kind: "grant" | "debit";
  credits: number;
  reason: string;
  model?: string | null;
  tokens?: number | null;
  cost_usd?: number | null;
  balance_after: number;
  created_at: string;
}

export interface CreditBalance {
  balance: number;
  lifetime_granted: number;
  lifetime_spent: number;
  transactions: CreditTxn[];
}

export interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  status: string;
  plan: string;
  modules: ModuleKey[];
  seats: number;
  credits: number;
  created_at: string;
}

export interface Exam {
  id: string;
  job_id: string;
  title: string;
  category: string;
  description: string | null;
  num_questions: number;
  duration_min: number;
  pass_score: number;
  status: string;
  sent_count: number;
  available_questions: number;
  created_at: string;
}

export interface BulkDispatchResult {
  sent: number;
  skipped: number;
  items: {
    candidate_id: string;
    name: string;
    sent_to: string | null;
    emailed: boolean;
    skipped: string | null;
  }[];
}

export interface PlanInfo {
  key: string;
  label: string;
  modules: ModuleKey[];
  limits: Record<string, number>;
}

export interface Job {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  work_mode: string;
  job_type: string;
  experience_min: number;
  experience_max: number;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  skills: string[];
  description: string | null;
  status: string;
  featured: boolean;
  deadline: string | null;
  created_at: string;
  last_activity: string;
  applications: number;
  shortlisted: number;
  interviews: number;
  hired: number;
}

export interface JobStats {
  total: number;
  active: number;
  on_hold: number;
  closed: number;
}

export interface CandidateScores {
  skill: number;
  experience: number;
  education: number;
  culture: number;
}

export interface Candidate {
  id: string;
  job_id: string;
  job_title: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  experience_years: number;
  education: string | null;
  scores: Partial<CandidateScores>;
  overall_score: number;
  ai_summary: string | null;
  strengths: string[];
  risks: string[];
  stage: string;
  status: string;
  source: string;
  scored_by: string;
  assessment_mode?: string | null;
  exam_status?: string | null;
  exam_score?: number | null;
  meeting_link?: string | null;
  has_reference_photo?: boolean;
  photo_url?: string | null;
  added_on: string;
  last_activity: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct_index: number;
  category: string | null;
  difficulty: string;
  created_at: string;
}

export interface DispatchResult {
  mode: string;
  candidate_id: string;
  stage: string;
  link: string | null;
  sent_to: string | null;
  emailed: boolean;
}

export interface FaceAnalysis {
  face_detected: boolean;
  focus_score: number;
  integrity_score: number;
  risk_level: string;
  frames_total: number;
  identity_verified: boolean | null;
  identity_match_score: number;
  identity_consistency: number;
  distinct_identities: number;
  events: { type: string; count: number; severity: string }[];
  timeline: string[];
}

export interface Interview {
  id: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string | null;
  interview_code: string;
  interview_type: string;
  mode: string;
  scheduled_at: string;
  duration_sec: number;
  status: string;
  ai_score: number | null;
  scores: Record<string, number>;
  device: string | null;
  location: string | null;
  proctoring_status: string;
  has_video: boolean;
  video_url: string | null;
  face: FaceAnalysis | null;
}

export interface InterviewStats {
  total: number;
  completed: number;
  in_progress: number;
  no_show: number;
  avg_score: number;
}

export interface MonitoringSummary {
  live_sessions: number;
  high_risk: number;
  focus_avg: number;
  integrity_avg: number;
  reports: number;
}

export interface AnalyticsSummary {
  pipeline: { label: string; count: number; pct: number }[];
  score_distribution: { label: string; count: number; color: string }[];
  top_skills: { skill: string; count: number }[];
  totals: Record<string, number>;
}

export interface CandidateStats {
  total: number;
  shortlisted: number;
  under_review: number;
  interview: number;
  hired: number;
}

export interface UploadResult {
  created: number;
  candidates: Candidate[];
}

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: Role;
  company: string | null;
  plan: string | null;
  modules: ModuleKey[];
}

export interface ServiceHealth {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

export interface SystemHealth {
  ok: boolean;
  dev_mode: boolean;
  services: ServiceHealth[];
  checked_at: string;
}

export interface AdminOverview {
  kpis: {
    companies: number;
    active_companies: number;
    users: number;
    candidates: number;
    jobs: number;
    interviews: number;
    ai_requests: number;
    ai_credits_spent: number;
    ai_tokens: number;
    active_sessions: number;
  };
  revenue: { mrr: number; arr: number; today: number; estimated: boolean };
  infra_sample: {
    cpu_pct: number;
    ram_pct: number;
    queue_depth: number;
    error_rate_pct: number;
    api_requests_24h: number;
    avg_response_ms: number;
  };
  storage: { used_gb: number; total_gb: number };
  charts: {
    revenue: { label: string; revenue: number }[];
    company_growth: { label: string; value: number }[];
    user_growth: { label: string; value: number }[];
    company_new: { label: string; value: number }[];
    ai_usage: { label: string; requests: number; credits: number }[];
  };
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  company_id: string | null;
  company_name: string | null;
  title: string | null;
  created_at: string;
}

export interface AuditRow {
  id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  company_id: string | null;
  ip: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface AdminPlan {
  id: string;
  key: string;
  label: string;
  modules: ModuleKey[];
  limits: Record<string, number | boolean>;
  price_monthly: number;
  is_custom: boolean;
  order: number;
}

export interface ImpersonateResponse {
  access_token: string;
  company_id: string;
  company_name: string;
  user_email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type CopilotAction =
  | "chat"
  | "generate_jd"
  | "summarize_resume"
  | "compare_candidates"
  | "generate_report"
  | "ask_data";

export interface CopilotResponse {
  reply: string;
  used_llm: boolean;
  tokens: number;
}

export interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  status: string;
  plan: string;
  modules: ModuleKey[];
  limits: Record<string, number | boolean>;
  credits: number;
  created_at: string;
  counts: { users: number; jobs: number; candidates: number; interviews: number };
  users: AdminUserRow[];
  recent_activity: AuditRow[];
}
