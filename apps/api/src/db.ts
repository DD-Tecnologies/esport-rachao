type Params = Record<string, string | number | boolean | null>;
const base = process.env.ARCADE_URL ?? "http://localhost:2480";
const database = process.env.ARCADE_DB ?? "esporte";
const username = process.env.ARCADE_USER ?? "esporte";
const password = process.env.ARCADE_PASSWORD ?? "";

async function request(path: string, body: object, credentials = { username, password }) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}` },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`ArcadeDB ${response.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

export async function command(sql: string, params: Params = {}) {
  const data = await request(`/api/v1/command/${database}`, { language: "sql", command: sql, params });
  return data.result ?? [];
}

export async function query(sql: string, params: Params = {}) {
  const data = await request(`/api/v1/query/${database}`, { language: "sql", command: sql, params });
  return data.result ?? [];
}

export async function initializeSchema() {
  const statements = [
    "CREATE DOCUMENT TYPE AppUser IF NOT EXISTS",
    "CREATE PROPERTY AppUser.id IF NOT EXISTS STRING",
    "CREATE PROPERTY AppUser.username IF NOT EXISTS STRING",
    "CREATE PROPERTY AppUser.passwordHash IF NOT EXISTS STRING",
    "CREATE PROPERTY AppUser.role IF NOT EXISTS STRING",
    "CREATE PROPERTY AppUser.isMaster IF NOT EXISTS BOOLEAN",
    "CREATE PROPERTY AppUser.createdAt IF NOT EXISTS DATETIME",
    "CREATE INDEX IF NOT EXISTS ON AppUser (username) UNIQUE",
    "CREATE DOCUMENT TYPE Player IF NOT EXISTS",
    "CREATE PROPERTY Player.id IF NOT EXISTS STRING",
    "CREATE PROPERTY Player.name IF NOT EXISTS STRING",
    "CREATE PROPERTY Player.number IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.position IF NOT EXISTS STRING",
    "CREATE PROPERTY Player.position5 IF NOT EXISTS STRING",
    "CREATE PROPERTY Player.positionR IF NOT EXISTS STRING",
    "CREATE PROPERTY Player.photo IF NOT EXISTS STRING",
    "CREATE PROPERTY Player.serve IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.pass IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.set IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.attack IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.block IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.physical IF NOT EXISTS INTEGER",
    "CREATE PROPERTY Player.createdAt IF NOT EXISTS DATETIME",
    "CREATE INDEX IF NOT EXISTS ON Player (id) UNIQUE",
    "CREATE DOCUMENT TYPE DrawHistory IF NOT EXISTS",
    "CREATE PROPERTY DrawHistory.id IF NOT EXISTS STRING",
    "CREATE PROPERTY DrawHistory.data IF NOT EXISTS STRING",
    "CREATE PROPERTY DrawHistory.createdBy IF NOT EXISTS STRING",
    "CREATE PROPERTY DrawHistory.createdAt IF NOT EXISTS DATETIME",
    "CREATE INDEX IF NOT EXISTS ON DrawHistory (id) UNIQUE",
    "CREATE DOCUMENT TYPE Match IF NOT EXISTS",
    "CREATE PROPERTY Match.id IF NOT EXISTS STRING",
    "CREATE PROPERTY Match.status IF NOT EXISTS STRING",
    "CREATE PROPERTY Match.data IF NOT EXISTS STRING",
    "CREATE PROPERTY Match.createdBy IF NOT EXISTS STRING",
    "CREATE PROPERTY Match.createdAt IF NOT EXISTS DATETIME",
    "CREATE PROPERTY Match.updatedAt IF NOT EXISTS DATETIME",
    "CREATE INDEX IF NOT EXISTS ON Match (id) UNIQUE",
    "CREATE DOCUMENT TYPE CardConfig IF NOT EXISTS",
    "CREATE PROPERTY CardConfig.id IF NOT EXISTS STRING",
    "CREATE PROPERTY CardConfig.data IF NOT EXISTS STRING",
    "CREATE PROPERTY CardConfig.updatedAt IF NOT EXISTS DATETIME",
    "CREATE INDEX IF NOT EXISTS ON CardConfig (id) UNIQUE",
  ];
  for (const statement of statements) await command(statement);
}
