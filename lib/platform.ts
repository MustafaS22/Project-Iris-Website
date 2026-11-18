export type DesktopPlatform = 'macos' | 'windows';

export function detectPlatform(userAgent: string, hint = '', touchPoints = 0): DesktopPlatform | null {
 if (/iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || (/Mac/i.test(hint) && touchPoints > 1)) return null;
 if (/Windows|Win32|Win64/i.test(hint+' '+userAgent)) return 'windows';
 if (/Macintosh|MacIntel|Mac OS X|macOS/i.test(hint+' '+userAgent)) return 'macos';
 return null;
}
export function requestedPlatform(search: string): DesktopPlatform | null {
 const value=new URLSearchParams(search).get('platform');
 return value==='macos'||value==='windows'?value:null;
}
export function releasePlatform(release:{platform?:string;version:string}):DesktopPlatform {
 return release.platform==='windows'||release.version.startsWith('windows-')?'windows':'macos';
}
