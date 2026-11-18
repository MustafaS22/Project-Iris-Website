import { env } from 'cloudflare:workers';
import { ADMIN, cookies, cookie, verify, sign } from '../../../../lib/auth';
export async function GET(request:Request) {
 const url=new URL(request.url), origin=url.origin;
 const fail=()=>new Response(null,{status:303,headers:{Location:origin+'/admin?error=signin','Set-Cookie':cookie('iris_oauth','',0),'Cache-Control':'no-store'}});
 try {
  const state=await verify<{state:string,verifier:string,exp:number}>(cookies(request).iris_oauth);
  if (!state || state.state!==url.searchParams.get('state') || !url.searchParams.get('code') || !env.DB) return fail();
  const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID!,client_secret:env.GOOGLE_CLIENT_SECRET!,code:url.searchParams.get('code')!,code_verifier:state.verifier,redirect_uri:env.GOOGLE_REDIRECT_URI||origin+'/auth/google/callback',grant_type:'authorization_code'})});
  if (!tokenResponse.ok) return fail();
  const tokens=await tokenResponse.json() as {access_token?:string}; if (!tokens.access_token) return fail();
  const userResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+tokens.access_token}});
  if (!userResponse.ok) return fail();
  const user=await userResponse.json() as {sub?:string,email?:string,email_verified?:boolean};
  if (!user.sub || user.email_verified!==true || user.email?.toLowerCase()!==ADMIN()) return fail();
  await env.DB.prepare('INSERT OR IGNORE INTO admins(email,subject) VALUES(?,?)').bind(ADMIN(),user.sub).run();
  const bound=await env.DB.prepare('SELECT subject FROM admins WHERE email=?').bind(ADMIN()).first<{subject:string}>();
  if (bound?.subject!==user.sub) return fail();
  const headers=new Headers({Location:origin+'/admin','Cache-Control':'no-store'});
  headers.append('Set-Cookie',cookie('iris_session',await sign({sub:user.sub,email:ADMIN(),exp:Date.now()+14400000})));
  headers.append('Set-Cookie',cookie('iris_oauth','',0));
  return new Response(null,{status:303,headers});
 } catch { return fail(); }
}
