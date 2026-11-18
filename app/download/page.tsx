'use client';
import {ArrowDown,ArrowUpRight,FolderOpen,HardDrive,Sparkles} from 'lucide-react';
import {Nav,Footer,Face,useRelease,size} from '../components';
import {usePlatform} from '../use-platform';

const macSteps=[
 {icon:HardDrive,title:'Open the disk image',detail:'Open the Iris DMG from your Downloads folder.'},
 {icon:FolderOpen,title:'Move Iris to Applications',detail:'Drag Iris into Applications, then eject the disk image.'},
 {icon:Sparkles,title:'Make it yours',detail:'Choose your AI connection, personality and permissions. Future Mac updates live in Settings → Updates.'},
];
const windowsSteps=[
 {icon:HardDrive,title:'Open the installer',detail:'Open Iris-Windows-1.0-Setup.exe on your Windows 11 x64 PC.'},
 {icon:FolderOpen,title:'Install Iris',detail:'Follow the setup steps and choose your installation folder.'},
 {icon:Sparkles,title:'Make it yours',detail:'Connect an OpenAI or Gemini API key, or use a local model through LM Studio.'},
];
export default function Download(){
 const platform=usePlatform(),primary=platform??'macos',mac=useRelease('macos'),windows=useRelease('windows');
 const current=primary==='macos'?mac:windows,other=primary==='macos'?windows:mac;
 const name=primary==='macos'?'macOS':'Windows',otherName=primary==='macos'?'Windows':'macOS';
 const filename=(os:string,version:string)=>os==='windows'?'Iris-Windows-1.0-Setup.exe':`Iris-${version}.dmg`;
 const steps=primary==='macos'?macSteps:windowsSteps;
 return <><Nav/><main className="iris-download section">
  <section className="download-hero" aria-labelledby="download-title">
   <div className="download-copy"><Face/><h1 id="download-title">Meet Iris<br/>on your {platform==='macos'?'Mac':platform==='windows'?'PC':'computer'}.</h1>
    <p>On your desktop or floating beside your work. Iris is there when you need it.</p>
    <div className="download-action">
     {current.value?<><a className="button dark" href={current.value.url} download={filename(primary,current.value.version)}><ArrowDown size={18} aria-hidden="true"/>Download for {name}</a>
      <p className="download-meta">Iris {current.value.version} · {primary==='macos'?'Apple Silicon · macOS':'Windows x64 · Windows'} {current.value.minimum}+ · {size(current.value.size)}</p>
     </>:<p role="status">{current.error?`${name} download details couldn’t load. Refresh to try again.`:'Getting the current release…'}</p>}
     {primary==='windows'&&<p className="download-edition">Windows 1.0 is an unsigned test edition. <a href="/windows">See compatibility &amp; setup</a>.</p>}
    </div>
    <div className="download-other"><span>Need the other version?</span>{other.value?<a href={other.value.url} download={filename(primary==='macos'?'windows':'macos',other.value.version)}>Download for {otherName}<ArrowDown size={14} aria-hidden="true"/></a>:<span role="status">{other.error?`${otherName} download is temporarily unavailable.`:`Loading ${otherName} download…`}</span>}
     {primary==='macos'&&other.value&&<small>Windows 1.0 · unsigned test edition</small>}
    </div>
    <a className="text-link download-history" href={`/releases?platform=${primary}`}>Release notes &amp; older versions<ArrowUpRight size={15} aria-hidden="true"/></a>
   </div>
   <figure className="download-stage"><div className="download-stage-bar" aria-hidden="true"><Face small/>Iris<span>by AriZe</span></div><img src="/images/desktop.png" alt="Iris’s desktop assistant and workspace"/></figure>
  </section>
  <aside className="phone-download-callout"><div><strong>Your companion, now on iPhone.</strong><p>Get the iPhone preview and follow the sideloading guide.</p></div><a className="text-link" href="/iphone">Iris for iPhone<ArrowUpRight size={16}/></a></aside>
  <section className="download-setup" aria-labelledby="setup-title"><h2 id="setup-title">Settle in on {platform==='macos'?'your Mac':platform==='windows'?'your PC':name}.</h2><ol>{steps.map(({icon:Icon,title,detail},i)=><li key={title}><div className="download-step-mark"><Icon size={22} aria-hidden="true"/><span>{i+1}</span></div><h3>{title}</h3><p>{detail}</p></li>)}</ol>
   <p className="download-help">{primary==='macos'?'This Mac build is not Apple-notarized. macOS may ask you to review it in Privacy & Security.':'Review the Windows test edition’s compatibility and installation notes before installing.'}</p>
  </section>
 </main><Footer/></>;
}
