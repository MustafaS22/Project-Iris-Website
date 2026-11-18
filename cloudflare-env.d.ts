declare namespace Cloudflare { interface Env {
 DB?: D1Database; BUCKET?: R2Bucket;
 ADMIN_EMAIL?: string; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; GOOGLE_REDIRECT_URI?: string; SESSION_SECRET?: string;
} }
