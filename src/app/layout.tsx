import type { Metadata } from "next";
import "./globals.css";
import { SeedOnce } from "@/lib/seed";

export const metadata: Metadata = {
  title: "UNTELS · Seguimiento de Egresados",
  description: "Sistema web de gestión y seguimiento de egresados – UNTELS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="sticky top-0 z-10 border-b border-[var(--line)]/60 bg-[var(--card)]/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#0b928f] text-white font-extrabold">
                U
              </div>
              <div>
                <div className="text-sm font-semibold">UNTELS</div>
                <div className="text-xs text-[var(--muted)]">Seguimiento de Egresados</div>
              </div>
            </div>
            <div className="hidden sm:block text-xs text-[var(--muted)]">
              Universidad Nacional Tecnológica de Lima Sur
            </div>
          </div>
        </header>

        <SeedOnce />
        {children}

        <footer className="mt-12 border-t border-[var(--line)]/60">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} UNTELS · Oficina de Empleabilidad & Seguimiento al Egresado
          </div>
        </footer>
      </body>
    </html>
  );
}
