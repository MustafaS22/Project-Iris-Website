export const PART_SIZE = 8 * 1024 * 1024;
export const MAX_SIZE = 2 * 1024 * 1024 * 1024;
export function releaseFields(value: any) {
 const platform = value.platform === 'windows' ? 'windows' : 'macos';
 const inputVersion = String(value.version ?? '').trim();
 if(platform === 'windows' && !['1.0','1.0.0'].includes(inputVersion)) throw new Error('Enter Windows version 1.0; this edition is frozen.');
 const version = platform === 'windows' ? 'windows-1.0' : inputVersion;
 if(platform === 'macos' && version.startsWith('windows-')) throw new Error('Choose a Windows installer for a Windows release.');
 const minimum = String(value.minimum ?? '').trim();
 const notes = String(value.notes ?? '').trim();
 const size = Number(value.size);
 if (!/^[a-zA-Z0-9][a-zA-Z0-9.\-+]{0,39}$/.test(version)) throw new Error('Enter a version such as 1.0 or 1.1-beta.');
 if (!/^\d{1,2}\.\d{1,2}(\.\d{1,2})?$/.test(minimum)) throw new Error('Enter the minimum macOS version, such as 15.0.');
 if (!notes || notes.length > 5000) throw new Error('Release notes must contain 1–5,000 characters.');
 if (!Number.isSafeInteger(size) || size < 512 || size > MAX_SIZE) throw new Error('Choose an installer between 512 bytes and 2 GB.');
 const update=platform==='macos'?updateMetadata(value):undefined;
 return { version, minimum, notes, size, platform, update };
}
export function validDmgFooter(bytes: Uint8Array) { return bytes.length === 512 && String.fromCharCode(...bytes.slice(0,4)) === 'koly'; }
export function sameOrigin(request: Request) {
 return request.headers.get('origin') === new URL(request.url).origin;
}
import {updateMetadata} from './appcast';
