import Link from "next/link";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Blocks,
  FileClock,
  Languages,
  MessagesSquare,
  Palette,
  ShieldCheck,
  Sparkles,
  Webhook,
} from "lucide-react";
import { baseOptions } from "@/lib/layout.shared";
import { SITE } from "@/lib/site";

const features = [
  {
    icon: Blocks,
    title: "Visual page builder",
    text: "Drag and drop pages with Puck. Content is stored as plain JSON in Payload, so there is no proprietary format to escape later.",
    href: "/docs/guides/page-editor",
  },
  {
    icon: Sparkles,
    title: "Your own components",
    text: "Run pnpm new:component, edit one file, and the block shows up in the editor live. No restart, no reload.",
    href: "/docs/guides/custom-components",
  },
  {
    icon: Palette,
    title: "Themeable by design",
    text: "Every block reads --olgax-* CSS variables. Retheme a whole site, one page, or a single block from the editor.",
    href: "/docs/guides/theming",
  },
  {
    icon: FileClock,
    title: "Drafts and publishing",
    text: "Autosaved drafts never touch the live page. Publish when you are ready, and reopen the editor right where you left off.",
    href: "/docs/guides/drafts-and-publishing",
  },
  {
    icon: Languages,
    title: "Localization",
    text: "Locale-prefixed routes with per-language content and automatic fallback. Switch it off and the site serves one language at plain URLs.",
    href: "/docs/guides/localization",
  },
  {
    icon: BarChart3,
    title: "Built-in analytics",
    text: "A privacy-friendly page-view counter with no cookies and no setup, plus an optional self-hosted Umami integration.",
    href: "/docs/guides/analytics",
  },
  {
    icon: Activity,
    title: "Personalization",
    text: "Show a block to new visitors or returning visitors with one field and a first-party, no-PII cookie.",
    href: "/docs/guides/personalization",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    text: "Get notified when pages are published or deleted. Every request is HMAC-SHA256 signed so you can verify it.",
    href: "/docs/guides/webhooks",
  },
  {
    icon: ShieldCheck,
    title: "Secure and self-hosted",
    text: "Explicit access control on every collection, SQLite for local work, Postgres for production, and real migrations.",
    href: "/docs/deployment/production",
  },
];

const steps = [
  { title: "Scaffold", code: "npx create-olgax-site my-site", text: "Installs, creates .env and seeds a homepage." },
  { title: "Build", code: "pnpm dev", text: "Open the page builder and start editing." },
  { title: "Extend", code: "pnpm new:component PromoBanner", text: "Add your own blocks in minutes." },
];

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto w-full max-w-6xl px-4 pb-24">
        <section className="flex flex-col items-center gap-6 py-20 text-center">
          <a
            href={SITE.discord}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-4 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            <MessagesSquare className="size-4" />
            Join the community on Discord
            <ArrowRight className="size-3" />
          </a>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Page building for Payload CMS and Next.js, on your own terms
          </h1>
          <p className="max-w-2xl text-lg text-fd-muted-foreground">
            Olgax DXP is an open-source, self-hostable page builder. Payload manages your content, Puck gives
            editors a drag-and-drop canvas, and Olgax ties them together into a working site in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/getting-started/quick-start"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              Read the docs
            </Link>
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              GitHub
            </a>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-fd-border bg-fd-card px-6 py-4 text-left text-sm">
            <code>{`npx create-olgax-site my-site\ncd my-site\npnpm dev`}</code>
          </pre>
        </section>

        <section className="py-12">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">Everything a content site needs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:bg-fd-accent"
              >
                <Icon className="mb-3 size-5 text-fd-primary" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-fd-muted-foreground">{text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">From zero to a live editor</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-fd-border bg-fd-card p-5">
                <div className="mb-2 text-sm font-medium text-fd-muted-foreground">Step {index + 1}</div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-fd-secondary px-3 py-2 text-xs">
                  <code>{step.code}</code>
                </pre>
                <p className="mt-3 text-sm text-fd-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-12 rounded-2xl border border-fd-border bg-fd-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Build it with us</h2>
          <p className="mx-auto mt-3 max-w-xl text-fd-muted-foreground">
            Olgax DXP is in beta and shaped by the people using it. Ask questions, share what you are building, and
            help decide what comes next.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessagesSquare className="size-4" />
              Join our Discord
            </a>
            <a
              href={`${SITE.github}/issues`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              Report an issue
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-fd-border py-8 text-center text-sm text-fd-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href={SITE.url} className="hover:text-fd-foreground">
            dxp.olgax.com
          </a>
          <a href={SITE.discord} target="_blank" rel="noreferrer" className="hover:text-fd-foreground">
            Discord
          </a>
          <a href={SITE.github} target="_blank" rel="noreferrer" className="hover:text-fd-foreground">
            GitHub
          </a>
          <a href={SITE.npm} target="_blank" rel="noreferrer" className="hover:text-fd-foreground">
            npm
          </a>
        </div>
        <p className="mt-3">Olgax DXP is open source under the MIT license.</p>
      </footer>
    </HomeLayout>
  );
}
