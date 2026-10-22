import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";
import "./globals.css";

// Closest open font to Galaxy's Circular.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Magica — Your AI worker",
  description: "Assign a task or ask anything.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark ${figtree.variable}`} suppressHydrationWarning>
        <body className="antialiased">
          <Providers>
            <div className="flex h-dvh w-full overflow-hidden bg-background">
              <Sidebar />
              <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
