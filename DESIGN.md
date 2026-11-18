# Iris visual direction

## Reference-led redesign

The user chose a competitor-like desktop assistant website, replacing the original pale sage brochure. The references were visually inspected: Sentient's dramatic dark product stage, HeyClicky's familiar desktop details, Jarvis's tactile controls, and Rome's character-led composition. The user's pinned direction takes precedence over randomized alternatives.

Iris is presented as a companion on a late-night Mac desktop: warm charcoal surfaces, cream type, apricot-to-honey controls, apricot eyes matching the real app icon, and an amber desktop horizon. The live Iris character is the primary identifying asset. The hero pairs direct large type with a pointer-responsive avatar and selectable illustrative conversations. A large desktop scene shows actual app screenshots and allows switching between desktop, notch and floating views. Lower sections show context and real outcomes rather than a grid of generic feature cards.

Manrope remains locally hosted, now with confident weight contrast. Motion is centered on the responsive eyes, breathing float, conversational typing, and mode transitions. Respect reduced motion. All public routes and the admin desk inherit the same palette and control language. Download and Google authentication behavior remain unchanged.

The user requested more gradients and stronger visual depth in both app and website. Layered warm surface gradients distinguish conversation, creation, learning, and settings. Warm lighting stays behind the avatar and desktop scene, with bright tactile primary controls and clearly contrasted quiet content. The compact top-centered notch preview remains unchanged.

## November 2026: scroll-driven companion story

The homepage now uses a centered character-led opening rather than the old split hero. Honey (#f3cf85), warm cream (#fff5df), and charcoal (#10100d) stay grounded in Iris's original yellow eyes. Manrope remains self-hosted. The headline is confident but the UI stays quiet around the avatar.

The focal motion is a native-scroll, sticky desktop sequence: the same warm desktop changes from the compact top-centered notch into full chat, then floating guidance. Visitors can also select each view directly or use arrow keys. Mobile and reduced-motion preferences use a normal-height, manually switchable preview. A page-level pause control stops looping animation and removes the pinned scroll sequence. CSS transform/opacity transitions carry the spatial changes; a single scroll listener writes CSS progress through requestAnimationFrame and only changes React state at the three mode boundaries.

Conversation examples are selectable and honestly illustrative. The file fan and source constellation explain concrete outcomes. Studio shifts to a warm paper surface with study and build examples. The user-approved 51-second narrated film is available on demand with English captions; no sound autoplays. Download, release, iPhone, privacy and protected admin routes retain their existing behavior. This pass does not change the Mac app.
