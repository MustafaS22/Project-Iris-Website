import { env } from 'cloudflare:workers';
import { admin, configured, cookie } from '../../../lib/auth';
import { PART_SIZE, releaseFields, sameOrigin, validDmgFooter } from '../../../lib/release-policy';
import { builtin } from '../../../lib/builtin';
import {appcast} from '../../../lib/appcast';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function limited(request:Request,maximum:number) {
 const reader=request.body?.getReader(); if (!reader) return new Uint8Array();
 const chunks:Uint8Array[]=[]; let size=0;
 while (true) { const {done,value}=await reader.read(); if (done) break; size+=value.length; if(size>maximum){await reader.cancel();throw new Error('Request is too large.');}chunks.push(value); }
 const bytes=new Uint8Array(size);let offset=0;for(const value of chunks){bytes.set(value,offset);offset+=value.length;}return bytes;
}
async function body(request:Request) { return JSON.parse(new TextDecoder().decode(await limited(request,10000))); }
const isWindows=(v:string)=>v.startsWith('windows-');
const clearActive=(v='')=>`UPDATE releases SET active=0 WHERE version ${isWindows(v)?'LIKE':'NOT LIKE'} 'windows-%'`;
async function current(platform='macos') { return env.DB ? await env.DB.prepare(`SELECT * FROM releases WHERE active=1 AND version ${platform==='windows'?'LIKE':'NOT LIKE'} 'windows-%' LIMIT 1`).first<any>() : null; }
function publicRelease(release:any) { return {id:release.id,version:release.version.replace(/^windows-/,''),platform:isWindows(release.version)?'windows':'macos',minimum:release.minimum,size:release.size,created:release.created,notes:release.notes,url:'/api/download/'+encodeURIComponent(release.id),builtin:false,active:release.active===1}; }
async function handle(request:Request) {
 const url=new URL(request.url), path=url.pathname.slice(5).split('/').filter(Boolean), method=request.method;
 if(method==='GET' && path.join('/')==='appcast') {
  const release=await current(),object=release?await env.BUCKET?.head(release.key):null;
  if(release&&!object)return json({error:'Update storage is temporarily unavailable.'},503);
  return new Response(appcast(url.origin,release,object?.customMetadata),{headers:{'Content-Type':'application/rss+xml; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
 }
 if(method==='GET' && path.join('/')==='windows-release') { const release=await current('windows');return release?json(publicRelease(release)):json({error:'Windows 1.0 is not published yet.'},404); }
 if(method==='GET' && path.join('/')==='release') { const release=await current();return json(release?publicRelease(release):builtin); }
 if(method==='GET' && path.join('/')==='releases') { const rows=await env.DB?.prepare('SELECT * FROM releases ORDER BY created DESC').all<any>();return json([...(rows?.results??[]).map(publicRelease),{...builtin,active:!(rows?.results??[]).some((r:any)=>r.active===1&&!isWindows(r.version))}]); }
 if((method==='GET'||method==='HEAD') && path[0]==='download' && path.length<=2) {
  const id=path[1];
  if(id===builtin.id) return Response.redirect(url.origin+builtin.url,302);
  const release=id
    ? await env.DB?.prepare('SELECT * FROM releases WHERE id=?').bind(id).first<any>()
    : await current();
  if(!release) return id ? json({error:'Release not found.'},404) : Response.redirect(url.origin+builtin.url,302);
  if(!env.BUCKET) return json({error:'Downloads are temporarily unavailable.'},503);
  let range:{offset:number,length:number}|undefined;
  const requested=request.headers.get('Range');
  if(requested){const match=/^bytes=(\d*)-(\d*)$/.exec(requested);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${release.size}`}});
   let start=match[1]?Number(match[1]):Math.max(0,release.size-Number(match[2]));let end=match[2]&&match[1]?Math.min(release.size-1,Number(match[2])):release.size-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=release.size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${release.size}`}});range={offset:start,length:end-start+1};}
  const object=method==='HEAD'?await env.BUCKET.head(release.key):await env.BUCKET.get(release.key,range?{range}:undefined);
  if(!object)return json({error:'This download is temporarily unavailable. Please try again later.'},503);
  const headers=new Headers({'Content-Type':isWindows(release.version)?'application/vnd.microsoft.portable-executable':'application/x-apple-diskimage','Content-Disposition':`attachment; filename="${isWindows(release.version)?'Iris-Windows-1.0-Setup.exe':'Iris-'+release.version+'.dmg'}"`,'Content-Length':String(range?.length??release.size),'Accept-Ranges':'bytes','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff','ETag':object.httpEtag});
  if(range)headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${release.size}`);
  return new Response(method==='HEAD'?null:(object as R2ObjectBody).body,{status:range?206:200,headers});
 }
 if(path.join('/')==='admin/session'&&method==='GET'){const user=await admin(request);return json({authenticated:!!user,email:user?.email,configured:configured()});}
 if(path[0]!=='admin')return json({error:'Not found.'},404);
 if(method!=='GET'&&!sameOrigin(request))return json({error:'This action must come from the Iris website.'},403);
 const user=await admin(request);if(!user)return json({error:'Sign in with the authorized AriZe Google account.'},401);
 if(path.join('/')==='admin/logout'&&method==='POST')return new Response(null,{status:204,headers:{'Set-Cookie':cookie('iris_session','',0),'Cache-Control':'no-store'}});
 if(!env.DB||!env.BUCKET)return json({error:'Release storage is unavailable.'},503);
 const db=env.DB,bucket=env.BUCKET;
 if(path.join('/')==='admin/releases'&&method==='GET'){const rows=await db.prepare('SELECT * FROM releases ORDER BY created DESC LIMIT 50').all<any>();return json({releases:rows.results.map(publicRelease),current:(await current())?.id??builtin.id});}
 if(path.join('/')==='admin/activate'&&method==='POST'){
  const {id}=await body(request);if(id===builtin.id){await db.prepare(clearActive()).run();return json({ok:true});}
  const release=await db.prepare('SELECT * FROM releases WHERE id=?').bind(String(id)).first<any>();if(!release||!await bucket.head(release.key))return json({error:'That release file is not available.'},404);
  await db.batch([db.prepare(clearActive(release.version)),db.prepare('UPDATE releases SET active=1 WHERE id=?').bind(release.id)]);return json({ok:true});
 }
 if(path.join('/')==='admin/uploads'&&method==='GET'){const pending=await db.prepare("SELECT id,version,size,created FROM uploads WHERE owner=? AND state='pending' ORDER BY created DESC").bind(user.sub).all();return json(pending.results);}
 if(path.join('/')==='admin/uploads'&&method==='POST'){
  const fields=releaseFields(await body(request));
  const pending=await db.prepare("SELECT COUNT(*) AS count FROM uploads WHERE owner=? AND state='pending'").bind(user.sub).first<{count:number}>();
  if((pending?.count??0)>=3)return json({error:'Three uploads are already pending. Cancel an unfinished upload before starting another.'},409);
  const id=crypto.randomUUID(),key=`releases/${id}/Iris-${fields.version}.${fields.platform==='windows'?'exe':'dmg'}`;
  const multipart=await bucket.createMultipartUpload(key,{httpMetadata:{contentType:fields.platform==='windows'?'application/vnd.microsoft.portable-executable':'application/x-apple-diskimage'},customMetadata:fields.update});
  try{await db.prepare('INSERT INTO uploads(id,owner,key,multipart,version,size,notes,minimum,created,state) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,user.sub,key,multipart.uploadId,fields.version,fields.size,fields.notes,fields.minimum,new Date().toISOString(),'pending').run();}
  catch(error){await multipart.abort();throw error;}
  return json({id,partSize:PART_SIZE});
 }
 if(path[1]==='uploads'&&path[2]){
  const upload=await db.prepare('SELECT * FROM uploads WHERE id=? AND owner=?').bind(path[2],user.sub).first<any>();if(!upload)return json({error:'Upload not found.'},404);
  if(method==='DELETE'&&path.length===3){if(upload.state==='pending'){try{await bucket.resumeMultipartUpload(upload.key,upload.multipart).abort();}catch{}await db.prepare("UPDATE uploads SET state='cancelled' WHERE id=?").bind(upload.id).run();}return json({ok:true});}
  if(upload.state==='completed'&&method==='POST'&&path[3]==='complete')return json({ok:true,id:upload.id});
  if(upload.state!=='pending')return json({error:'This upload is no longer pending.'},409);
  if(method==='PUT'&&path[3]==='parts'&&path[4]){
   const number=Number(path[4]),count=Math.ceil(upload.size/PART_SIZE);if(!Number.isInteger(number)||number<1||number>count)return json({error:'Invalid upload part.'},400);
   const expected=number===count?upload.size-(number-1)*PART_SIZE:PART_SIZE;
   const bytes=await limited(request,PART_SIZE);if(bytes.length!==expected)return json({error:'Upload part size did not match. Please retry.'},400);
   const part=await bucket.resumeMultipartUpload(upload.key,upload.multipart).uploadPart(number,bytes);
   await db.prepare('INSERT OR REPLACE INTO upload_parts(id,upload,number,etag,size) VALUES(?,?,?,?,?)').bind(upload.id+':'+number,upload.id,number,part.etag,bytes.length).run();return json({ok:true});
  }
  if(method==='POST'&&path[3]==='complete'){
   const parts=await db.prepare('SELECT number,etag,size FROM upload_parts WHERE upload=? ORDER BY number').bind(upload.id).all<any>();
   if(parts.results.length!==Math.ceil(upload.size/PART_SIZE)||parts.results.some((p:any,i:number)=>p.number!==i+1)||parts.results.reduce((sum:number,p:any)=>sum+p.size,0)!==upload.size)return json({error:'Some file parts are missing. The previous download is unchanged.'},400);
   if(!await bucket.head(upload.key))await bucket.resumeMultipartUpload(upload.key,upload.multipart).complete(parts.results.map((p:any)=>({partNumber:p.number,etag:p.etag})));
   let valid=false;
   if(isWindows(upload.version)){const obj=await bucket.get(upload.key,{range:{offset:0,length:64}});const bytes=obj?new Uint8Array(await obj.arrayBuffer()):new Uint8Array();if(bytes.length===64&&bytes[0]===77&&bytes[1]===90){const pe=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(60,true);if(pe>=64&&pe<Math.min(upload.size-4,2000000)){const obj2=await bucket.get(upload.key,{range:{offset:pe,length:4}});const signature=obj2?new Uint8Array(await obj2.arrayBuffer()):new Uint8Array();valid=signature.length===4&&signature[0]===80&&signature[1]===69&&signature[2]===0&&signature[3]===0;}}}else{const object=await bucket.get(upload.key,{range:{offset:upload.size-512,length:512}});valid=!!object&&validDmgFooter(new Uint8Array(await object.arrayBuffer()));}
   if(!valid){await bucket.delete(upload.key);await db.prepare("UPDATE uploads SET state='invalid' WHERE id=?").bind(upload.id).run();return json({error:'This file does not match its installer format. Upload a valid Windows EXE or macOS UDIF DMG. The previous download is unchanged.'},400);}
   const created=new Date().toISOString();
   await db.batch([db.prepare(clearActive(upload.version)),db.prepare('INSERT INTO releases(id,version,key,size,notes,minimum,created,active) VALUES(?,?,?,?,?,?,?,1)').bind(upload.id,upload.version,upload.key,upload.size,upload.notes,upload.minimum,created),db.prepare("UPDATE uploads SET state='completed' WHERE id=?").bind(upload.id)]);
   return json({ok:true,id:upload.id});
  }
 }
 return json({error:'Not found.'},404);
}
export async function GET(request:Request){try{return await handle(request);}catch{return json({error:'This service is temporarily unavailable. Please try again.'},503);}}
export const HEAD=GET;
async function write(request:Request){try{return await handle(request);}catch(error){return json({error:error instanceof Error&&/Enter |Choose |Release notes|Request is too large|Unexpected token/.test(error.message)?error.message:'The update could not finish. Your current download was kept. Try again.'},400);}}
export const POST=write;export const PUT=write;export const DELETE=write;
