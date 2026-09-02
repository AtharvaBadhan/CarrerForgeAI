import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callOpenAI, callOpenAIStructured } from "./openai.server";

// ============ JD ANALYZER ============
const analyzerParams = {
  type: "object",
  properties: {
    role_title: { type: "string" },
    company: { type: "string" },
    location: { type: "string" },
    category: {
      type: "string",
      enum: ["data_analyst", "data_science", "business_analyst", "consulting", "cloud", "frontend", "general"],
    },
    required_skills: { type: "array", items: { type: "string" } },
    preferred_skills: { type: "array", items: { type: "string" } },
    ats_keywords: { type: "array", items: { type: "string" } },
    tools_technologies: { type: "array", items: { type: "string" } },
    soft_skills: { type: "array", items: { type: "string" } },
    responsibilities: { type: "array", items: { type: "string" } },
    experience_required: { type: "string" },
    ats_difficulty: { type: "integer", minimum: 1, maximum: 5 },
    competition_level: { type: "string", enum: ["low", "medium", "high", "very_high"] },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
  },
  required: [
    "role_title", "category", "required_skills", "preferred_skills", "ats_keywords",
    "tools_technologies", "soft_skills", "responsibilities", "experience_required",
    "ats_difficulty", "competition_level", "confidence", "summary",
  ],
  additionalProperties: false,
};

export const analyzeJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobText: string; sourceUrl?: string; companyHint?: string; save?: boolean }) =>
    z.object({
      jobText: z.string().trim().min(40).max(40000),
      sourceUrl: z.string().url().optional().or(z.literal("")),
      companyHint: z.string().max(200).optional(),
      save: z.boolean().optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const analysis = await callOpenAIStructured<any>({
      toolName: "extract_job_analysis",
      description: "Extract structured information from a job description.",
      parameters: analyzerParams,
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS analyst and recruiter. Extract clean, deduplicated, recruiter-grade structured data from job descriptions. Pick keywords that real ATS systems would weight highly. Categories: data_analyst, data_science, business_analyst, consulting, cloud, frontend, general.",
        },
        {
          role: "user",
          content: `${data.companyHint ? `Company hint: ${data.companyHint}\n\n` : ""}Job description:\n\n${data.jobText}`,
        },
      ],
    });

    let jobId: string | null = null;
    if (data.save) {
      const { data: row, error } = await context.supabase
        .from("jobs")
        .insert({
          user_id: context.userId,
          title: analysis.role_title || "Untitled role",
          company: analysis.company || null,
          location: analysis.location || null,
          source_url: data.sourceUrl || null,
          raw_text: data.jobText,
          category: analysis.category,
          analysis,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      jobId = row.id;
    }

    return { analysis, jobId };
  });

// ============ ATS MATCH ============
const matchParams = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    strong_matches: { type: "array", items: { type: "string" } },
    missing_keywords: { type: "array", items: { type: "string" } },
    weak_areas: { type: "array", items: { type: "string" } },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          impact: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["title", "detail", "impact"],
        additionalProperties: false,
      },
    },
    summary: { type: "string" },
  },
  required: ["score", "strong_matches", "missing_keywords", "weak_areas", "suggestions", "summary"],
  additionalProperties: false,
};

export const runMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string; resumeId: string }) =>
    z.object({ jobId: z.string().uuid(), resumeId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: job }, { data: resume }] = await Promise.all([
      context.supabase.from("jobs").select("*").eq("id", data.jobId).single(),
      context.supabase.from("resumes").select("*").eq("id", data.resumeId).single(),
    ]);
    if (!job || !resume) throw new Error("Job or resume not found");

    const result = await callOpenAIStructured<any>({
      toolName: "ats_match",
      description: "Compare a resume against a job description and return ATS scoring.",
      parameters: matchParams,
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS scoring engine. Compute a realistic ATS match score (0-100) using keyword overlap, skill alignment, seniority, tools, and quantified impact. Be strict but fair.",
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${job.raw_text}\n\nJOB ANALYSIS (already extracted):\n${JSON.stringify(job.analysis)}\n\nRESUME:\n${resume.content_text}`,
        },
      ],
    });

    const { data: report, error } = await context.supabase
      .from("match_reports")
      .insert({
        user_id: context.userId,
        job_id: data.jobId,
        resume_id: data.resumeId,
        score: result.score,
        strong_matches: result.strong_matches,
        missing_keywords: result.missing_keywords,
        weak_areas: result.weak_areas,
        suggestions: result,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { report, raw: result };
  });

// ============ TAILOR RESUME ============
const tailorParams = {
  type: "object",
  properties: {
    professional_summary: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    experience_bullets: { type: "array", items: { type: "string" } },
    project_recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, why: { type: "string" } },
        required: ["title", "why"],
        additionalProperties: false,
      },
    },
    keywords_added: { type: "array", items: { type: "string" } },
  },
  required: ["professional_summary", "skills", "experience_bullets", "project_recommendations", "keywords_added"],
  additionalProperties: false,
};

export const tailorResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string; resumeId: string }) =>
    z.object({ jobId: z.string().uuid(), resumeId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: job }, { data: resume }] = await Promise.all([
      context.supabase.from("jobs").select("*").eq("id", data.jobId).single(),
      context.supabase.from("resumes").select("*").eq("id", data.resumeId).single(),
    ]);
    if (!job || !resume) throw new Error("Job or resume not found");

    return await callOpenAIStructured<any>({
      toolName: "tailor_resume",
      description: "Generate a tailored resume content set aligned to the job.",
      parameters: tailorParams,
      messages: [
        {
          role: "system",
          content:
            "You rewrite resumes to be ATS-optimised and recruiter-grade. Use strong action verbs, quantify impact (%, $, time saved, scale), and weave in the job's exact keywords naturally. Never invent experience.",
        },
        {
          role: "user",
          content: `JOB:\n${job.raw_text}\n\nRESUME:\n${resume.content_text}\n\nReturn 3-5 rewritten experience bullets, a tailored summary, a tailored skills line, and project recommendations.`,
        },
      ],
    });
  });

// ============ COVER LETTER ============
export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobId: string; resumeId: string; tone: string; length: string; save?: boolean; label?: string }) =>
    z.object({
      jobId: z.string().uuid(),
      resumeId: z.string().uuid(),
      tone: z.enum(["professional", "confident", "consulting", "data_analyst", "corporate", "startup"]),
      length: z.enum(["short", "professional", "standout"]),
      save: z.boolean().optional(),
      label: z.string().max(120).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: job }, { data: resume }] = await Promise.all([
      context.supabase.from("jobs").select("*").eq("id", data.jobId).single(),
      context.supabase.from("resumes").select("*").eq("id", data.resumeId).single(),
    ]);
    if (!job || !resume) throw new Error("Job or resume not found");

    const lengthHint =
      data.length === "short" ? "Around 130 words. Punchy."
      : data.length === "standout" ? "Around 320 words. Distinctive opener, memorable closing."
      : "Around 220 words. Balanced and professional.";

    const toneHint = ({
      professional: "Polished and balanced.",
      confident: "Direct, assertive, ownership-driven language.",
      consulting: "Hypothesis-led, structured (situation → action → impact).",
      data_analyst: "Analytical, quantified, references KPIs and stakeholders.",
      corporate: "Formal, conservative, executive-ready.",
      startup: "Energetic, builder-mindset, scrappy.",
    } as Record<string, string>)[data.tone];

    const completion = await callOpenAI({
      messages: [
        { role: "system", content: `You write recruiter-grade cover letters. ${lengthHint} Tone: ${toneHint} Use the candidate's actual experience from the resume. Use the company name if present. No placeholders like [Your Name].` },
        { role: "user", content: `JOB:\n${job.raw_text}\n\nRESUME:\n${resume.content_text}` },
      ],
      temperature: 0.7,
    });
    const content = completion?.choices?.[0]?.message?.content?.trim() ?? "";

    let saved = null;
    if (data.save && content) {
      const { data: row, error } = await context.supabase.from("cover_letters").insert({
        user_id: context.userId,
        job_id: data.jobId,
        resume_id: data.resumeId,
        label: data.label || `${job.title || "Role"} – ${data.tone}`,
        tone: data.tone as any,
        length: data.length as any,
        content,
      }).select("*").single();
      if (error) throw new Error(error.message);
      saved = row;
    }
    return { content, saved };
  });
