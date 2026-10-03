import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { MessagesSquare, Package } from "lucide-react";
import { SITE } from "@/lib/site";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid size-6 place-items-center rounded-md bg-fd-primary text-xs font-bold text-fd-primary-foreground">
            O
          </span>
          {SITE.name}
        </span>
      ),
      url: "/",
    },
    githubUrl: SITE.github,
    links: [
      { text: "Documentation", url: "/docs", active: "nested-url" },
      { text: "Quick start", url: "/docs/getting-started/quick-start" },
      {
        type: "icon",
        text: "Discord",
        label: "Join our Discord",
        icon: <MessagesSquare />,
        url: SITE.discord,
        external: true,
      },
      {
        type: "icon",
        text: "npm",
        label: "create-olgax-site on npm",
        icon: <Package />,
        url: SITE.npm,
        external: true,
      },
    ],
  };
}
