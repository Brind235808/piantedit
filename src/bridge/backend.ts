export type BackendApi = { saveProject: (projectPath: string, content: string) => Promise<{ backup_path: string }>; inspectFile: (path: string) => Promise<{ path: string; bytes: number }>; inspectDds: (path: string) => Promise<{ width: number; height: number; mip_levels: number; array_size: number; format: string; cube: boolean; dx10: boolean }> };

// Tauri is injected at runtime. Keeping this adapter isolated lets the web prototype run in Vite.
export async function backend(): Promise<BackendApi | null> {
  const invoke = (globalThis as typeof globalThis & { __TAURI__?: { core?: { invoke: (cmd: string, args?: unknown) => Promise<unknown> } } }).__TAURI__?.core?.invoke;
  if (!invoke) return null;
  return { saveProject: (projectPath, content) => invoke("save_project", { request: { project_path: projectPath, content } }) as Promise<{ backup_path: string }>, inspectFile: (path) => invoke("inspect_file", { path }) as Promise<{ path: string; bytes: number }>, inspectDds: (path) => invoke("inspect_dds", { path }) as Promise<{ width: number; height: number; mip_levels: number; array_size: number; format: string; cube: boolean; dx10: boolean }> };
}
