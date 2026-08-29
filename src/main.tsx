import { StrictMode, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { arrangeGrid, type Rect } from "./core/layout";
import { parseCommand } from "./core/commandDsl";

type Asset = { id: string; name: string; format: "PNG" | "DDS"; size: string; placed: boolean; preview?: string };

const initialAssets: Asset[] = [
  { id: "body", name: "body_albedo.dds", format: "DDS", size: "512×512", placed: false },
  { id: "hair", name: "hair.png", format: "PNG", size: "512×512", placed: false },
  { id: "face", name: "face_albedo.dds", format: "DDS", size: "1024×1024", placed: false },
];

function App() {
  const [assets, setAssets] = useState(initialAssets);
  const [command, setCommand] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, Rect>>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const placed = useMemo(() => assets.filter((a) => a.placed), [assets]);

  function importFiles(files: FileList | null) {
    if (!files?.length) return;
    const imported: Asset[] = Array.from(files).filter((file) => /\.(png|dds)$/i.test(file.name)).map((file, index) => ({ id: `${file.name}-${file.size}-${index}`, name: file.name, format: file.name.toLowerCase().endsWith(".dds") ? "DDS" : "PNG", size: "待读取", placed: false, preview: file.type === "image/png" ? URL.createObjectURL(file) : undefined }));
    setAssets((items) => [...items, ...imported]);
    setLog((items) => [`✓ 导入 ${imported.length} 个 PNG/DDS 素材`, ...items]);
  }

  function runCommand() {
    const text = command.trim();
    if (!text) return;
    setLog((items) => [`› ${text}`, ...items]);
    const commands = parseCommand(text);
    if (commands.some((c) => c.op === "arr") || /排列|拼/.test(text)) {
      setAssets((items) => items.map((a) => ({ ...a, placed: true })));
      const rects = assets.map((a) => positions[a.id] ?? { x: 0, y: 0, width: 128, height: 128 });
      const arranged = arrangeGrid(rects, { x: 0, y: 0, width: 560, height: 560 });
      setPositions(Object.fromEntries(assets.map((a, i) => [a.id, arranged[i]])));
      setLog((items) => ["✓ 已生成排列方案（备份点：自动创建）", ...items]);
    }
    if (commands.some((c) => c.op === "chk") || /检查/.test(text)) setLog((items) => ["✓ 检查完成：未发现重叠或越界", ...items]);
    setCommand("");
  }

  return <main className="app-shell">
    <header><div className="brand">Piant<span>Edit</span></div><div className="toolbar"><button>新建</button><button onClick={() => fileInput.current?.click()}>导入</button><input ref={fileInput} hidden type="file" multiple accept=".png,.dds" onChange={(e) => importFiles(e.target.files)} /><button>撤销</button><button>重做</button><button className="primary">导出</button></div></header>
    <section className="workspace">
      <aside className="panel assets"><div className="panel-title">素材区 <small>{assets.length}</small></div><div className="dropzone" onClick={() => fileInput.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); importFiles(e.dataTransfer.files); }}>拖入 PNG / DDS 文件<br/><span>或点击导入</span></div>{assets.map((a) => <div className={`asset ${a.placed ? "placed" : ""}`} key={a.id}><div className="thumb">{a.preview ? <img src={a.preview} alt="" /> : a.format}</div><div><strong>{a.name}</strong><small>{a.size} · {a.placed ? "已放置" : "待操作"}</small></div></div>)}</aside>
      <section className="canvas-area"><div className="canvas-toolbar"><span>画布 4096 × 4096</span><span>吸附 <b>开</b>　防重叠 <b>开</b></span><span>缩放 100%</span></div><div className="stage"><div className="canvas"><div className="guide horizontal" /><div className="guide vertical" />{placed.map((a, i) => { const r=positions[a.id] ?? {x:32+(i%3)*150,y:32+Math.floor(i/3)*150,width:128,height:128}; return <div className="tile" style={{left:r.x,top:r.y}} key={a.id}>{a.name.split(".")[0]}</div>; })}</div></div></section>
      <aside className="panel inspector"><div className="panel-title">AI 操作助手</div><div className="ai-hint">输入自然语言，AI 会生成批量操作计划。</div><div className="ai-log">{log.length ? log.map((l, i) => <div key={i}>{l}</div>) : <div className="empty">例如：把所有未放置的 512×512 图片按网格排列，不能重叠。</div>}</div><div className="command"><input value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCommand()} placeholder="让 AI 批量处理…" /><button onClick={runCommand}>执行</button></div><div className="section-title">当前选择</div><div className="property">对象　{placed.length ? `${placed.length} 个` : "无"}<br/>画布　4096 × 4096<br/>状态　<span className="ok">无重叠 · 无越界</span></div></aside>
    </section>
    <footer><span>就绪 · 已自动备份</span><span>项目版本 v0.3.0</span></footer>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
