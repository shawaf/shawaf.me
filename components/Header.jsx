import Link from "next/link";

import { Nav } from "./Nav";
import MobileNav from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-6 py-5">
        <Link href="/" className="flex items-center gap-3 text-foreground transition hover:text-accent">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-muted/60 text-lg font-semibold text-accent">
            ME
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Software Engineer</p>
            <h1 className="text-xl font-semibold leading-none">shawaf.me</h1>
          </div>
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          <Nav />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-4 xl:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
};
