import { env } from 'cloudflare:workers';
import { random, sign, base64url, cookie, configured } from '../../../lib/auth';
export async function GET(request:Request) {
 const origin = new URL(request.url).origin;
 if (!configured()) return Response.redirect(origin+'/admin?setup=required',303);
 const state=random(), verifier=random();
 const challenge=base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 url.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID!,redirect_uri:env.GOOGLE_REDIRECT_URI||origin+'/auth/google/callback',response_type:'code',scope:'openid email profile',state,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'}).toString();
 return new Response(null,{status:302,headers:{Location:url.toString(),'Set-Cookie':cookie('iris_oauth',await sign({state,verifier,exp:Date.now()+600000}),600),'Cache-Control':'no-store'}});
}
