'use client';

import { useEffect, useRef, useState } from 'react';

const scenes = [
  { label: 'Desktop', title: 'Make room for a longer conversation.', text: 'Ask a question, attach a file, or type @ to bring a source or tool into chat. Pick up previous conversations from the sidebar.', image: '/images/tour/desktop.jpg', alt: 'Iris desktop chat and composer' },
  { label: 'Notch', title: 'Ask without leaving your work.', text: 'Summon Iris at the top of your screen. Type or speak, attach an image, and open the full conversation when you need more space.', image: '/images/tour/notch.jpg', alt: 'Expanded Iris notch with text, microphone and attachment controls' },
  { label: 'Floating', title: 'Get help right where you’re looking.', text: 'Keep Iris beside the app you’re using. With screen access and a supported model, Iris can point to a control, label a diagram, or sketch an explanation.', image: '/images/tour/floating.jpg', alt: 'Floating Iris with the guide-in-an-app control', portrait: true },
  { label: 'Drafting', title: 'Write in the field you’re already in.', text: 'Double-tap your drafting shortcut to rewrite selected text or start a reply from the context you share. Edit the result before sending.', image: '/images/tour/drafting.jpg', alt: 'The Iris onboarding lesson for Double Tap drafting in TextEdit' },
  { label: 'Knowledge', title: 'Give answers more context.', text: 'Bring in files, notes, and selected connections. Use @ to reference a source in chat, or scan enabled sources to save useful details to memory.', image: '/images/tour/connections.jpg', alt: 'Iris Knowledge showing Scan now and the Connections section' },
  { label: 'Agents', title: 'Hand off the longer jobs.', text: 'Start a specialist agent for a larger task, then follow its progress while you keep using Iris. Give each agent a specific brief.', image: '/images/tour/agents.jpg', alt: 'Iris Agents showing several agents and an example task' },
  { label: 'Create', title: 'Turn a prompt into something you can open.', text: 'Choose a creation tool with @ in chat. Ask for a document, website, or image and open the resulting file from the conversation.', image: '/images/tour/desktop.jpg', alt: 'Iris chat with Website and Document creation tools' },
  { label: 'Library', title: 'Find what you made again.', text: 'Reopen generated files, projects, and study material from the Library. Bring a saved item back into chat to keep working on it.', image: '/images/tour/library.jpg', alt: 'Iris Library with Files, Study, Projects and Drafts categories' },
  { label: 'Voice & setup', title: 'Choose how Iris listens and answers.', text: 'Set a voice and keyboard shortcuts, then choose OpenAI, Gemini, or a local model through LM Studio. Manage screen and folder access in Settings.', image: '/images/tour/voice.jpg', alt: 'Iris onboarding with Gemini, VoiceBox, and macOS voice options' },
];

export function ProductTour({ animated }: { animated: boolean }) {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const staticTour = compact || !animated;

  useEffect(() => {
    const query = matchMedia('(max-height: 600px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (staticTour) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const container = section.current;
      const panel = stage.current;
      if (!container || !panel) return;
      const top = parseFloat(getComputedStyle(panel).top) || 0;
      const distance = container.offsetHeight - panel.offsetHeight;
      if (distance <= 0) return;
      const progress = Math.min(1, Math.max(0, (top - container.getBoundingClientRect().top) / distance));
      setActive(Math.min(scenes.length - 1, Math.floor(progress * scenes.length + 0.00001)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  }, [staticTour]);

  function choose(index: number) {
    if (staticTour) { setActive(index); return; }
    if (!section.current || !stage.current) return;
    const top = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = section.current.offsetHeight - stage.current.offsetHeight;
    const start = scrollY + section.current.getBoundingClientRect().top - top;
    scrollTo({ top: start + distance * (index + 0.5) / scenes.length, behavior: 'smooth' });
  }

  const scene = scenes[active];
  return <section id="features" className="product-tour product-width" aria-labelledby="feature-title">
    <div className="tour-heading">
      <h2 id="feature-title">See Iris in action.</h2>
      <p>Scroll through the Mac app, or choose a feature to jump to it.</p>
    </div>
    <div className={'tour-track' + (staticTour ? ' tour-static' : '')} ref={section}>
      <div className="tour-sticky" ref={stage}>
        <div className="tour-stage" id="iris-tour-scene">
          <div className="tour-copy">
            <div className="tour-label"><span>{scene.label}</span><span aria-hidden="true">{active + 1} / {scenes.length}</span></div>
            <h3>{scene.title}</h3>
            <p>{scene.text}</p>
          </div>
          <div className="tour-media">
            {scenes.map((item, index) =>
              <div key={item.label} className={'tour-image' + (index === active ? ' is-current' : '') + (item.portrait ? ' is-portrait' : '')} aria-hidden={index !== active}>
                <img src={item.image} alt={item.alt} loading={index ? 'lazy' : 'eager'} decoding="async"/>
              </div>
            )}
          </div>
        </div>
        <div className="tour-nav" role="group" aria-label="Choose an Iris feature">
          {scenes.map((item, index) => <button key={item.label} type="button" aria-controls="iris-tour-scene" aria-pressed={index === active} onClick={() => choose(index)}>{item.label}</button>)}
        </div>
      </div>
    </div>
  </section>;
}
