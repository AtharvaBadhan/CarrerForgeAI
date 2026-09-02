import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
import { Bot } from "lucide-react";

export const Route = createFileRoute("/_authenticated/automation")({
  head: () => ({ meta: [{ title: "Automation — CareerForge AI" }] }),
  component: () => <ComingSoon icon={Bot} title="Browser Automation" description="Playwright workflow architecture for semi-automated job application." bullets={["Workflow builder & logs", "Self-hosted Playwright worker contract", "Activity timeline"]} />,
});
