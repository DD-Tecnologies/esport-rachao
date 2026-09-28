import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./scoreboard.css";
import "./profile-card.css";
import "./weights.css";
import "./admin-actions.css";
import "./draw-cards.css";
import "./delete-modal.css";
import "./court-setup.css";
import "./draw-flow-fix.css";
import "./draw-card-large.css";
import "./draw-roster-scroll.css";
export const metadata: Metadata = { title: "Rachão · Sorteador de Times", description: "Times equilibrados, jogo bonito.", manifest: "/manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#f97316", width: "device-width", initialScale: 1 };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
