import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feria de Empleabilidad UNTELS",
  description:
    "Plataforma responsive para la Feria de Empleabilidad Virtual de la UNTELS. Conecta estudiantes con empresas en prácticas y primeros empleos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-[var(--accent)]/20">
        {children}
      </body>
    </html>
  );
}
