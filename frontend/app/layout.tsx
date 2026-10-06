import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AppPreferencesProvider } from "@/context/AppPreferencesContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MyAcademic - Modern Academic Journeys & Learning Management",
  description: "Platform akademik terpadu dengan arsitektur modern Next.js dan Laravel REST API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.className}>
      <body className="theme-formal">
        <AppPreferencesProvider>
          {children}
        </AppPreferencesProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
