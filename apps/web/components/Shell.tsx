"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChartBar, Database, Scales, ShieldCheck, SignOut, UsersThree, Volleyball, UserCircle } from "@phosphor-icons/react";
import { api } from "./api";
import type { Session } from "./types";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Session | null>(null); const path = usePathname(); const router = useRouter();
  useEffect(() => { api<Session>("/auth/me").then(setMe).catch(() => {}); }, []);
  async function logout() { await api("/auth/logout", { method: "POST" }); router.push("/login"); }
  if (!me) return <div className="loading"><div className="ball">✦</div><span>Preparando a quadra…</span></div>;
  const nav = [{ href: "/", label: "Início", icon: Volleyball }, { href: "/jogadores", label: "Jogadores", icon: UserCircle }, { href: "/sorteio", label: "Sorteio", icon: UsersThree }, { href: "/placar", label: "Placar", icon: ChartBar }, ...(me.role === "admin" ? [{ href: "/admin/usuarios", label: "Usuários", icon: ShieldCheck },{href:"/admin/pesos",label:"Pesos",icon:Scales},{href:"/admin/dados",label:"Dados",icon:Database}] : [])];
  return <div className="shell"><aside><Link className="brand" href="/"><span>R</span><div><b>RACHÃO</b><small>VOLLEY CLUB</small></div></Link><nav>{nav.map(({ href, label, icon: Icon }) => <Link className={path === href ? "active" : ""} href={href} key={href}><Icon size={21}/><span>{label}</span></Link>)}</nav><div className="profile"><div className="avatar">{me.username[0].toUpperCase()}</div><div><b>{me.username}</b><small>{me.role === "leader" ? "Líder de grupo" : me.role}</small></div><button aria-label="Sair" onClick={logout}><SignOut size={20}/></button></div></aside><main>{children}</main></div>;
}
