import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — CareerForge AI" }] }),
  component: () => <ComingSoon icon={SettingsIcon} title="Settings" description="Profile, default resume, target roles, AI model and more." />,
});
