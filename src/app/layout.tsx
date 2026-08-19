import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display serif for headings — the sans stays on data-dense UI
// (tables, forms), the serif is reserved for page titles and the landing
// page, echoing the refined serif headings in the aviation-brand reference.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "AeroVet Compliance",
  description:
    "Aviation certification and security clearance verification for defense & aerospace recruiting teams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col bg-background shadow-2xl">
            {children}
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
