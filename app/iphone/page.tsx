import { ArrowDown, ArrowUpRight, AudioLines, Fingerprint, Smartphone, Sparkles } from 'lucide-react';
import { Nav, Footer, Face } from '../components';

const ipa = '/releases/iphone/Iris-iPhone-1.1.ipa';
const source = '/releases/iphone/Iris-iPhone-1.1-source.zip';

export default function IPhone() {
  return <><Nav/><main className="iphone-page section">
    <section className="phone-intro" aria-labelledby="phone-title">
      <div>
        <p className="phone-eyebrow">IRIS FOR IPHONE · PREVIEW 1.1</p>
        <h1 id="phone-title">One press.<br/><span>A familiar face.</span></h1>
        <p className="phone-lede">Call Iris with your Action Button. Speak your mind, get a hand, then let it slip quietly away.</p>
        <div className="phone-actions"><a className="button dark" href={ipa} download><ArrowDown size={18}/> Download iPhone IPA</a><a className="text-link" href="#install">How to install <ArrowDown size={15}/></a></div>
        <p className="phone-fine">iOS 18+ · Unsigned device build for sideloading<br/>Not an App Store or TestFlight download. Use Sideloadly or AltStore with a Mac or PC and your own Apple account.</p>
      </div>
      <div className="phone-story" aria-label="Illustration of Iris’s active Dynamic Island session">
        <div className="phone-island"><Face small/><span>Listening</span><AudioLines size={19}/></div>
        <p className="phone-story-label">A LITTLE COMPANY.<br/>ONLY WHEN YOU CALL.</p>
        <Face/>
        <h2>What’s on<br/>your mind?</h2>
        <div className="phone-wave"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        <span className="phone-story-note">Illustration · iOS controls the Island’s appearance</span>
      </div>
    </section>
    <section className="phone-features" aria-label="iPhone features">
      <article><Fingerprint/><h3>Your Action Button, now Iris.</h3><p>Choose Ask Iris in Island for voice or Show Iris in Island for a quiet appearance. Open App still opens the full app. Initial setup or unlock may be required; use the downloadable fallback if iOS blocks a background session.</p></article>
      <article><AudioLines/><h3>Talk naturally. Or type.</h3><p>Pause after your question to send it. Answers stream into chat, and voice questions get a spoken answer. Choose iPhone speech or Gemini voices with previews. Gemini voice uses Flash-Lite TTS, reads up to 900 characters, and sends at most two speech requests per answer.</p></article>
      <article><Sparkles/><h3>Quiet until you need it.</h3><p>A Live Activity shows session status in the Dynamic Island and on the Lock Screen, then ends. No always-on microphone or permanent Island decoration.</p></article>
    </section>
    <section className="phone-guide" id="install" aria-labelledby="install-title">
      <div className="phone-guide-heading"><p className="phone-eyebrow">THE NO-TESTFLIGHT ROUTE</p><h2 id="install-title">Make room for Iris.</h2><p>No paid Apple Developer membership is needed for personal sideloading. Downloading an IPA in Safari does <strong>not</strong> install it: your sideloader must sign it for your iPhone.</p></div>
      <div className="phone-install-routes" aria-label="Installation methods">
        <a href="#sideloadly"><strong>Sideloadly</strong><span>Fewer steps for a first install</span></a>
        <a href="#altstore"><strong>AltStore Classic</strong><span>Manage apps from your iPhone</span></a>
        <a href="#xcode-install"><strong>Xcode</strong><span>Build from source on a Mac</span></a>
      </div>
      <section id="sideloadly" className="phone-install-method" aria-labelledby="sideloadly-title">
        <p className="phone-eyebrow">SIMPLER FIRST-INSTALL OPTION</p>
        <h3 id="sideloadly-title">Drag, drop, meet Iris.</h3>
        <p>Sideloadly installs the IPA from your computer, without first installing an app store on your iPhone. This is the shorter route to try first; installation of this Iris build on a physical phone is still unverified.</p>
        <ol className="phone-steps">
          <li><span>01</span><div><h3>Get the tool and the IPA</h3><p>On your Mac or Windows PC, get <a href="https://sideloadly.io/">Sideloadly from its official website ↗</a> and <a href={ipa} download>download the Iris IPA</a>. Follow the installer’s platform requirements.</p></div></li>
          <li><span>02</span><div><h3>Connect your iPhone</h3><p>Connect it by USB, unlock it, and trust your computer if asked. Open Sideloadly, select that iPhone, then drop the Iris IPA onto the window.</p></div></li>
          <li><span>03</span><div><h3>Sign and install</h3><p>Enter your own Apple account in Sideloadly and complete its sign-in prompts. Use Apple ID sideloading. Keep the bundled <strong>IrisIsland</strong> extension—do not choose an option that removes extensions or PlugIns. Start installation and wait for completion.</p></div></li>
          <li><span>04</span><div><h3>Open Iris</h3><p>If iOS asks, trust your developer profile under <strong>Settings → General → VPN &amp; Device Management</strong>, and enable <strong>Settings → Privacy &amp; Security → Developer Mode</strong>. Open Iris, save your Gemini key, then follow the <a href="#action-button">Action Button steps below</a>.</p></div></li>
          <li><span>05</span><div><h3>Enable automatic refresh</h3><p>Turn on Sideloadly’s automatic app refresh. Leave its daemon available and keep your phone reachable by USB or configured Wi-Fi syncing. A free account’s signing lasts seven days; auto-refresh needs that computer connection. See the <a href="https://sideloadly.io/faq.html">official setup and refresh FAQ ↗</a>.</p></div></li>
        </ol>
        <p className="phone-method-note">No computer available? There is no verified computer-free installation route for this unsigned Iris build. Adding the Iris website to your Home Screen only bookmarks the website; it does not install the native assistant or its Dynamic Island extension.</p>
      </section>
      <div id="altstore" className="phone-install-method-heading"><p className="phone-eyebrow">ALTERNATIVE · ALTSTORE CLASSIC</p><h3>Prefer managing apps on your phone?</h3><p>Use the original AltStore route instead. Its initial setup still needs AltServer on a computer.</p></div>
      <ol className="phone-steps">
        <li><span>01</span><div><h3>Set up AltStore Classic</h3><p>Install <a href="https://altstore.io/">AltServer from the official AltStore website ↗</a> on your computer. Follow its <a href="https://faq.altstore.io/altstore-classic/how-to-install-altstore-macos">Mac guide</a> or <a href="https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows">Windows guide</a>. Use Classic, not PAL, for importing this IPA.</p></div></li>
        <li><span>02</span><div><h3>Connect and trust your iPhone</h3><p>Connect by cable, unlock the phone, and trust your computer when prompted. Install AltStore through AltServer using your own Apple account. Follow its instructions for Wi-Fi sync, trusting your developer profile, and Developer Mode. Enter account credentials only in the official tool or Apple’s prompts—never on the Iris website.</p></div></li>
        <li><span>03</span><div><h3>Download and sign Iris</h3><p><a href={ipa} download>Save Iris-iPhone-1.1.ipa</a> in Files on your iPhone. In AltStore, open <strong>My Apps → +</strong> and select it. If asked about app extensions, <strong>keep IrisIsland</strong>: it provides the Dynamic Island and Lock Screen views. Wait for signing and installation to finish.</p></div></li>
        <li><span>04</span><div><h3>Give Iris a voice and a brain</h3><p>Open Iris → Settings → AI and save an OpenAI or Gemini API key. Use Voice to choose Gemini speech if wanted; it needs a saved Gemini key even when chat uses OpenAI. Use Speak once to grant Microphone and Speech Recognition. Enable Live Activities in iPhone Settings. Saving keys does not send a paid test request.</p></div></li>
        <li id="action-button"><span>05</span><div><h3>Call the Island, not Open App</h3><p>In <strong>Shortcuts → + → Add Action</strong>, choose <strong>Ask Iris in Island</strong> for voice, or <strong>Show Iris in Island</strong> to show the avatar without recording. Do not choose Open App. Save the shortcut, then select it in <strong>Settings → Action Button → Shortcut</strong>. Your initial provider and microphone setup must be completed inside Iris.</p><p><a href="/shortcuts/Ask-Iris-in-Island.shortcut" download>Download the signed Island voice shortcut ↧</a> or get it from Iris → Settings → Shortcuts. This fallback opens a compact summon view, waits three seconds for recording to start, then returns to the Home Screen. Import it and review its four actions before adding it. It is not a zero-UI shortcut and may need a longer wait on a slow device. iOS may require unlock or foreground setup.</p></div></li>
        <li><span>06</span><div><h3>Keep it refreshed</h3><p>Free-account apps normally expire after seven days. Keep AltServer reachable and use <strong>AltStore → My Apps → Refresh All</strong> before expiry. Apple limits free accounts to three active sideloaded apps, including AltStore. Extensions also use App IDs. See <a href="https://faq.altstore.io/altstore-classic/your-altstore">AltStore’s refresh guide ↗</a>.</p></div></li>
      </ol>
    </section>
    <section className="phone-details" aria-label="Compatibility and troubleshooting">
      <div><Smartphone/><h2>A companion.<br/>Within iPhone’s rules.</h2><p>This is a separate early iPhone build, not the full Mac app. It has OpenAI and Gemini API-key chat connections, six themes, Gemini voice choices, selected-calendar and reminder-list context, selected contacts, PDF/text references, and separate Island shortcuts.</p><p>iOS does not allow Iris to draw freely over other apps, read their screens, control your phone, or run indefinitely inside the Island. The normal app stops recording when you leave it; a user-invoked Island session can continue with a visible Live Activity, for up to 30 seconds of input. iOS controls whether background start is allowed. Calendar and Reminders are read-only and only checked sources are shared. Mac accounts, files, Studio and connections are not synced. Account OAuth login is not enabled; this release uses API keys.</p><p>Dynamic Island hardware is required for the Island presentation. Other supported iPhones show the Live Activity on the Lock Screen. The Action Button is optional. A physical-device sideload and its provisioning have not yet been verified; device and simulator builds compile successfully.</p></div>
      <div className="phone-faq">
        <details><summary>I downloaded the IPA, but nothing installed.</summary><p>That is expected. This file is unsigned. Sign it for your own device with Sideloadly on a computer, import it into AltStore Classic, or build the source in Xcode. It is not an enterprise or one-tap Safari installation.</p></details>
        <details><summary>My sideloading tool rejects the app or its extension.</summary><p>Check your free App ID allowance and the exact provisioning error. Keep the Island extension. If your signing setup cannot provision it, the full build cannot be installed that way; use the Xcode source route below. Don’t remove the extension and expect the Island to work.</p></details>
        <details><summary>The shortcut opens the full app.</summary><p>Open App and iris://ask are foreground actions. Update to 1.1 and choose Ask Iris in Island or Show Iris in Island. The downloadable fallback briefly opens a compact summon view and returns Home; iOS does not allow a shortcut to turn off foreground and microphone restrictions.</p></details>
        <details><summary>Iris is missing from the Island.</summary><p>It is hidden when idle by design. Open Iris → Settings → Preview Dynamic Island to test a short session. Check Live Activities permissions and device compatibility. iOS may compress or move activities when other apps have active sessions.</p></details>
        <details id="xcode-install"><summary>Can I install from Xcode instead?</summary><p>Yes. <a href={source} download>Download the source project</a>, open Iris.xcodeproj on your Mac, and choose your own Personal Team under Signing &amp; Capabilities for <strong>both Iris and IrisIsland</strong>. Use unique bundle identifiers if needed, keeping the extension ID under the app’s ID. Connect your iPhone, select it as the run destination, and Run. Follow Apple’s device trust and Developer Mode prompts. Free-account expiry still applies.</p></details>
        <details><summary>Where does my information go?</summary><p>Provider API keys are stored separately in iPhone Keychain. Chat, recent conversation and checked connection excerpts go directly to the selected provider, Google or OpenAI. Gemini speech sends the text to read aloud to Google. Recognition may process audio with Apple. Calendar and Reminders are only read from checked calendars/lists. Contacts and files are chosen individually. The Island shows status, not private answer text.</p></details>
      </div>
    </section>
    <section className="phone-release" id="releases"><div><p className="phone-eyebrow">IPHONE RELEASE</p><h2>Preview 1.1</h2><p>Built by AriZe · iOS 18+ · ARM64 · Unsigned, for re-signing.<br/>No Apple signing identity or personal provisioning profile is included.</p></div><div className="phone-release-links"><a className="button dark" href={ipa} download><ArrowDown size={17}/> Download IPA</a><a className="text-link" href={source} download>Xcode source <ArrowDown size={15}/></a><a className="text-link" href="/releases/iphone/SHA256SUMS.txt">Verify checksums <ArrowUpRight size={15}/></a></div></section>
    <p className="phone-sources">Previous iPhone release: <a href="/releases/iphone/Iris-iPhone-1.0.ipa" download>1.0 IPA</a> · <a href="/releases/iphone/Iris-iPhone-1.0-source.zip" download>1.0 source</a></p>
    <p className="phone-sources">Setup references: <a href="https://support.apple.com/en-in/guide/shortcuts/apdfea15680b/ios">Apple Action Button guide</a> · <a href="https://support.apple.com/en-euro/guide/iphone/iph28f50d10d/ios">Apple Dynamic Island guide</a> · <a href="https://faq.altstore.io/altstore-classic/app-ids">AltStore App ID limits</a></p>
  </main><Footer/></>;
}
