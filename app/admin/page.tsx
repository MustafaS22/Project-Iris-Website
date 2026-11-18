'use client';
import { useEffect,useRef,useState } from 'react';
import { ArrowUpRight, UploadCloud, CheckCircle2, ShieldCheck, FileArchive, LogOut, LoaderCircle, X, RotateCcw } from 'lucide-react';
import { Brand, type Release, size, Face } from '../components';
import './desk.css';
type Platform = 'macos' | 'windows';
type Session={authenticated:boolean,email?:string,configured:boolean};
async function api<T=Record<string, unknown>>(path:string,options:RequestInit={}){const response=await fetch('/api/admin/'+path,options);const data=response.status===204?{}:await response.json() as {error?:string};if(!response.ok)throw Error(data.error||'The request could not finish.');return data as T;}
export default function Admin(){const[session,setSession]=useState<Session|null>(null),[failure,setFailure]=useState(''),[notice,setNotice]=useState(''),[rows,setRows]=useState<Release[]>([]),[platform,setPlatform]=useState<Platform>('macos'),[activating,setActivating]=useState<string|null>(null),[pending,setPending]=useState<{id:string,version:string,size:number}[]>([]),[file,setFile]=useState<File|null>(null),[version,setVersion]=useState(''),[minimum,setMinimum]=useState('15.0'),[notes,setNotes]=useState(''),[build,setBuild]=useState(''),[signature,setSignature]=useState(''),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[phase,setPhase]=useState(''),[drag,setDrag]=useState(false);const input=useRef<HTMLInputElement>(null),xhr=useRef<XMLHttpRequest|null>(null),cancelled=useRef(false),uploadId=useRef('');
async function refresh(){const state=await api<Session>('session');setSession(state);if(state.authenticated){const releases=await api<{releases:Release[],current:string}>('releases');setRows(releases.releases);setPending(await api<{id:string,version:string,size:number}[]>('uploads'));}}
useEffect(()=>{refresh().catch(()=>setFailure('The admin service is unavailable. Please refresh and try again.'));if(new URLSearchParams(location.search).has('error'))setFailure('Google sign-in did not finish, or this account is not authorized. Use the designated AriZe administrator account.');},[]);
const windows = platform === 'windows';
const platformName = windows ? 'Windows' : 'macOS';
const extension = windows ? '.exe' : '.dmg';
function selectPlatform(next: Platform) {
 if (next === platform || busy || activating) return;
 setPlatform(next);
 setFile(null);
 if (input.current) input.current.value = '';
 setVersion(next === 'windows' ? '1.0' : '');
 setMinimum(next === 'windows' ? '11.0' : '15.0');
 setBuild('');
 setSignature('');
 setFailure('');
 setNotice('');
}
function choose(selected?: File) {
 if (!selected) return;
 if (!selected.name.toLowerCase().endsWith(extension) || selected.size < 512 || selected.size > 2 * 1024 ** 3) {
  setFailure(`Choose a ${platformName} ${extension} installer between 512 bytes and 2 GB.`);
  return;
 }
 setFile(selected);
 setBuild('');
 setSignature('');
 setFailure('');
 setNotice('');
}
async function cancel(){cancelled.current=true;xhr.current?.abort();if(uploadId.current){try{await api('uploads/'+uploadId.current,{method:'DELETE'});}catch{}}setPhase('Upload cancelled. The current download was kept.');}
async function publish(event:React.FormEvent){event.preventDefault();if(!file||busy)return;setBusy(true);setFailure('');setNotice('');setProgress(0);cancelled.current=false;uploadId.current='';
try{setPhase('Checking the installer…');if(windows){const header=new Uint8Array(await file.slice(0,64).arrayBuffer());if(header.length!==64||header[0]!==77||header[1]!==90)throw Error('Choose a valid Windows PE installer.');}else{const footer=new Uint8Array(await file.slice(-512).arrayBuffer());if(String.fromCharCode(...footer.slice(0,4))!=='koly')throw Error('Choose a valid UDIF DMG.');}
const start=await api<{id:string,partSize:number}>('uploads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version,minimum,notes,build,signature,size:file.size,platform})});uploadId.current=start.id;
if(cancelled.current)throw Error('Upload cancelled.');
const count=Math.ceil(file.size/start.partSize);for(let part=1;part<=count;part++){if(cancelled.current)throw Error('Upload cancelled.');setPhase(`Uploading part ${part} of ${count}…`);const offset=(part-1)*start.partSize;await new Promise<void>((resolve,reject)=>{const request=new XMLHttpRequest();xhr.current=request;request.open('PUT','/api/admin/uploads/'+start.id+'/parts/'+part);request.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.min(98,Math.round((offset+e.loaded)/file.size*100)));};request.onload=()=>{if(request.status>=200&&request.status<300)resolve();else{let message='Upload failed. Your current release is unchanged.';try{message=JSON.parse(request.responseText).error||message;}catch{}reject(Error(message));}};request.onerror=()=>reject(Error('Network interrupted. Please try uploading again.'));request.onabort=()=>reject(Error('Upload cancelled.'));request.send(file.slice(offset,Math.min(offset+start.partSize,file.size)));});}
if(cancelled.current)throw Error('Upload cancelled.');setPhase('Verifying and publishing…');await api('uploads/'+start.id+'/complete',{method:'POST'});setProgress(100);setNotice(`Iris ${version} is now the active ${platformName} download.`);setPhase('Published');setFile(null);if(input.current)input.current.value='';setVersion(windows?'1.0':'');setNotes('');setBuild('');setSignature('');uploadId.current='';await refresh().catch(()=>setFailure('The release was published. Refresh to see the updated list.'));
}catch(error){if(uploadId.current){try{await api('uploads/'+uploadId.current,{method:'DELETE'});}catch{}}setFailure(error instanceof Error?error.message:'Upload failed.');}finally{setBusy(false);xhr.current=null;}}
async function activate(release: Release) {
 if (busy || activating) return;
 setActivating(release.id);
 setFailure('');
 setNotice('');
 try {
  await api('activate', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id:release.id})});
  setNotice(`Iris ${release.version} is now the active ${platformName} download.`);
  await refresh().catch(()=>setFailure('The download was updated. Refresh to see the updated list.'));
 } catch (error) { setFailure((error as Error).message); }
 finally { setActivating(null); }
}
const history = rows.filter(release => release.platform === platform);
const activeRelease = history.find(release => release.active);
const pendingForPlatform = pending.filter(upload => upload.version.startsWith('windows-') === windows);
return <div className="admin-shell release-desk">
 <header className="admin-nav"><Brand/><a href="/">View website <ArrowUpRight size={15}/></a></header>
 {!session?.authenticated ? <main className="admin-login">
  <Face/><h1>Release desk</h1><p>Sign in with the AriZe administrator account to publish Iris installers.</p>
  {!session && !failure ? <p role="status"><LoaderCircle className="spin"/> Checking sign-in…</p> : <a className="button dark google-button" href="/auth/google" target="_top">Continue with Google <ArrowUpRight size={15}/></a>}
  {session && !session.configured && <p>Google sign-in needs to be configured on the server.</p>}
  {failure && <p className="error-message" role="alert">{failure}</p>}
 </main> : <main className="admin-main">
  <div className="admin-heading"><div><h1>Release desk</h1><p>Publish installers and manage the current download for each platform.</p></div>
   <button className="quiet-button" type="button" disabled={busy || !!activating} onClick={async()=>{
    try { await api('logout',{method:'POST'}); setSession({authenticated:false,configured:true}); }
    catch (error) { setFailure((error as Error).message); }
   }}><LogOut size={16}/> Sign out</button>
  </div>
  <div className="session-line"><ShieldCheck size={16}/> {session.email}</div>
  <fieldset className="desk-platforms" disabled={busy || !!activating}>
   <legend>Target platform</legend>
   {(['macos','windows'] as const).map(option => <label key={option}>
    <input name="platform" type="radio" checked={platform===option} onChange={()=>selectPlatform(option)}/>
    <span>{option==='macos'?'macOS':'Windows'}<small>{option==='macos'?'Apple Silicon · DMG':'x64 · EXE · Version 1.0'}</small></span>
   </label>)}
  </fieldset>
  {failure && <div className="error-message" role="alert">{failure}</div>}
  {notice && <div className="success-message" role="status"><CheckCircle2 size={18}/>{notice}</div>}
  <div className="admin-grid">
   <form className="upload-panel" onSubmit={publish} aria-label={`Publish a ${platformName} release`}>
    <h2>Publish for {platformName}</h2>
    <p>{windows?'Upload the Windows 1.0 test installer.':'Upload the installer for Apple Silicon Macs.'}</p>
    <input ref={input} type="file" accept={extension} hidden onChange={e=>choose(e.target.files?.[0])}/>
    <button type="button" disabled={busy || !!activating} className={'dropzone '+(drag?'dragging':'')} onClick={()=>input.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(!busy&&!activating)choose(e.dataTransfer.files[0]);}}>
      <FileArchive size={27}/><strong>{file?file.name:`Choose a ${platformName} installer`}</strong><span>{file?size(file.size):`Drop a ${extension} file here or browse · up to 2 GB`}</span>
    </button>
    <div className="form-row">
     <label>Version<input value={version} onChange={e=>setVersion(e.target.value)} placeholder="2.0.33" maxLength={40} required readOnly={windows} disabled={busy}/></label>
     <label>Minimum OS version<input value={minimum} onChange={e=>setMinimum(e.target.value)} required disabled={busy}/></label>
    </div>
    <label>Release notes<textarea rows={5} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What changed in this release?" maxLength={5000} required disabled={busy}/></label>
    {!windows && <fieldset className="update-signing-fields"><legend>In-app updates</legend>
     <p className="form-hint">Enter both values from updater.json to offer this build inside Iris. Leave both blank for a website download.</p>
     <div className="form-row">
      <label>Build number<input value={build} onChange={e=>setBuild(e.target.value)} inputMode="numeric" maxLength={24} required={!!signature.trim()} disabled={busy}/></label>
      <label>Update signature<input value={signature} onChange={e=>setSignature(e.target.value)} maxLength={88} autoComplete="off" spellCheck={false} required={!!build.trim()} disabled={busy}/></label>
     </div>
    </fieldset>}
    {busy && <div className="upload-progress" role="status"><div><span>{phase}</span><strong>{progress}%</strong></div><progress value={progress} max={100}/></div>}
    <div className="upload-actions">
     <button className="button dark" disabled={busy || !!activating || !file} type="submit">{busy?<LoaderCircle size={17} className="spin"/>:<UploadCloud size={17}/>} {busy?'Publishing…':`Publish for ${platformName}`}</button>
     {busy && !phase.startsWith('Verifying') && <button type="button" className="quiet-button" onClick={cancel}><X size={16}/> Cancel upload</button>}
    </div>
   </form>
   <aside className="release-panel">
    <h2>{platformName} releases</h2>
    <div className="desk-current"><span>Current download</span><strong>{activeRelease?`Iris ${activeRelease.version}`:windows?'No Windows release':'Built-in Mac preview'}</strong></div>
    {pendingForPlatform.length>0 && <div className="pending-uploads"><h3>Unfinished uploads</h3>{pendingForPlatform.map(upload=><div className="admin-release" key={upload.id}><div><strong>{upload.version.replace(/^windows-/,'')}</strong><span>{size(upload.size)}</span></div><button type="button" disabled={busy || !!activating} className="quiet-button" onClick={async()=>{
     try{await api('uploads/'+upload.id,{method:'DELETE'});await refresh();}catch(error){setFailure((error as Error).message);}
    }}>Cancel upload</button></div>)}</div>}
    <h3>Release history</h3>
    <div className="desk-history">{history.map(release=><div className="admin-release" key={release.id}><div><strong>Iris {release.version}</strong><span>{size(release.size)} · {platformName} {release.minimum}+</span></div>{release.active?<span className="tag">Live</span>:<button type="button" disabled={busy || !!activating} className="quiet-button" onClick={()=>activate(release)}><RotateCcw size={14}/> {activating===release.id?'Switching…':'Make current'}</button>}</div>)}
    {!history.length && <p>No uploads for {platformName} yet.</p>}</div>
    {!windows && activeRelease && <button type="button" className="quiet-button desk-preview" disabled={busy || !!activating} onClick={()=>activate({id:'builtin-preview',version:'1.0-preview',minimum:'15.0',size:0,notes:'',created:'',url:''})}>Restore built-in Mac preview</button>}
    <a href={`/download?platform=${platform}`} className="text-link" target="_blank" rel="noreferrer">View {platformName} download <ArrowUpRight size={16}/></a>
   </aside>
  </div>
 </main>}
 <footer className="admin-footer">Iris by AriZe</footer>
</div>;
}
