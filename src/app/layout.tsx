import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppMotionConfig } from "@/components/motion-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APITA Marketplace",
  description: "Connecting APITA participant projects with investors.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppMotionConfig>{children}</AppMotionConfig>
      </body>
    </html>
  );
}
