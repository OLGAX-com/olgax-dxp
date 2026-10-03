import { ExternalLink, Globe, MessagesSquare } from "lucide-react";
import { SITE } from "@/lib/site";

const links = [
  { label: "Join our Discord", href: SITE.discord, icon: MessagesSquare },
  { label: "dxp.olgax.com", href: SITE.url, icon: Globe },
];

// Shown at the bottom of every docs sidebar.
export function SidebarCommunity() {
  return (
    <div className="flex flex-col gap-1 border-t border-fd-border pt-3 text-sm">
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <Icon className="size-4" />
          {label}
          <ExternalLink className="ml-auto size-3 opacity-60" />
        </a>
      ))}
    </div>
  );
}

// Shown under the content of every docs page.
export function PageCommunity({ editUrl }: { editUrl?: string }) {
  return (
    <div className="mt-12 rounded-xl border border-fd-border bg-fd-card p-5 text-sm text-fd-card-foreground">
      <p className="font-medium">Questions, ideas or something not working?</p>
      <p className="mt-1 text-fd-muted-foreground">
        Ask in our{" "}
        <a className="font-medium text-fd-primary underline" href={SITE.discord} target="_blank" rel="noreferrer">
          official Discord
        </a>
        , open an issue on{" "}
        <a className="font-medium text-fd-primary underline" href={`${SITE.github}/issues`} target="_blank" rel="noreferrer">
          GitHub
        </a>
        {editUrl ? (
          <>
            , or{" "}
            <a className="font-medium text-fd-primary underline" href={editUrl} target="_blank" rel="noreferrer">
              edit this page
            </a>
          </>
        ) : null}
        .
      </p>
    </div>
  );
}
