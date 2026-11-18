export function updateMetadata(value: {build?: unknown; signature?: unknown}) {
 const build=String(value.build??'').trim(),signature=String(value.signature??'').trim();
 if(!build&&!signature)return undefined;
 if(!/^[1-9]\d{0,8}(?:\.\d{1,6}){0,2}$/.test(build)||!/^[A-Za-z0-9+/]{86}==$/.test(signature))throw Error('Enter a valid build number and 64-byte Sparkle update signature, or leave both blank.');
 return {irisBuild:build,irisEdSignature:signature};
}
const xml=(text:unknown)=>String(text??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export function appcast(origin:string,release:any,metadata?:Record<string,string>) {
 const signed=release&&!String(release.version).startsWith('windows-')&&metadata&&updateMetadata({build:metadata.irisBuild,signature:metadata.irisEdSignature});
 // Legacy unsigned downloads remain available on the website, never as installable updates.
 const item=signed?`<item><title>Iris ${xml(release.version)}</title><sparkle:version>${xml(signed.irisBuild)}</sparkle:version><sparkle:shortVersionString>${xml(release.version)}</sparkle:shortVersionString><sparkle:minimumSystemVersion>${xml(release.minimum)}</sparkle:minimumSystemVersion><pubDate>${new Date(release.created).toUTCString()}</pubDate><description>${xml(release.notes)}</description><enclosure url="${xml(origin+'/api/download/'+encodeURIComponent(release.id))}" sparkle:edSignature="${xml(signed.irisEdSignature)}" length="${Number(release.size)}" type="application/octet-stream"/></item>`:'';
 return `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"><channel><title>Iris by AriZe</title><link>${xml(origin+'/releases')}</link><description>Signed Iris macOS updates</description><language>en</language>${item}</channel></rss>`;
}
