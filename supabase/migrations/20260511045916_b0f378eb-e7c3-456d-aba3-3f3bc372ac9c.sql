
-- ============ ENUMS ============
CREATE TYPE public.resume_category AS ENUM ('data_analyst','data_science','business_analyst','consulting','cloud','frontend','general');
CREATE TYPE public.application_status AS ENUM ('saved','applied','oa','interview','final_round','offer','rejected','ghosted');
CREATE TYPE public.cover_letter_tone AS ENUM ('professional','confident','consulting','data_analyst','corporate','startup');
CREATE TYPE public.cover_letter_length AS ENUM ('short','professional','standout');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  headline TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  target_roles TEXT[] DEFAULT '{}',
  target_locations TEXT[] DEFAULT '{}',
  preferred_technologies TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'AUD',
  default_resume_id UUID,
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RESUMES ============
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  category public.resume_category NOT NULL DEFAULT 'general',
  content_text TEXT NOT NULL DEFAULT '',
  file_path TEXT,
  file_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER resumes_updated_at BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_resumes_user ON public.resumes(user_id);

-- ============ JOBS ============
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  source_url TEXT,
  raw_text TEXT NOT NULL DEFAULT '',
  category public.resume_category,
  analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_jobs_user ON public.jobs(user_id);

-- ============ COVER LETTERS ============
CREATE TABLE public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  tone public.cover_letter_tone NOT NULL DEFAULT 'professional',
  length public.cover_letter_length NOT NULL DEFAULT 'professional',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own cover" ON public.cover_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own cover" ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own cover" ON public.cover_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own cover" ON public.cover_letters FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER cover_letters_updated_at BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cover_user ON public.cover_letters(user_id);

-- ============ MATCH REPORTS ============
CREATE TABLE public.match_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  missing_keywords TEXT[] DEFAULT '{}',
  strong_matches TEXT[] DEFAULT '{}',
  weak_areas TEXT[] DEFAULT '{}',
  suggestions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own match" ON public.match_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own match" ON public.match_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own match" ON public.match_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own match" ON public.match_reports FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_match_user ON public.match_reports(user_id);

-- ============ APPLICATIONS ============
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter_id UUID REFERENCES public.cover_letters(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  category public.resume_category,
  status public.application_status NOT NULL DEFAULT 'saved',
  applied_at DATE,
  follow_up_at DATE,
  salary TEXT,
  recruiter_name TEXT,
  recruiter_email TEXT,
  source_url TEXT,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own apps" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own apps" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own apps" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own apps" ON public.applications FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_apps_user ON public.applications(user_id);
CREATE INDEX idx_apps_status ON public.applications(user_id, status);

-- ============ AUTOMATION LOGS ============
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own logs" ON public.automation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own logs" ON public.automation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own logs" ON public.automation_logs FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_logs_user ON public.automation_logs(user_id);

-- ============ STORAGE BUCKET FOR RESUMES ============
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

CREATE POLICY "view own resume files" ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "upload own resume files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "update own resume files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "delete own resume files" ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
