import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Contrato Visto — Análise jurídica inteligente",
  description:
    "Plataforma LegalTech para análise jurídica, due diligence, consulta de partes e acompanhamento de casos com inteligência artificial."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
