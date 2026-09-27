export type Role = "default" | "leader" | "admin";
export type User = { id: string; username: string; role: Role; isMaster: boolean; createdAt: string };
export type Player = { id: string; name: string; number: number; position: string; photo?: string; serve: number; pass: number; set: number; attack: number; block: number; createdAt: string };
export const overall = (p: Pick<Player, "serve" | "pass" | "set" | "attack" | "block">) => Math.round((p.serve + p.pass + p.set + p.attack + p.block) / 5);
