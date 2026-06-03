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
                  <Link href="/" className="group flex items-center gap-3 text-ink" aria-label="AR Reading home">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-ink shadow-soft transition group-hover:-translate-y-0.5">
                      <span className="absolute -left-2 -top-2 h-7 w-7 rounded-full bg-peach" />
                      <span className="absolute -right-2 top-1 h-6 w-6 rounded-full bg-berry" />
                      <span className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-leaf/40" />
                      <svg className="relative h-7 w-7" viewBox="0 0 32 32" aria-hidden="true">
                        <path
                          d="M7 9.5c0-1.7 1.3-3 3-3h4.3c2.1 0 4 .9 5.2 2.4 1.2-1.5 3.1-2.4 5.2-2.4H26c1.7 0 3 1.3 3 3v16c0 1.1-.9 2-2 2h-4.4c-2.8 0-5.5.9-7.6 2.6-2.1-1.7-4.8-2.6-7.6-2.6H5c-1.1 0-2-.9-2-2v-16Z"
                          fill="#fff8ef"
                        />
                        <path d="M16 9v18M7.5 12.5h6M7.5 16h5.2M20.5 12.5h4M20.5 16h4" stroke="#26323f" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-xl font-black leading-tight tracking-normal text-ink">AR Reading</span>
                      <span className="block text-xs font-semibold uppercase tracking-normal text-leaf">Family book tracker</span>
                    </span>
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
