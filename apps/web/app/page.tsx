"use client";
import Shell from "../components/Shell";
import Link from "next/link";
import { ArrowRight, Lightning, ShieldCheck, UsersThree } from "@phosphor-icons/react";
export default function Home() { return <Shell><header className="top"><div><p className="eyebrow">PAINEL ESPORTIVO</p><h1>O próximo jogo<br/><em>começa aqui.</em></h1><p>Cadastre a galera, distribua os talentos e monte times equilibrados em poucos segundos.</p><Link className="primary" href="/sorteio">Sortear agora <ArrowRight/></Link></div><div className="hero-ball">🏐</div></header><section className="stats"><article><span><UsersThree/></span><div><b>Jogadores</b><small>Elenco centralizado e sempre pronto</small></div></article><article><span><Lightning/></span><div><b>Equilíbrio inteligente</b><small>Habilidades e posições em conta</small></div></article><article><span><ShieldCheck/></span><div><b>Acesso seguro</b><small>Permissões por responsabilidade</small></div></article></section></Shell>; }
