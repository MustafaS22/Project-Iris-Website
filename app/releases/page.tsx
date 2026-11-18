'use client';
import {useEffect,useState} from 'react';
import {ArrowDown} from 'lucide-react';
import {Nav,Footer,type Release,size} from '../components';
import {usePlatform} from '../use-platform';
import {releasePlatform,type DesktopPlatform} from '../../lib/platform';
export default function Releases(){
 const platform=usePlatform(),[choice,setChoice]=useState<DesktopPlatform|null>(null),selected=choice??platform??'macos';
 const [rows,setRows]=useState<Release[]|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;fetch('/api/releases').then(r=>{if(!r.ok)throw Error();return r.json() as Promise<Release[]>;}).then(releases=>{if(active)setRows([...releases.filter(r=>r.active),...releases.filter(r=>!r.active)]);}).catch(()=>{if(active)setFailed(true);});return()=>{active=false};},[]);
 const visible=rows?.filter(r=>releasePlatform(r)===selected);
 function choose(event:React.MouseEvent<HTMLAnchorElement>,os:DesktopPlatform){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();setChoice(os);history.replaceState(null,'',`?platform=${os}`);}
 return <><Nav/><main className="release-page section"><h1>Release notes.</h1><p className="page-lead">What’s new, organized by platform. Every previous download stays here.</p>
  <nav className="release-platforms" aria-label="Release platform">{(['macos','windows'] as const).map(os=><a key={os} href={`?platform=${os}`} aria-current={selected===os?'page':undefined} onClick={e=>choose(e,os)}>{os==='macos'?'macOS':'Windows'}{rows&&<span>{rows.filter(r=>releasePlatform(r)===os).length}</span>}</a>)}</nav>
  <div className="release-platform-heading"><h2>{selected==='macos'?'macOS releases':'Windows releases'}</h2><p>{selected==='macos'?'The main Iris experience, with ongoing updates.':'Windows 1.0 is a separate, unsigned test edition.'}</p></div>
  {failed?<p role="alert">Release notes couldn’t load. Refresh this page to try again.</p>:!visible?<p role="status">Loading releases…</p>:!visible.length?<p>No {selected==='macos'?'macOS':'Windows'} releases are available yet.</p>:visible.map(r=><article className="release" key={r.id}><div className="release-heading"><h3>Iris {r.version}</h3>{r.active&&<span className="tag">Current {selected==='macos'?'Mac':'Windows'} download</span>}<time dateTime={r.created}>{new Date(r.created).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</time></div><p className="release-notes">{r.notes}</p><div className="release-foot"><span>{selected==='windows'?'Windows x64 · Windows':'Apple Silicon · macOS'} {r.minimum}+ · {size(r.size)}</span><a href={r.url} download={selected==='windows'?'Iris-Windows-1.0-Setup.exe':`Iris-${r.version}.dmg`} className={r.active?'button dark small-button':'button small-button release-download'}><ArrowDown size={16} aria-hidden="true"/>Download Iris {r.version}</a></div></article>)}
 </main><Footer/></>;
}
