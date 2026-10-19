function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Mescla o conteúdo salvo sobre o padrão, campo a campo. */
export function mergeContent<T>(base: T, saved: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(saved)) {
    if (saved === undefined || saved === null) return base;
    if (Array.isArray(base)) return (Array.isArray(saved) ? saved : base) as T;
    return (typeof saved === typeof base ? saved : base) as T;
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    out[key] = mergeContent((base as Record<string, unknown>)[key], saved[key]);
  }
  return out as T;
}
