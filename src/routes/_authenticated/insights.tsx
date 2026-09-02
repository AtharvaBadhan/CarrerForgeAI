import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
import { Lightbulb } from "lucide-react";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — CareerForge AI" }] }),
  component: () => <ComingSoon icon={Lightbulb} title="AI Career Insights" description="Narrative insights about your application performance." />,
});
