# PiantEdit

面向 PNG/DDS 贴图拼接的 Windows 桌面工具（早期原型）。目标：透明画布、素材待操作区、边缘吸附、防重叠、无损 PNG 导出，以及可由 AI/CLI 批量控制。

## 当前状态

v0.2.0：加入纯 TypeScript 布局核心（网格排列、矩形模型）和紧凑 AI 命令 DSL 解析器，并接入 Tauri/Rust 后端骨架、项目保存前自动备份和文件检查命令。

### Tauri 后端

安装 Rust 后，在项目根目录运行 `npm install`，再运行 `npm run tauri dev`。后端命令目前包括 `save_project`（覆盖前自动写入 `.backup`）和 `inspect_file`；DDS 编解码将在后续接入 DirectXTex。

## 开发

```bash
npm install
npm run dev
```

## 版本策略

- `0.x`：快速迭代原型
- `1.0.0`：PNG/DDS 导入、布局、防重叠、PNG/DDS 导出和项目备份可用
- 使用 Git tag：`v0.1.0`、`v0.2.0` 等
