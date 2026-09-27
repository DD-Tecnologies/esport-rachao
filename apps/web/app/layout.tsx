import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Rachão · Sorteador de Times", description: "Times equilibrados, jogo bonito.", manifest: "/manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#f97316", width: "device-width", initialScale: 1 };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
