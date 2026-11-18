import { env } from 'cloudflare:workers';
export const ADMIN = () => (env.ADMIN_EMAIL || 'admin@example.invalid').toLowerCase();
const encoder = new TextEncoder();
export function base64url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
export function random() { return base64url(crypto.getRandomValues(new Uint8Array(32))); }
async function key() {
 if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) throw new Error('Admin session configuration is incomplete.');
 return crypto.subtle.importKey('raw',encoder.encode(env.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
export async function sign(value: object) {
 const body = base64url(encoder.encode(JSON.stringify(value)));
 return body+'.'+base64url(new Uint8Array(await crypto.subtle.sign('HMAC',await key(),encoder.encode(body))));
}
export async function verify<T>(value?: string): Promise<T|null> {
 try {
  const [body,sig,...extra] = (value||'').split('.'); if (!body || !sig || extra.length) return null;
  const decode = (s:string) => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  if (!await crypto.subtle.verify('HMAC',await key(),decode(sig),encoder.encode(body))) return null;
  const object = JSON.parse(new TextDecoder().decode(decode(body)));
  return object.exp > Date.now() ? object : null;
 } catch { return null; }
}
export function cookies(request:Request) { return Object.fromEntries((request.headers.get('cookie')||'').split(';').map(v=>v.trim().split(/=([\s\S]*)/).slice(0,2))); }
export function cookie(name:string,value:string,seconds=14400) { return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`; }
export async function admin(request:Request) {
 const session = await verify<{sub:string,email:string,exp:number}>(cookies(request).iris_session);
 if (!session || session.email !== ADMIN() || !env.DB) return null;
 const binding = await env.DB.prepare('SELECT subject FROM admins WHERE email=?').bind(ADMIN()).first<{subject:string}>();
 return binding?.subject === session.sub ? session : null;
}
export function configured() { return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.SESSION_SECRET); }
