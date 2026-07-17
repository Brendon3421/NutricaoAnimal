import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriLeite — Sistema de Nutrição Animal",
  description: "Formulação de dietas e gestão para rebanhos leiteiros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
