'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Pause, Play } from 'lucide-react';
import { Face, Footer, Nav } from './components';
import { usePlatform } from './use-platform';
import { ProductTour } from './product-tour';
import './home.css';

export default function Home() {
  const platform = usePlatform();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  const animated = !paused && !reduced;
  const download = platform ? `/download?platform=${platform}` : '/download';
  const device = platform === 'macos' ? 'Mac' : platform === 'windows' ? 'PC' : 'computer';

  return <><Nav/><main className="iris-product" data-motion={animated ? "on" : "off"}>
    <section className="product-hero product-width" aria-labelledby="product-title">
      <div className="product-intro">
        <div className="product-signature"><Face small/> Iris by AriZe</div>
        <h1 id="product-title">An AI assistant<br/>for your {device}.</h1>
        <p>Ask a question, work through a file, or get help on your screen. Iris is a shortcut away.</p>
        <div className="product-actions">
          <a className="product-primary" href={download}><ArrowDown size={18}/> {platform === 'windows' ? 'Get Iris for Windows' : platform === 'macos' ? 'Get Iris for Mac' : 'Get Iris'}</a>
          <a href="#features">Explore Iris <ArrowRight size={16}/></a>
        </div>
        <p className="product-platforms">macOS 15+ on Apple Silicon <span>·</span> <a href="/windows">Windows 1.0 test edition</a></p>
      </div>
      <div className="product-character">
        <div className="product-orbit" aria-hidden="true"><span/><span/></div>
        <img className="product-avatar" src="/images/tour/avatar.png" width="272" height="216" alt="Iris’s floating avatar" fetchPriority="high"/>
        <div className="product-character-shadow" aria-hidden="true"/>
        {!reduced && <button className="product-motion" type="button" onClick={() => setPaused(value => !value)}>
          {paused ? <Play size={14}/> : <Pause size={14}/>} {paused ? 'Resume motion' : 'Pause motion'}
        </button>}
      </div>
    </section>

    <ProductTour animated={animated}/>

    <section className="product-setup product-width" id="how-it-works">
      <div><h2>Set up Iris your way.</h2><p>Choose OpenAI, Gemini, or a local model through LM Studio. Pick a voice, then grant Iris access to the sources and folders you want it to use.</p><a href="/privacy">Read about privacy <ArrowRight size={16}/></a></div>
      <div className="product-install"><h3>Install Iris</h3><p>Get the current Mac release, the Windows test edition, or the iPhone companion.</p><a className="product-primary" href={download}><ArrowDown size={17}/> View downloads</a><a href="/iphone">iPhone setup guide <ArrowRight size={16}/></a></div>
    </section>
    <section className="product-links product-width" aria-label="More about Iris">
      <a href="/releases">Release notes <ArrowRight size={16}/></a>
      <a href="https://github.com/MustafaS22/Project-Iris">App source on GitHub <ArrowRight size={16}/></a>
      <a href="#product-title">Back to top <Play size={13} className="product-up"/></a>
    </section>
  </main><Footer/></>;
}
