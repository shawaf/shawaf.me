import Link from "next/link";

//Components
import { Nav } from "./Nav";
import MobileNav from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="py-8 xl:py-12 text-foreground">
      <div className="container mx-auto flex justify-between items-center gap-6">
        {/* logo */}
        <Link href="/">
          <h1 className="text-4xl font-semibold">
            Shawaf<span className="text-accent">.</span>me
          </h1>
        </Link>

        {/* desktop nav  & hire me button */}
        <div className="hidden xl:flex items-center gap-8 ">
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
