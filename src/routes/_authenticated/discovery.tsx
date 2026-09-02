import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
import { Compass } from "lucide-react";

export const Route = createFileRoute("/_authenticated/discovery")({
  head: () => ({ meta: [{ title: "Discovery — CareerForge AI" }] }),
  component: () => <ComingSoon icon={Compass} title="Job Discovery" description="Saved, discovered, and applied jobs with rich filters." />,
});
