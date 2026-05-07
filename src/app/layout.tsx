import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom",
  description: "Cuide da sua planta diariamente e veja ela florescer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
