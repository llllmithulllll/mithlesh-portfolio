const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sessionKey = 'portfolioAdminSessionV1';
export const backendConfigured = Boolean(base && key && !base.includes('YOUR_PROJECT') && !key.startsWith('YOUR_'));
export type BackendSession = { access_token: string; refresh_token: string; expires_at?: number; user: { id: string; email?: string } };
const session = (): BackendSession | null => { try { return JSON.parse(localStorage.getItem(sessionKey) || 'null'); } catch { return null; } };
const saveSession = (value: BackendSession | null) => value ? localStorage.setItem(sessionKey, JSON.stringify(value)) : localStorage.removeItem(sessionKey);

async function request(path: string, init: RequestInit = {}, authenticated = false): Promise<any> {
  if (!backendConfigured) throw new Error('The dashboard backend is not connected yet. Follow the setup steps in README.md.');
  let active = authenticated ? session() : null;
  if (authenticated && !active) throw new Error('Sign in to continue.');
  if (authenticated && active?.expires_at && active.expires_at < Date.now() / 1000 + 30) {
    const refreshed = await fetch(`${base}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: key!, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: active.refresh_token }) });
    if (!refreshed.ok) { saveSession(null); throw new Error('Your session expired. Please sign in again.'); }
    const next = await refreshed.json(); active = { ...next, expires_at: Date.now() / 1000 + next.expires_in }; saveSession(active);
  }
  const response = await fetch(`${base}${path}`, { ...init, headers: { apikey: key!, 'Content-Type': 'application/json', ...(active ? { Authorization: `Bearer ${active.access_token}` } : {}), ...init.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || body.msg || body.error_description || `Backend request failed (${response.status}).`); }
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

export async function signIn(email: string, password: string) {
  const data = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  saveSession({ ...data, expires_at: Date.now() / 1000 + data.expires_in }); return data.user;
}
export async function signOut() { const active = session(); if (active) await request('/auth/v1/logout', { method: 'POST' }, true).catch(() => undefined); saveSession(null); }
export const currentSession = session;
export async function readPublishedContent() {
  const [content, projectRows] = await Promise.all([
    request('/rest/v1/portfolio_content?select=data&id=eq.true'),
    request('/rest/v1/portfolio_projects?select=id,data&order=sort_order.asc')
  ]);
  const rows = Array.isArray(projectRows) ? projectRows : [];
  return { content: content?.[0]?.data || null, projects: rows.filter((row: any) => !row.data?._deleted).map((row: any) => row.data), deletedProjectIds: rows.filter((row: any) => row.data?._deleted).map((row: any) => row.id) };
}
export async function savePublishedContent(content: unknown) {
  const rows = await request('/rest/v1/portfolio_content?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: true, data: content, updated_at: new Date().toISOString() }) }, true);
  return rows;
}
export async function savePublishedProject(project: { id: string; [key: string]: any }, sort_order: number) {
  return request('/rest/v1/portfolio_projects?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: project.id, data: project, sort_order, updated_at: new Date().toISOString() }) }, true);
}
export async function deletePublishedProject(id: string) { return request('/rest/v1/portfolio_projects?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id, data: { _deleted: true }, sort_order: 0, updated_at: new Date().toISOString() }) }, true); }
export async function uploadPortfolioAsset(file: File) {
  if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Use a JPG, PNG, WebP, or PDF file up to 5 MB.');
  const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '-')}`;
  const data = await request(`/storage/v1/object/portfolio-assets/${encodeURIComponent(path)}`, { method: 'POST', headers: { 'Content-Type': file.type, 'x-upsert': 'true' }, body: file }, true);
  return `${base}/storage/v1/object/public/portfolio-assets/${encodeURIComponent(path)}`;
}
