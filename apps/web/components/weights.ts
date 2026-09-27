import type { Player } from "./types";
export const roles=["Levantador","Ponteiro","Central","Oposto","Líbero","Geral"] as const;
export const labels={set:"Levantamento",pass:"Passe",attack:"Ataque",serve:"Saque",block:"Bloqueio",physical:"Físico"} as const;
export type Skill=keyof typeof labels; export type Weights=Record<string,Record<Skill,number>>;
export const defaultWeights:Weights={
  Levantador:{set:35,pass:20,attack:5,serve:10,block:10,physical:20},
  Ponteiro:{set:5,pass:25,attack:30,serve:15,block:10,physical:15},
  Central:{set:5,pass:5,attack:20,serve:10,block:40,physical:20},
  Oposto:{set:5,pass:10,attack:40,serve:15,block:15,physical:15},
  Líbero:{set:10,pass:50,attack:0,serve:10,block:0,physical:30},
  Geral:{set:17,pass:17,attack:17,serve:16,block:16,physical:17}
};
const legacy:Record<Skill,string>={set:"lev",pass:"passe",attack:"ataque",serve:"saque",block:"bloqueio",physical:"fisico"};
export function normalizeWeights(raw:any):Weights{const source=raw?.['5x1']||raw||{};const out={} as Weights;for(const role of roles){const r=source[role]||raw?.rachao?.[role]||{};out[role]=Object.fromEntries((Object.keys(labels) as Skill[]).map(k=>[k,Number(r[k]??r[legacy[k]]??defaultWeights[role][k])])) as Record<Skill,number>}return out}
export function roleOf(p:Player,mode='5x1'){return mode==='rachao'?(p.positionR||'Geral'):(p.position5||p.position||'Geral')}
export function weightedSkill(p:Player,weights:Weights,mode='5x1'){const w=weights[roleOf(p,mode)]||weights.Geral||defaultWeights.Geral;let total=0,sum=0;for(const k of Object.keys(labels) as Skill[]){const n=Number(w[k]||0);total+=Number(p[k]??50)*n;sum+=n}return Math.round(total/(sum||1))}
