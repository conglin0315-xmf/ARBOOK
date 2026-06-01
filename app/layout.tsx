import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import { AppProvider } from "@/lib/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Children's AR Reading Tracker",
  description: "Track children's reading history and simple AR/ATOS recommendations.",
  manifest: "/manifest.webmanifest",
  applicationName: "AR Reading Tracker",
  appleWebApp: {
    capable: true,
    title: "AR Reading",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/apple-touch-icon.svg", type: "image/svg+xml" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#f6efe4"
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/books", label: "Sessions" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/settings", label: "Settings" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AuthGate>
            <div className="min-h-screen">
            <header className="border-b border-ink/10 bg-white/85 backdrop-blur">
              <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <Link href="/" className="text-xl font-bold text-ink">
                    Children's AR Reading Tracker
                  </Link>
                  <p className="max-w-xl text-sm text-ink/65">
                    AR/ATOS level is entered by the parent. Please verify with your school or official book lookup tools.
                  </p>
                </div>
                <nav className="flex gap-2 overflow-x-auto pb-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="whitespace-nowrap rounded-full border border-ink/10 bg-cream px-4 py-2 text-sm font-medium text-ink transition hover:border-leaf hover:text-leaf"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
          </AuthGate>
        </AppProvider>
      </body>
    </html>
  );
}
