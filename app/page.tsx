import type { Metadata } from "next"
import Link from "next/link"
import {
  Bot,
  Braces,
  Clock,
  Globe,
  Mail,
  MousePointer,
  Play,
  ScanSearch,
  Users,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Zeus — Visual Browser Automation for Teams",
  description:
    "Build, schedule, and monitor AI-powered browser automation workflows on a visual canvas. Zeus lets your team navigate websites, extract data, send emails, and run agents without writing code.",
  openGraph: {
    title: "Zeus — Visual Browser Automation for Teams",
    description:
      "Build, schedule, and monitor AI-powered browser automation workflows on a visual canvas.",
    url: "https://www.zeuswork.me",
    siteName: "Zeus",
    type: "website",
  },
}

const features = [
  {
    icon: Workflow,
    title: "Visual Workflow Canvas",
    description:
      "Drag, drop, and connect nodes on a collaborative canvas to build browser automation workflows without writing scripts.",
  },
  {
    icon: Bot,
    title: "AI-Powered Agent Node",
    description:
      "Give natural language instructions and let the agent autonomously navigate, click, and complete multi-step tasks in a real browser.",
  },
  {
    icon: MousePointer,
    title: "Act & Observe",
    description:
      "Use AI to find elements on any page and perform precise interactions like clicks, form fills, and navigation.",
  },
  {
    icon: Braces,
    title: "Data Extraction",
    description:
      "Extract structured data from any website using natural language. Pass results between nodes or use them downstream.",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description:
      "Send automated emails with extracted data or workflow results directly from your pipeline.",
  },
  {
    icon: Clock,
    title: "Scheduled Runs",
    description:
      "Run workflows on a schedule with built-in cron presets. Automate recurring tasks without external infrastructure.",
  },
  {
    icon: Play,
    title: "Session Replay",
    description:
      "Watch recordings of every workflow run. Debug failures by replaying exactly what the browser did.",
  },
  {
    icon: Users,
    title: "Realtime Collaboration",
    description:
      "Edit workflows together on the same canvas. See teammates' cursors and changes as they happen.",
  },
]

const whyReasons = [
  {
    title: "No code required",
    description:
      "Natural language instructions drive every action. Your team builds automations by describing what they want, not writing selectors.",
  },
  {
    title: "Built for teams",
    description:
      "Shared workspaces, organization-level access control, and realtime multiplayer editing keep everyone aligned.",
  },
  {
    title: "Observable by default",
    description:
      "Every run produces logs, console output, and session replays so you can verify and debug without guesswork.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Globe className="size-5" />
            Zeus
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#why" className="transition-colors hover:text-foreground">
              Why Zeus
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b py-24 sm:py-32 lg:py-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/40 via-transparent to-transparent" />
          <div className="mx-auto max-w-6xl px-6 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <Workflow className="size-3.5" />
              Visual browser automation
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Automate the browser.
              <br />
              <span className="text-muted-foreground">Not the code.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Zeus is a visual workflow platform where teams build, schedule, and
              monitor AI-powered browser automations on a drag-and-drop canvas.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 gap-2 px-8 text-base">
                <Link href="/sign-up">
                  Start building
                  <Play className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <a href="#features">See how it works</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                <div className="size-3 rounded-full bg-red-400/80" />
                <div className="size-3 rounded-full bg-yellow-400/80" />
                <div className="size-3 rounded-full bg-green-400/80" />
                <span className="ml-3 text-xs font-medium text-muted-foreground">
                  Zeus Workflow Canvas
                </span>
              </div>
              <div className="relative flex min-h-[320px] items-center justify-center p-8 sm:min-h-[400px]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                  <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-5 py-4 shadow-sm">
                    <Globe className="size-6 text-emerald-500" />
                    <span className="text-sm font-medium">Open URL</span>
                  </div>
                  <div className="h-px w-8 bg-border sm:h-px sm:w-12" />
                  <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-5 py-4 shadow-sm">
                    <ScanSearch className="size-6 text-amber-500" />
                    <span className="text-sm font-medium">Observe</span>
                  </div>
                  <div className="h-px w-8 bg-border sm:h-px sm:w-12" />
                  <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-5 py-4 shadow-sm">
                    <MousePointer className="size-6 text-violet-500" />
                    <span className="text-sm font-medium">Act</span>
                  </div>
                  <div className="h-px w-8 bg-border sm:h-px sm:w-12" />
                  <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-5 py-4 shadow-sm">
                    <Braces className="size-6 text-cyan-500" />
                    <span className="text-sm font-medium">Extract</span>
                  </div>
                  <div className="h-px w-8 bg-border sm:h-px sm:w-12" />
                  <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-5 py-4 shadow-sm">
                    <Mail className="size-6 text-rose-500" />
                    <span className="text-sm font-medium">Send Email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to automate the web
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A complete toolkit for building, running, and monitoring browser
                automation workflows.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 transition-colors hover:border-foreground/20"
                >
                  <div className="mb-4 inline-flex rounded-lg border bg-muted p-2.5">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="scroll-mt-20 border-b bg-muted/30 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why teams choose Zeus
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Purpose-built for reliability, collaboration, and speed.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
              {whyReasons.map((reason) => (
                <div key={reason.title} className="text-center sm:text-left">
                  <h3 className="text-base font-semibold">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to automate your workflows?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Create an account and start building browser automations in minutes.
              No credit card required.
            </p>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" className="h-12 gap-2 px-8 text-base">
                <Link href="/sign-up">
                  Get started free
                  <Play className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="size-4" />
            Zeus
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>www.zeuswork.me</span>
            <a
              href="mailto:hello@zeuswork.me"
              className="transition-colors hover:text-foreground"
            >
              hello@zeuswork.me
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zeus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
