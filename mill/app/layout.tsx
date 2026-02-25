import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nurds Agentic Mill — Prompt to Deployment",
  description: "AI-powered coding pipeline. Think it. Prompt it. Ship it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
