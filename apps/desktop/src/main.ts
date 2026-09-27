import { app, BrowserWindow, shell } from "electron";
const site = process.env.ESPORTE_URL ?? "https://esporte.ddtech.cloud";
function createWindow() { const win = new BrowserWindow({ width: 1280, height: 820, minWidth: 390, minHeight: 640, title: "Rachão", backgroundColor: "#07111f", webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false } }); win.loadURL(site); win.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith("https://")) shell.openExternal(url); return { action: "deny" }; }); }
app.whenReady().then(createWindow); app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); }); app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
