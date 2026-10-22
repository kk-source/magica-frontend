import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magica — Your AI worker",
  description: "Assign a task or ask anything.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className="antialiased">
          <Providers>
            <div className="flex h-dvh w-full overflow-hidden bg-[#0a0a0a]">
              <Sidebar />
              <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
