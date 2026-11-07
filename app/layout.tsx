import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Project Ultimatum",
  description: "A zero bullshit, evidence based protocol engineered exclusively for natural lifters.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import InstallPrompt from "@/components/InstallPrompt";
import GlobalNav from "@/components/GlobalNav";
import CapacitorHardwareBackButton from "@/components/CapacitorHardwareBackButton";
import GlobalTimerModal from "@/components/GlobalTimerModal";
import RouteTracker from "@/components/RouteTracker";

import { OfflineProvider } from "@/components/OfflineProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CapacitorHardwareBackButton />
        <OfflineProvider>
          {children}
          <InstallPrompt />
          <GlobalNav />
          <GlobalTimerModal />
          <RouteTracker />
        </OfflineProvider>
      </body>
    </html>
  );
}
