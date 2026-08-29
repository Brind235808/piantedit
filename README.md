# PiantEdit

面向 PNG/DDS 贴图拼接的 Windows 桌面工具（早期原型）。目标：透明画布、素材待操作区、边缘吸附、防重叠、无损 PNG 导出，以及可由 AI/CLI 批量控制。

## 当前状态

v0.1.0：前端交互原型。已包含素材区、透明棋盘画布、AI 命令入口和布局状态展示；Rust/Tauri、DDS 编解码、项目备份和 CLI 将在下一步接入。

## 开发

```bash
npm install
npm run dev
```

## 版本策略

- `0.x`：快速迭代原型
- `1.0.0`：PNG/DDS 导入、布局、防重叠、PNG/DDS 导出和项目备份可用
- 使用 Git tag：`v0.1.0`、`v0.2.0` 等
