import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

// גיבוי שבועי ל-Google Drive — קריאה בלבד מהטבלאות, כתיבת קובץ JSON אחד לתיקייה ב-Drive.
// לא משנה שום נתון באפליקציה.

const APP_LABEL = "שעון נוכחות";
const FOLDER_NAME = "IPS גיבוי – שעון נוכחות";
const TABLES = ["TimeEntry", "ClosedMonth"];
const BUDGET_MS = 150 * 1000;
const asArray = (r: any) => (Array.isArray(r) ? r : r?.items || []);

async function drive(token: string, url: string, init: RequestInit = {}) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Drive ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
const q = (s: string) => s.replace(/'/g, "\\'");

async function findOrCreateFolder(token: string, name: string) {
  const query = `name='${q(name)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const found = await drive(token, `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);
  if (found.files?.length) return found.files[0].id;
  const created = await drive(token, "https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder" }),
  });
  return created.id;
}

Deno.serve(async (req) => {
  const t0 = Date.now();
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== "admin") return Response.json({ error: "נדרשת הרשאת מנהל" }, { status: 403 });

  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
    const folderId = await findOrCreateFolder(accessToken, FOLDER_NAME);

    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date()); // YYYY-MM-DD
    const fileName = `גיבוי ${APP_LABEL} ${day}.json`;

    // הפעלה בלי משתמש (התזמון השבועי) — רק אם עוד אין גיבוי של היום
    if (!user) {
      const query = `name='${q(fileName)}' and '${folderId}' in parents and trashed=false`;
      const ex = await drive(accessToken, `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`);
      if (ex.files?.length) return Response.json({ skipped: true, reason: "כבר קיים גיבוי היום" });
    }

    const db = base44.asServiceRole.entities as any;
    const tables: Record<string, any[]> = {};
    const counts: Record<string, number> = {};
    const skipped: string[] = [];
    for (const name of TABLES) {
      if (Date.now() - t0 > BUDGET_MS) { skipped.push(name); continue; }
      try {
        const rows: any[] = [];
        for (let skip = 0; ; skip += 500) {
          const page = asArray(await db[name].list("-created_date", 500, skip));
          rows.push(...page);
          if (page.length < 500) break;
        }
        tables[name] = rows;
        counts[name] = rows.length;
      } catch (e) {
        skipped.push(`${name} (${String((e as any)?.message || e).slice(0, 80)})`);
      }
    }

    const payload = JSON.stringify({ app: APP_LABEL, created_at: new Date().toISOString(), counts, skipped, tables });
    const boundary = "ipsbackup" + Date.now();
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: fileName, parents: [folderId], mimeType: "application/json" }) +
      `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      payload +
      `\r\n--${boundary}--`;
    const file = await drive(accessToken, "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size", {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    });

    return Response.json({
      success: true, file: file.name, file_id: file.id, size_kb: Math.round(Number(file.size || payload.length) / 1024),
      counts, skipped, seconds: Math.round((Date.now() - t0) / 1000),
    });
  } catch (e: any) {
    console.error("backup failed", String(e?.message || e));
    return Response.json({ error: String(e?.message || e).slice(0, 500) }, { status: 500 });
  }
});
