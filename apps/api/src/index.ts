import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { command, initializeSchema, query } from "./db.js";
import { hashPassword, verifyPassword } from "./security.js";

type Session = { id: string; username: string; role: "default" | "leader" | "admin"; isMaster: boolean };
declare global { namespace Express { interface Request { session?: Session } } }
const app = express();
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "development-secret-change-this");
const cookie = "esporte_session";
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "3mb" }));
app.use(cookieParser());

async function auth(req: Request, res: Response, next: NextFunction) {
  try { const { payload } = await jwtVerify(req.cookies[cookie], secret); req.session = payload as unknown as Session; next(); }
  catch { res.status(401).json({ error: "Sessão inválida ou expirada" }); }
}
const role = (...roles: Session["role"][]) => (req: Request, res: Response, next: NextFunction) => roles.includes(req.session!.role) ? next() : res.status(403).json({ error: "Sem permissão" });
const publicUser = (u: any) => ({ id: u.id, username: u.username, role: u.role, isMaster: Boolean(u.isMaster), createdAt: u.createdAt });
const credentialsSchema = z.object({ username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/), password: z.string().min(8).max(128) });
const playerSchema = z.object({ name: z.string().min(2).max(80), number: z.number().int().min(0).max(99), position: z.enum(["Levantador", "Ponteiro", "Central", "Oposto", "Líbero"]), position5: z.string().max(30).optional(), positionR: z.string().max(30).optional(), photo: z.string().max(2_500_000).optional().default(""), serve: z.number().int().min(0).max(100), pass: z.number().int().min(0).max(100), set: z.number().int().min(0).max(100), attack: z.number().int().min(0).max(100), block: z.number().int().min(0).max(100), physical: z.number().int().min(0).max(100).optional().default(50) });

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.post("/auth/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Credenciais inválidas" });
  const users = await query("SELECT FROM AppUser WHERE username = :username LIMIT 1", { username: parsed.data.username.toLowerCase() });
  const user = users[0]; if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: "Usuário ou senha inválidos" });
  const session: Session = publicUser(user);
  const token = await new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(secret);
  res.cookie(cookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 43_200_000, path: "/" }).json(session);
});
app.post("/auth/logout", (_req, res) => res.clearCookie(cookie, { path: "/" }).status(204).end());
app.get("/auth/me", auth, (req, res) => res.json(req.session));

app.get("/users", auth, role("admin"), async (_req, res) => res.json((await query("SELECT id, username, role, isMaster, createdAt FROM AppUser ORDER BY username")).map(publicUser)));
app.post("/users", auth, role("admin"), async (req, res) => {
  const parsed = credentialsSchema.extend({ role: z.enum(["default", "leader", "admin"]).default("default") }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const data = parsed.data; const id = randomUUID();
  try { await command("INSERT INTO AppUser SET id=:id, username=:username, passwordHash=:hash, role=:role, isMaster=false, createdAt=sysdate()", { id, username: data.username.toLowerCase(), hash: await hashPassword(data.password), role: data.role }); res.status(201).json({ id, username: data.username.toLowerCase(), role: data.role, isMaster: false }); }
  catch { res.status(409).json({ error: "Usuário já existe" }); }
});
app.patch("/users/:id", auth, role("admin"), async (req, res) => {
  const parsed = z.object({ role: z.enum(["default", "leader", "admin"]) }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Permissão inválida" });
  const id = String(req.params.id); const target = (await query("SELECT FROM AppUser WHERE id=:id LIMIT 1", { id }))[0]; if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
  if (target.isMaster) return res.status(403).json({ error: "A conta master não pode perder permissões" });
  await command("UPDATE AppUser SET role=:role WHERE id=:id", { id, role: parsed.data.role }); res.status(204).end();
});
app.delete("/users/:id", auth, role("admin"), async (req, res) => {
  const id = String(req.params.id); const target = (await query("SELECT FROM AppUser WHERE id=:id LIMIT 1", { id }))[0]; if (!target) return res.status(404).json({ error: "Usuário não encontrado" });
  if (target.isMaster) return res.status(403).json({ error: "A conta master não pode ser removida" });
  await command("DELETE FROM AppUser WHERE id=:id", { id }); res.status(204).end();
});

app.get("/players", auth, async (_req, res) => res.json(await query("SELECT id, name, number, position, position5, positionR, photo, serve, pass, set, attack, block, physical, createdAt FROM Player ORDER BY name")));
app.post("/players", auth, role("leader", "admin"), async (req, res) => { const parsed = playerSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Dados do jogador inválidos" }); const id = randomUUID(); const d={...parsed.data,position5:parsed.data.position5??parsed.data.position,positionR:parsed.data.positionR??(parsed.data.position==="Levantador"?"Levantador":"Geral")}; await command("INSERT INTO Player SET id=:id, name=:name, number=:number, position=:position, position5=:position5, positionR=:positionR, photo=:photo, serve=:serve, pass=:pass, set=:set, attack=:attack, block=:block, physical=:physical, createdAt=sysdate()", { id, ...d }); res.status(201).json({ id, ...d }); });
app.put("/players/:id", auth, role("leader", "admin"), async (req, res) => { const parsed = playerSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Dados do jogador inválidos" }); const d={...parsed.data,position5:parsed.data.position5??parsed.data.position,positionR:parsed.data.positionR??(parsed.data.position==="Levantador"?"Levantador":"Geral")}; await command("UPDATE Player SET name=:name, number=:number, position=:position, position5=:position5, positionR=:positionR, photo=:photo, serve=:serve, pass=:pass, set=:set, attack=:attack, block=:block, physical=:physical WHERE id=:id", { id: String(req.params.id), ...d }); res.status(204).end(); });
app.delete("/players/:id", auth, role("leader", "admin"), async (req, res) => { await command("DELETE FROM Player WHERE id=:id", { id: String(req.params.id) }); res.status(204).end(); });

const jsonSchema=z.object({data:z.unknown()});
app.get("/history",auth,async(_req,res)=>res.json((await query("SELECT id,data,createdBy,createdAt FROM DrawHistory ORDER BY createdAt DESC LIMIT 100")).map((x:any)=>({...x,data:JSON.parse(x.data)}))));
app.post("/history",auth,role("leader","admin"),async(req,res)=>{const p=jsonSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:"Histórico inválido"});const id=randomUUID();await command("INSERT INTO DrawHistory SET id=:id,data=:data,createdBy=:by,createdAt=sysdate()",{id,data:JSON.stringify(p.data.data),by:req.session!.username});res.status(201).json({id});});
app.delete("/history",auth,role("admin"),async(_req,res)=>{await command("DELETE FROM DrawHistory");res.status(204).end()});
app.get("/matches",auth,async(_req,res)=>res.json((await query("SELECT id,status,data,createdBy,createdAt,updatedAt FROM VolleyMatch ORDER BY updatedAt DESC LIMIT 100")).map((x:any)=>({...x,data:JSON.parse(x.data)}))));
app.post("/matches",auth,role("leader","admin"),async(req,res)=>{const p=z.object({id:z.string().uuid().optional(),status:z.enum(["active","finished"]),data:z.unknown()}).safeParse(req.body);if(!p.success)return res.status(400).json({error:"Partida inválida"});const id=p.data.id??randomUUID();const found=await query("SELECT id FROM VolleyMatch WHERE id=:id LIMIT 1",{id});if(found.length)await command("UPDATE VolleyMatch SET status=:status,data=:data,updatedAt=sysdate() WHERE id=:id",{id,status:p.data.status,data:JSON.stringify(p.data.data)});else await command("INSERT INTO VolleyMatch SET id=:id,status=:status,data=:data,createdBy=:by,createdAt=sysdate(),updatedAt=sysdate()",{id,status:p.data.status,data:JSON.stringify(p.data.data),by:req.session!.username});res.json({id});});
app.get("/card-config",auth,async(_req,res)=>{const x=(await query("SELECT data FROM CardConfig WHERE id='global' LIMIT 1"))[0];res.json(x?JSON.parse(x.data):{})});
app.put("/card-config",auth,role("admin"),async(req,res)=>{const data=JSON.stringify(req.body);if(data.length>3_000_000)return res.status(413).json({error:"Configuração muito grande"});const x=await query("SELECT id FROM CardConfig WHERE id='global' LIMIT 1");if(x.length)await command("UPDATE CardConfig SET data=:data,updatedAt=sysdate() WHERE id='global'",{data});else await command("INSERT INTO CardConfig SET id='global',data=:data,updatedAt=sysdate()",{data});res.status(204).end()});
app.get("/backup",auth,role("admin"),async(_req,res)=>res.json({format:"esporte-rachao-backup",version:1,exportedAt:new Date().toISOString(),players:await query("SELECT FROM Player"),history:await query("SELECT FROM DrawHistory"),matches:await query("SELECT FROM VolleyMatch"),cardConfig:(await query("SELECT data FROM CardConfig WHERE id='global' LIMIT 1"))[0]?.data??null}));
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => { console.error(error); res.status(500).json({ error: "Erro interno" }); });

async function bootstrap() {
  await initializeSchema();
  const masterUsername = (process.env.MASTER_USERNAME ?? "admmaster").toLowerCase(); const masterPassword = process.env.MASTER_PASSWORD;
  if (!masterPassword) throw new Error("MASTER_PASSWORD is required");
  const existing = await query("SELECT FROM AppUser WHERE username=:username LIMIT 1", { username: masterUsername });
  if (!existing.length) await command("INSERT INTO AppUser SET id=:id, username=:username, passwordHash=:hash, role='admin', isMaster=true, createdAt=sysdate()", { id: randomUUID(), username: masterUsername, hash: await hashPassword(masterPassword) });
  else if (!existing[0].isMaster || existing[0].role !== "admin") await command("UPDATE AppUser SET isMaster=true, role='admin' WHERE username=:username", { username: masterUsername });
  app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0", () => console.log("API listening"));
}
bootstrap().catch((error) => { console.error(error); process.exit(1); });
