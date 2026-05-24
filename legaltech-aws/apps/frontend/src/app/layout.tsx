import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "LegalTech AWS V2",
  description: "Frontend inicial do MVP LegalTech AWS V2"
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
