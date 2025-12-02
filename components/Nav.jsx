"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as myConstants from "./Constants";

const links = myConstants.navList;

export const Nav = () => {
  const pathName = usePathname();
  return (
    <nav className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 p-2 text-sm">
      {links.map((link, index) => {
        const isActive = link.path === pathName;
        return (
          <Link
            href={link.path}
            key={index}
            className={`rounded-full px-4 py-2 font-medium transition ${
              isActive
                ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};
