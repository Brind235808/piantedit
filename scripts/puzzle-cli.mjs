#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [,, projectPath, ...args] = process.argv;
if (!projectPath || args.length === 0) { console.error("用法: puzzle <project.json> arr|check [参数]"); process.exit(2); }
const command = args[0].toLowerCase();
const data = JSON.parse(fs.readFileSync(projectPath, "utf8"));
data.canvas ??= { width: 4096, height: 4096 };
data.assets ??= [];
data.positions ??= {};
const backupDir = path.join(path.dirname(projectPath), ".backup");
fs.mkdirSync(backupDir, { recursive: true });
const backup = path.join(backupDir, `${path.basename(projectPath)}-${new Date().toISOString().replace(/[:.]/g, "-")}.bak`);
fs.copyFileSync(projectPath, backup);
const rect = (id) => data.positions[id] ?? { x: 0, y: 0, width: 128, height: 128 };
if (command === "arr") {
  const gap = Number(args.find(x => x.startsWith("gap="))?.slice(4) ?? 0);
  const items = data.assets.filter(a => !a.placed || args.includes("all"));
  const maxW = Math.max(1, ...items.map(a => rect(a.id).width));
  const cols = Math.max(1, Math.floor((data.canvas.width + gap) / (maxW + gap)));
  items.forEach((a, i) => { const r = rect(a.id); data.positions[a.id] = { ...r, x: (i % cols) * (r.width + gap), y: Math.floor(i / cols) * (r.height + gap) }; a.placed = true; });
  fs.writeFileSync(projectPath, JSON.stringify(data, null, 2));
  console.log(JSON.stringify({ ok: true, op: "arr", changed: items.length, backup }, null, 2));
} else if (command === "check") {
  const ids = data.assets.filter(a => a.placed).map(a => a.id); const overlaps = [];
  for (let i=0;i<ids.length;i++) for (let j=i+1;j<ids.length;j++) { const a=rect(ids[i]), b=rect(ids[j]); if (a.x < b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y) overlaps.push([ids[i],ids[j]]); }
  console.log(JSON.stringify({ ok: overlaps.length===0, overlaps, backup }, null, 2));
} else { console.error(`未知命令: ${command}`); process.exit(2); }
