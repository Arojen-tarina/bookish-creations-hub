/** Resolve a path under public/ while respecting Vite's configured deployment base. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
