import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

//Components
import { Header } from "../components/Header";
import PageTransitions from "../components/PageTransitions";
import StairTransitions from "../components/StairTransitions";

const jetbrainMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrainsMono",
});

export const metadata = {
  title: "shawaf.me",
  description: "Personal Website ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground", jetbrainMono.variable)}>
        <ThemeProvider>
          <Header />
          <StairTransitions />
          <PageTransitions>{children}</PageTransitions>
        </ThemeProvider>
      </body>
    </html>
  );
}
