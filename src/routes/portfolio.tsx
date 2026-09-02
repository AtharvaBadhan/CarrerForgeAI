import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Cloud,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileText,
  Github,
  Layers,
  Linkedin,
  Sparkles,
  Wrench,
} from "lucide-react";
import { GradientOrbs } from "@/components/GradientOrbs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================================
// TODO — replace placeholder URLs below with real links:
//   RESUME_URL, LINKEDIN_URL, GITHUB_PROFILE
//   Per-project: project.github, project.demo
// Leave as "#" or `undefined` and the button will render as
// "Coming Soon" / "Private Repository" / "Technical Summary".
// ============================================================
const RESUME_URL = "#"; // e.g. "/resume.pdf"
const LINKEDIN_URL = "#";
const GITHUB_PROFILE = "#";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Data Analyst & Cloud-Focused Data Science Student" },
      {
        name: "description",
        content:
          "Dashboards, data workflows, cloud applications, and front-end tools that turn complex information into clear decisions.",
      },
      {
        property: "og:title",
        content: "Portfolio — Data Analyst & Cloud-Focused Data Science Student",
      },
      {
        property: "og:description",
        content:
          "Dashboards, data workflows, cloud applications, and front-end tools that turn complex information into clear decisions.",
      },
    ],
  }),
  component: PortfolioPage,
});

type ProjectLink = { label: string; href?: string };
type Project = {
  title: string;
  summary: string;
  tags: string[];
  caseStudy: string;
  github?: string;
  demo?: string;
  privateRepo?: boolean;
  comingSoonDemo?: boolean;
  technicalSummaryOnly?: boolean;
};

const projects: Project[] = [
  {
    title: "CloudEco",
    summary:
      "Built a cloud-native ML inference API using YOLO, FastAPI, Docker, Kubernetes, and Locust testing to evaluate scalability and deployment performance.",
    tags: ["FastAPI", "Docker", "Kubernetes", "YOLO", "Locust"],
    caseStudy:
      "Designed and containerised a YOLO-based inference service exposed via FastAPI, orchestrated with Kubernetes for horizontal scaling. Used Locust to benchmark throughput and latency under load. Tested against reference workloads to validate deployment behaviour and identify bottlenecks before scaling to production-style traffic.",
    comingSoonDemo: true,
  },
  {
    title: "ParkAdda",
    summary:
      "Created a React-based parking management platform designed for real-time slot availability, booking, payments, and scalable parking operations. Built for scalable management of 1000+ parking spaces.",
    tags: ["React", "TypeScript", "Node.js", "REST APIs"],
    caseStudy:
      "Full-stack parking platform covering slot discovery, booking, and payment flows. Architected with a modular React front-end and an API layer designed to support large lot inventories. Tested against multi-lot scenarios to evaluate booking concurrency and payment confirmation reliability.",
  },
  {
    title: "Decibel Tracker",
    summary:
      "Built a sound-level monitoring tool that captures, analyses, and visualises decibel readings with approximately 95% consistency against reference readings.",
    tags: ["Python", "Signal Processing", "Data Viz"],
    caseStudy:
      "Captured microphone input, applied calibration, and rendered live and historical dB charts. Tested against reference readings with approximately 95% consistency. Useful for monitoring workspace and environmental noise trends.",
    privateRepo: true,
    comingSoonDemo: true,
  },
  {
    title: "Monash ICIP",
    summary:
      "Produced a project charter, WBS, cost baseline, Agile roadmap, KPI framework, and ROI model for an 18-month digital transformation initiative.",
    tags: ["Project Management", "Agile", "KPI", "ROI"],
    caseStudy:
      "Industry-collaboration capstone delivering a complete project package: charter, WBS, cost baseline, Agile delivery roadmap, KPI framework, and ROI projection. Findings were presented to stakeholders and used as the basis for go/no-go evaluation.",
    privateRepo: true,
    comingSoonDemo: true,
  },
  {
    title: "IoT Predictive Maintenance",
    summary:
      "Analysed multi-source IoT sensor data to support predictive maintenance insights and reduce potential equipment failure risks.",
    tags: ["Python", "Pandas", "Time-Series", "EDA"],
    caseStudy:
      "Cleaned and joined multi-source IoT sensor streams, engineered features for degradation indicators, and produced exploratory visualisations to support predictive maintenance decisions. Designed to reduce potential equipment failure risk based on project evaluation.",
    comingSoonDemo: true,
  },
  {
    title: "Data Analytics & Wrangling",
    summary:
      "Cleaned, transformed, and analysed multi-format datasets using Python to generate structured insights and stakeholder-ready outputs.",
    tags: ["Python", "Pandas", "NumPy", "EDA"],
    caseStudy:
      "Collection of analytics notebooks covering ingestion of CSV/JSON/Excel sources, schema normalisation, missing-data handling, and exploratory analysis. Outputs packaged into stakeholder-ready summaries and visualisations.",
    technicalSummaryOnly: true,
    comingSoonDemo: true,
  },
  {
    title: "Smart India Hackathon",
    summary:
      "Built a centralised data platform for port-led industrialisation insights using Python, JavaScript, React, and Vercel.",
    tags: ["React", "JavaScript", "Python", "Vercel"],
    caseStudy:
      "Centralised platform aggregating port-led industrialisation indicators. Built with a React front-end deployed on Vercel and a Python data layer for ingestion and transformation. Designed to support cross-region comparison and dashboarding.",
  },
];

const skillGroups = [
  {
    icon: Database,
    title: "Core Data & Analytics",
    items: [
      "Python", "SQL", "R", "Excel", "Power BI", "Tableau",
      "Pandas", "NumPy", "Matplotlib", "Data Cleaning",
      "Exploratory Data Analysis", "KPI Reporting",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud & Engineering",
    items: ["AWS", "Azure", "Docker", "Kubernetes", "FastAPI", "REST APIs", "Git", "CI/CD", "ETL Workflows"],
  },
  {
    icon: Code2,
    title: "Frontend & Web",
    items: ["React.js", "Next.js", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Responsive Design"],
  },
  {
    icon: Briefcase,
    title: "Business & Consulting",
    items: [
      "Stakeholder Communication", "Business Analysis", "Dashboard Design",
      "Process Improvement", "Agile", "Project Management",
    ],
  },
];

const techExperience = [
  {
    role: "Software / Analytics Role",
    company: "ESDS Software Solution",
    blurb:
      "Contributed to data and engineering workflows supporting cloud infrastructure customers; involved in analysis, reporting, and process automation tasks.",
  },
  {
    role: "Technical Contributor",
    company: "Mindful Gurukul",
    blurb:
      "Built and maintained technical content and tooling supporting digital learning operations and reporting.",
  },
  {
    role: "Helpdesk / Technical Support",
    company: "Koso India",
    blurb:
      "Resolved technical issues, documented recurring problems, and supported continuous improvement of internal IT workflows.",
  },
];

const opsExperience = [
  {
    role: "Customer Service & Operations",
    company: "7-Eleven Australia",
    blurb:
      "Operations, compliance, customer service, and workflow efficiency in a high-throughput retail environment. Reliable shift execution, cash and inventory accuracy, and adherence to standard operating procedures.",
  },
];

function PortfolioPage() {
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 grid-pattern opacity-[0.35]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary glow-ring">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Portfolio</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#experience" className="hover:text-foreground transition">Experience</a>
          <a href="#projects" className="hover:text-foreground transition">Projects</a>
          <a href="#skills" className="hover:text-foreground transition">Skills</a>
        </nav>
        <Link to="/"><Button variant="ghost" size="sm">CareerForge AI →</Button></Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.18_145)] animate-pulse" />
          Available for Data Analyst, BI, Data Science & Cloud roles
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl"
        >
          Data Analyst & <span className="text-gradient">Cloud-Focused Data Science Student</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          I build dashboards, data workflows, cloud applications, and front-end tools that turn complex information into clear decisions.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href="#projects">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground glow-ring">
              View Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <a href={RESUME_URL} target={RESUME_URL === "#" ? undefined : "_blank"} rel="noreferrer">
            <Button size="lg" variant="outline" className="border-border bg-background/40">
              <Download className="mr-2 h-4 w-4" /> Download Resume
            </Button>
          </a>
          <a href={LINKEDIN_URL} target={LINKEDIN_URL === "#" ? undefined : "_blank"} rel="noreferrer">
            <Button size="lg" variant="outline" className="border-border bg-background/40">
              <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
            </Button>
          </a>
          <a href={GITHUB_PROFILE} target={GITHUB_PROFILE === "#" ? undefined : "_blank"} rel="noreferrer">
            <Button size="lg" variant="outline" className="border-border bg-background/40">
              <Github className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Experience */}
      <section id="experience" className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Experience</h2>
          <p className="mt-3 text-muted-foreground">Technical depth backed by real-world operations experience.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ExperienceCard
            icon={Wrench}
            title="Technical & Analytics Experience"
            items={techExperience}
          />
          <ExperienceCard
            icon={Layers}
            title="Customer & Operations Experience"
            items={opsExperience}
          />
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Projects</h2>
          <p className="mt-3 text-muted-foreground">Selected work across data, cloud, and front-end.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-6 hover-lift flex flex-col"
            >
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground flex-grow">{p.summary}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border bg-background/40"
                  onClick={() => setOpenProject(p)}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  {p.technicalSummaryOnly ? "Technical Summary" : "Case Study"}
                </Button>
                <ProjectLinkButton
                  label={p.privateRepo ? "Private Repository" : "GitHub"}
                  href={p.github}
                  disabled={p.privateRepo || !p.github}
                  icon={Github}
                />
                <ProjectLinkButton
                  label={p.comingSoonDemo ? "Coming Soon" : "Live Demo"}
                  href={p.demo}
                  disabled={p.comingSoonDemo || !p.demo}
                  icon={ExternalLink}
                />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Skills</h2>
          <p className="mt-3 text-muted-foreground">Grouped by where they apply.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.title} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary glow-ring">
                  <g.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{g.title}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-xs text-foreground/90">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Portfolio. All rights reserved.
      </footer>

      {/* Case study dialog */}
      <Dialog open={!!openProject} onOpenChange={(o) => !o && setOpenProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{openProject?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {openProject?.summary}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-foreground/90 leading-relaxed">
            {openProject?.caseStudy}
          </div>
          {openProject && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {openProject.tags.map((t) => (
                <span key={t} className="rounded-full border border-border bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ExperienceCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Wrench;
  title: string;
  items: { role: string; company: string; blurb: string }[];
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary glow-ring">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <ul className="mt-5 space-y-5">
        {items.map((it) => (
          <li key={it.company} className="border-l-2 border-border/60 pl-4">
            <div className="text-sm font-semibold">{it.role}</div>
            <div className="text-xs text-[oklch(0.78_0.16_220)]">{it.company}</div>
            <p className="mt-1.5 text-sm text-muted-foreground">{it.blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectLinkButton({
  label,
  href,
  disabled,
  icon: Icon,
}: {
  label: string;
  href?: string;
  disabled?: boolean;
  icon: typeof Github;
}) {
  if (disabled || !href) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="border-border bg-background/20 text-muted-foreground"
      >
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        {label}
      </Button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <Button size="sm" variant="outline" className="border-border bg-background/40">
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        {label}
      </Button>
    </a>
  );
}
