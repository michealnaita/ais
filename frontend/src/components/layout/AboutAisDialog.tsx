"use client";

/* "About AIS": what the project is and why it exists (from the proposal and project plan),
   the team that built it, its supervisor and who proposed it. */
import { Building2, Check, GraduationCap, Lightbulb, Lock, Repeat, Server } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CAPABILITIES = [
  "Check whether two documents are identical.",
  "Measure how similar one document is to many others, as a percentage.",
  "Detect plagiarism in coursework: reports, assignments and homework.",
  "Give students and instructors one web-based place to submit and review.",
];

const INNOVATIONS = [
  { icon: Lock, title: "Closed-environment detection", body: "Submissions are compared against the institution's own documents, not external databases or the internet." },
  { icon: Repeat, title: "Self-growing repository", body: "Every submission joins the local repository, so detection gets stronger as the system is used." },
  { icon: Server, title: "Lightweight and self-hosted", body: "Runs on a school's own servers and is reached over the school's network." },
];

const KEYWORDS = [
  "Plagiarism Detection", "Academic Integrity", "Document Similarity", "Embeddings", "Nearest Neighbor",
  "Cosine Similarity", "Natural Language Processing", "Web-Based Platform", "Role-Based Access Control",
  "Document Management", "Text Extraction", "Python", "Internal Repository",
];

/* Names and roles only; contact details from the project plan stay out of the app. */
const TEAM = [
  { name: "Michael Kiirya Naita", role: "Project Manager · Software Designer" },
  { name: "Saif Al Qudah", role: "Security & Performance Analyst" },
];

const initials = (name: string) => name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h3 className="text-[11px] font-semibold tracking-[.07em] text-ink-tertiary uppercase">{title}</h3>
      {children}
    </section>
  );
}

export function AboutAisDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto p-8 sm:max-w-4xl">
        <DialogHeader className="gap-3">
          {/* The full logo already reads "Academic Integrity System"; the title stays for screen readers. */}
          <img className="block h-20 w-auto self-start" src="/logo_full.png" alt="" />
          <DialogTitle className="sr-only">About AIS</DialogTitle>
          <DialogDescription>
            The Academic Integrity System: open-source, self-managed plagiarism detection for academic institutions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="why">Why AIS</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* min-h keeps the dialog from jumping in size when switching tabs */}
          <TabsContent value="overview" className="grid min-h-[460px] content-start gap-7 pt-5">
            <Section title="Our mission">
              <p className="leading-relaxed text-ink">
                Plagiarism, using or copying someone else&apos;s work, ideas or results without citing them, undermines
                the trust that learning depends on. AIS helps institutions protect that trust with a plagiarism
                detection system they run themselves, so they rely less on third-party services and keep full control
                of their data.
              </p>
            </Section>
            <Section title="What it does">
              <ul className="grid gap-1.5">
                {CAPABILITIES.map(c => (
                  <li key={c} className="flex gap-2.5 text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-fg" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="How it works">
              <p className="leading-relaxed text-ink">
                AIS keeps a local repository built from user submissions and uses it as the source for similarity
                checks. That sets it apart from commercial tools, which compare work against external databases and
                internet sources.
              </p>
            </Section>
          </TabsContent>

          <TabsContent value="why" className="grid min-h-[460px] content-start gap-7 pt-5">
            <Section title="The problem">
              <p className="leading-relaxed text-ink">
                Commercial plagiarism platforms are built for large-scale deployment and charge high ongoing
                subscription fees. Schools on small budgets in many parts of the world are often priced out. AIS
                tackles this directly: a fully functional, portable system that deploys entirely on a school&apos;s
                own infrastructure.
              </p>
            </Section>
            <Section title="What makes it different">
              <ul className="grid gap-2.5">
                {INNOVATIONS.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3 rounded-xl border border-line p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-bg text-green-fg">
                      <Icon className="size-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-ink">{title}</div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Key topics">
              <div className="flex flex-wrap gap-1.5">
                {KEYWORDS.map(k => <Badge key={k} variant="secondary">{k}</Badge>)}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="team" className="grid min-h-[460px] content-start gap-7 pt-5">
            <Section title="Built by">
              <ul className="grid gap-2 sm:grid-cols-2">
                {TEAM.map(m => (
                  <li key={m.name} className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-bg text-xs font-bold text-ink-secondary">
                      {initials(m.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink">{m.name}</div>
                      <div className="text-xs text-ink-tertiary">{m.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <section className="grid gap-3 rounded-2xl bg-green-bg p-4">
              <div className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-fg text-white">
                  <GraduationCap className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-[.07em] text-green-fg uppercase">Supervised by</div>
                  <div className="mt-0.5 font-display text-xl font-medium text-ink">Prof. Dr. Önsen Toygar</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                    Thank you for guiding this project from first idea to working system.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 border-t border-green-fg/15 pt-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-green-fg">
                  <Lightbulb className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-[.07em] text-green-fg uppercase">Project proposed by</div>
                  <div className="mt-0.5 font-display text-xl font-medium text-ink">Prof. Dr. Omar Ramadan</div>
                </div>
              </div>
            </section>

            <p className="flex items-center gap-2 text-xs text-ink-tertiary">
              <Building2 className="size-3.5" />
              Computer Engineering Department · CMPE / CMSE / BLGM 405 · Spring 2025/2026
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
