'use client';

import { ArrowDown, ArrowRight, Command, FileText, Mic, PanelTop, Play } from 'lucide-react';
import { Face, Footer, Nav } from './components';
import { usePlatform } from './use-platform';
import './home.css';

const features = [
  {
    title: 'Ask without switching apps',
    text: 'Open Iris from the notch to type or speak. Move into the desktop workspace when a quick question becomes a longer conversation.',
    icon: PanelTop,
  },
  {
    title: 'Work from your own material',
    text: 'Attach an image or document, or type @ to choose a connected source. Use Knowledge to find the notes and files you’ve brought into Iris.',
    icon: FileText,
  },
  {
    title: 'Get help on your screen',
    text: 'Use floating Iris to talk through what you’re looking at. With screen access and a supported model, it can point out where to click or explain a diagram.',
    icon: Mic,
  },
];

export default function Home() {
  const platform = usePlatform();
  const download = platform ? `/download?platform=${platform}` : '/download';
  const device = platform === 'macos' ? 'Mac' : platform === 'windows' ? 'PC' : 'computer';

  return <><Nav/><main className="iris-product">
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
      <figure className="product-hero-shot">
        <img src="/images/current/desktop.jpg" width="1700" height="1182" alt="Iris for Mac desktop chat, with tools for websites, documents, and knowledge sources" fetchPriority="high"/>
        <figcaption><span>Iris for macOS</span><span><Command size={13}/> Open with a shortcut</span></figcaption>
      </figure>
    </section>

    <section className="product-features product-width" id="features" aria-labelledby="feature-title">
      <h2 id="feature-title">What you can do with Iris</h2>
      <div className="product-feature-grid">{features.map(({title,text,icon: Icon}) =>
        <article key={title}><Icon size={24} aria-hidden="true"/><h3>{title}</h3><p>{text}</p></article>
      )}</div>
      <div className="product-gallery">
        <figure><div className="product-notch-stage"><img src="/images/current/notch.jpg" width="1160" height="596" loading="lazy" alt="Iris notch chat with its attachment, source and microphone controls"/></div><figcaption><strong>Notch chat</strong><span>Quick questions by voice or keyboard</span></figcaption></figure>
        <figure><div className="product-knowledge-stage"><img src="/images/current/knowledge.jpg" width="1600" height="1057" loading="lazy" alt="Iris Knowledge library with sample photography notes and a Scan now button"/></div><figcaption><strong>Knowledge</strong><span>Browse your sources and save useful details to memory</span></figcaption></figure>
      </div>
    </section>

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
