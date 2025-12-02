import { Button } from "@/components/ui/button";
import { FiArrowRight, FiDownload } from "react-icons/fi";
import { Code2, Cpu, PenTool, Rocket, Sparkles, Workflow } from "lucide-react";

import Social from "@/components/Social";
import Photo from "@/components/Photo";

const techStack = [
  "TypeScript",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "AWS",
  "System Design",
];

const highlights = [
  {
    title: "Engineering leader",
    description:
      "Guiding teams that ship resilient cloud products, with a focus on quality gates, observability, and sustainable velocity.",
    icon: <Workflow className="h-6 w-6" />,
  },
  {
    title: "Product builder",
    description:
      "Translating ambiguous requirements into production-grade experiences for fintech, medical, and large-scale e-commerce.",
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    title: "Hands-on architect",
    description:
      "From API design to deployment pipelines, I keep the stack cohesive and developer-friendly while meeting business goals.",
    icon: <Cpu className="h-6 w-6" />,
  },
];

const signalCards = [
  {
    title: "Code without the chaos",
    description:
      "I obsess over maintainable abstractions, type safety, and performance budgets so teams can move confidently.",
    icon: <Code2 className="h-6 w-6" />,
  },
  {
    title: "Content that ships",
    description:
      "I share architecture notes, postmortems, and playbooks that help teams avoid dead ends and ship faster.",
    icon: <PenTool className="h-6 w-6" />,
  },
  {
    title: "Momentum mindset",
    description:
      "Small feedback loops, thoughtful DX, and pragmatic automation keep projects on track and teams energized.",
    icon: <Sparkles className="h-6 w-6" />,
  },
];

const Home = () => {
  return (
    <section className="h-full">
      <div className="container mx-auto h-full pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 px-6 py-12 shadow-xl shadow-accent/10 backdrop-blur-xl xl:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,153,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.08),transparent_25%)]" />

          <div className="relative grid gap-12 lg:auto-rows-auto lg:grid-cols-2 lg:items-start lg:gap-14">
            {/* Intro */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-inner">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Shipping reliable products, one commit at a time
              </div>

              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-semibold leading-tight xl:text-6xl">
                  Mohamed Elshawaf <span className="text-accent">builds</span> developer-first experiences.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Software engineer with 10+ years designing systems that scale gracefully. I blend product thinking, clear
                  architecture, and mentorship to help teams deliver ambitious features with confidence.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a href="/resume.pdf">
                  <Button size="lg" className="gap-2">
                    Download CV <FiDownload className="text-xl" />
                  </Button>
                </a>
                <a href="/contact">
                  <Button variant="outline" size="lg" className="gap-2">
                    Let&apos;s build together <FiArrowRight />
                  </Button>
                </a>
                <Social
                  containerStyles="flex items-center gap-3"
                  iconStyles="h-10 w-10 rounded-full border border-border/80 bg-background/60 text-xl text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-sm font-medium text-foreground/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Portrait & signal */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background/40 to-muted/60 p-6 shadow-lg shadow-accent/20">
                <div className="grid items-center gap-8 sm:grid-cols-[auto,1fr]">
                  <div className="flex justify-center sm:justify-start">
                    <Photo />
                  </div>
                  <div className="space-y-4">
                    {signalCards.map((card) => (
                      <div key={card.title} className="flex gap-3 rounded-xl border border-border/60 bg-card/70 p-3 shadow-sm">
                        <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-accent/10 text-accent">
                          {card.icon}
                        </div>
                        <div>
                          <p className="font-semibold leading-snug">{card.title}</p>
                          <p className="text-sm text-muted-foreground">{card.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 shadow-md transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-accent/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-accent/10 text-accent">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
