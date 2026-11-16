import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader, Source_Serif_4, Inter } from "next/font/google";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QueryProvider } from "@/context/QueryProvider";
import { UserProvider } from "@/context/UserProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], weight: ["400", "500", "600"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "AIS — Academic Integrity System",
  description: "Submit documents and review similarity reports.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(newsreader.variable, sourceSerif.variable, jetbrainsMono.variable, "font-sans", inter.variable)}>
      <body>
        <QueryProvider>
          <UserProvider>
            <ProtectedRoute>{children}</ProtectedRoute>
          </UserProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
