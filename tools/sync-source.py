"""Create deterministic, credential-free public source snapshots and optionally push them.
Source directories are read-only. Config contains local paths, never access tokens.
"""
from pathlib import Path
import argparse,hashlib,json,re,shutil,subprocess

SKIP_DIRS={'.git','.agents','.codex','.build','build','release-build','node_modules','dist','out','packaging','SourcePackages','xcuserdata','.next','.vinext','.wrangler','.sites-runtime','coverage','__pycache__','Source Material'}
SKIP_NAMES={'.DS_Store','GoogleOAuth.json','ReleaseSigning.json','state.json','agents.json','knowledge.sqlite','knowledge.sqlite-shm','knowledge.sqlite-wal','next-env.d.ts','skills-lock.json'}
SKIP_EXT={'.log','.dmg','.ipa','.exe','.app','.p12','.pfx','.pem','.key','.mobileprovision','.xcuserstate','.tsbuildinfo','.pyc'}
SECRET=re.compile(r'GOCSPX-[A-Za-z0-9_-]{15,}|sk-proj-[A-Za-z0-9_-]{15,}|github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')
IGNORE='''# Generated builds and dependencies
**/node_modules/
**/.build/
**/build/
**/release-build/
**/dist/
**/outputs/
**/packaging/
**/*.app/
**/Vendor/Sparkle/
**/.next/
**/.vinext/
**/.wrangler/
**/.sites-runtime/
**/xcuserdata/
**/SourcePackages/
**/__pycache__/
*.log
*.tsbuildinfo
*.xcuserstate
*.dmg
*.ipa
*.exe
.DS_Store
# Local credentials and personal data
.env*
!.env.example
.dev.vars*
*.pem
*.key
*.p12
*.pfx
*.mobileprovision
**/GoogleOAuth.json
**/ReleaseSigning.json
**/state.json
**/knowledge.sqlite*
**/.iris-sync.local.json
'''

def accepted(path,relative):
    return not path.is_symlink() and not any(part in SKIP_DIRS for part in relative.parts) and path.name not in SKIP_NAMES and path.suffix not in SKIP_EXT and not path.name.startswith(('.env','.dev.vars')) and not path.name.startswith('validation')

def sync(config,kind,push=False,version=None):
    repo=Path(config['app_repo' if kind=='apps' else 'website_repo']).resolve();repo.mkdir(parents=True,exist_ok=True)
    files={}
    def put(relative,body):
        rel=Path(relative)
        if rel.is_absolute() or '..' in rel.parts or '.git' in rel.parts:raise RuntimeError('Unsafe snapshot path')
        if isinstance(body,str):body=body.encode()
        if len(body)<5_000_000:
            text=body.decode('utf8',errors='ignore')
            if SECRET.search(text):raise RuntimeError('Credential detected in '+str(rel)+'; publication stopped')
        files[rel.as_posix()]=body
    def copy(source,destination):
        source=Path(source)
        if source.is_file():
            candidates=[(source,Path(source.name))]
        else:
            candidates=[(p,p.relative_to(source)) for p in source.rglob('*') if p.is_file()]
        for p,rel in candidates:
            if accepted(p,rel):
                body=p.read_bytes()
                if p.suffix in {'.md','.txt','.swift','.json','.ts','.tsx','.py','.plist','.xcproj','.pbxproj'}:
                    text=body.decode('utf8',errors='strict')
                    text=text.replace('legendary22mb@gmail.com','admin@example.invalid').replace('legendary22mb@icloud.com','developer@example.invalid')
                    text=text.replace('/Users/mustafasherwala/Documents/Codex/2026-10-31/b','<IRIS_WORKSPACE>').replace('/Users/mustafasherwala/Documents/Project IRIS','<IRIS_MAC_SOURCE>')
                    body=text.encode()
                put(Path(destination)/(rel if source.is_dir() else ''),body)
    if kind=='apps':
        mac=Path(config['macos'])
        for name in ['Project IRIS','Project IRIS.xcodeproj','IrisCoreTests','Configuration','Documentation','DESIGN.md','PRODUCT.md']:
            copy(mac/name,Path('macOS')/name)
        for name in ['App','Shared','Island','Iris.xcodeproj','Tests','README.md','generate_project.py']:copy(Path(config['ios'])/name,Path('iOS')/name)
        for name in ['src','assets','test','package.json','package-lock.json','icon-hook.cjs','README.md','AGENTS.md']:copy(Path(config['windows'])/name,Path('windows')/name)
        project=(mac/'Project IRIS.xcodeproj/project.xcproj').read_text();current=re.search(r'"MARKETING_VERSION"\s*:\s*"([^"]+)"',project).group(1)
        workspace=Path(config['app_repo']).parent
        signer=workspace/'sign-iris-release.py'
        packager=workspace/'package-current-iris.py'
        if signer.exists():
            body=signer.read_text().replace("Path(__file__).resolve().parent / 'iris-references'","Path(__file__).resolve().parents[1] / 'macOS'")
            put('tools/sign-iris-release.py',body)
        if packager.exists():
            body=packager.read_text().replace("stage=root/'work/iris-references'","stage=root/'macOS'").replace("root/'work/sign-iris-release.py'","root/'tools/sign-iris-release.py'").replace("root/'work/sync-iris-github.py'","root/'tools/sync-source.py'").replace("root/'work/iris-github-sync.json'","root/'.iris-sync.local.json'")
            body=body.replace("tool=stage/'Vendor/Sparkle/bin/sign_update'","tool=stage/'release-build/SourcePackages/artifacts/sparkle/Sparkle/bin/sign_update'\n if not tool.exists(): tool=stage/'Vendor/Sparkle/bin/sign_update'")
            put('tools/package-release.py',body)
        put('README.md',f'''# Iris by AriZe

A personal AI assistant for your computer: conversation, voice, knowledge, screen guidance, drafting, creation and background agents.

- **macOS {current}**: the primary, actively developed app. Open `macOS/Project IRIS.xcodeproj` in Xcode 27.2 or later; Apple Silicon, macOS 15+.
- **iPhone 1.1 preview**: a separate iOS 18+ companion. See [its guide](iOS/README.md).
- **Windows 1.0**: a frozen, unsigned test edition, with feature differences and no claim of full Mac parity. See [its guide](windows/README.md).
- **Website**: maintained separately at [Project-Iris-Website](https://github.com/MustafaS22/Project-Iris-Website).

[Download Iris](https://projectiris.lovelyabbey.chatgpt.site/download) · [Release notes](https://projectiris.lovelyabbey.chatgpt.site/releases)

## Build and test

Choose your own Apple signing team in Xcode. Sparkle 2.10.1 resolves through Swift Package Manager. Run core checks with `swift test --package-path macOS/IrisCoreTests` and `swift test --package-path iOS/Tests`; Windows unit checks use `npm ci` then `npm test` in `windows/`.

Google sign-in needs your own OAuth registration. Copy `macOS/Configuration/GoogleOAuth.example.json` to `macOS/Project IRIS/GoogleOAuth.json` and configure your registered desktop client. The real OAuth configuration, API keys, user memory/knowledge, signing private keys, profiles, local build outputs and downloaded reference projects are intentionally excluded.

## Release updates

Public source is synchronized at release time. The maintainers use `tools/sync-source.py` with a local path configuration; see `tools/sync-config.example.json`. `SOURCE_MANIFEST.json` records the exact public source snapshot. Signing keys stay in macOS Keychain. Source synchronization never changes the working app or user data.

## Credits and licensing

Developed by **AriZe**. Existing third-party attribution and asset licenses remain with their corresponding files. No additional blanket open-source license is granted by this repository.
''')
        put('macOS/Configuration/GoogleOAuth.example.json',json.dumps({'installed':{'client_id':'YOUR_DESKTOP_CLIENT_ID.apps.googleusercontent.com','project_id':'YOUR_GOOGLE_PROJECT_ID','auth_uri':'https://accounts.google.com/o/oauth2/auth','token_uri':'https://oauth2.googleapis.com/token','client_secret':'YOUR_DESKTOP_CLIENT_SECRET','redirect_uris':['http://127.0.0.1']}},indent=2))
        put('macOS/Configuration/ReleaseSigning.example.json',json.dumps({'identity':'YOUR_APPLE_CODE_SIGNING_IDENTITY_SHA1','account':'YOUR_LOCAL_SPARKLE_KEYCHAIN_ACCOUNT','publicKey':'YOUR_SPARKLE_PUBLIC_ED25519_KEY'},indent=2))
        put('AGENTS.md','''# Iris source maintenance
macOS is the primary platform. Generic app requests apply to macOS only. Windows remains frozen at 1.0 unless explicitly requested. The iPhone companion is separate.

Keep this repository current whenever a Mac release is made. Sync the tested current source, check the public-source audit, commit and push, and tag the matching version as macos-v<VERSION>. Update the website in the separate Project-Iris-Website repository. Never upload private keys, real OAuth secrets, tokens, user files, user data, local logs or generated app installers. Keep original third-party credits. Do not promise permission retention or Windows/device verification without evidence.
''')
    else:
        source=Path(config['website'])
        for p in source.iterdir():
            if accepted(p,Path(p.name)) and p.name not in {'.openai','README.md','AGENTS.md','SOURCE_MANIFEST.json'}:copy(p,p.name)
        put('README.md','''# Iris Website by AriZe

The official Iris website: homepage, device-aware downloads, separate Mac/Windows release histories, Google-authenticated release desk, and signed Sparkle update feed.

[Live website](https://projectiris.lovelyabbey.chatgpt.site) · [App source](https://github.com/MustafaS22/Project-Iris)

## Development

Node 24+ is recommended. Run `npm ci`, then `npm run dev`. Type-check with `npx tsc --noEmit`; focused checks use `node --experimental-strip-types tests/platforms.mjs` and `node --experimental-strip-types tests/appcast.mjs`. Build with `npm run build`.

Production is a Cloudflare Worker with D1 binding `DB` and R2 binding `BUCKET`. Configure your own Google OAuth client, admin email and session secret as server environment variables. Real runtime secrets and production hosting identity are not included. The fallback admin address in this public source is a placeholder. Create your own hosting project from `.openai/hosting.example.json`; preserve the existing owner's deployment when using the internal working copy.

Generated installers (`.dmg`, `.exe`, `.ipa`) and dependency/build folders are not source files and are excluded. Restore desired legacy/iPhone download assets separately or update their URLs; current Mac/Windows releases are served from R2 by the release desk. Existing public downloads remain on the live website.

## Maintenance

This repository is a public source mirror. After publishing a website update, synchronize the tested source, audit, commit and push it here. `SOURCE_MANIFEST.json` identifies the snapshot; `tools/sync-source.py` is the repeatable maintainer tool. App code lives in the separate Project-Iris repository.

Developed by **AriZe**. Third-party notices retain their original terms; no additional blanket source license is granted.
''')
        put('.openai/hosting.example.json',json.dumps({'project_id':'YOUR_SITE_PROJECT_ID','d1':'DB','r2':'BUCKET'},indent=2))
        put('AGENTS.md','''# Iris website maintenance
This is the website repository. App code belongs in MustafaS22/Project-Iris. Keep macOS and Windows release histories separate, detect the visitor's platform while keeping both downloads accessible, and retain older downloads and the signed update feed.

After any published website source change, sync the tested source to this repository, audit for credentials and user data, commit and push main. Never commit server secrets, actual OAuth secrets, private signing keys, local caches, production hosting credentials or installer binaries. Preserve existing app-release records and platform policies.
''')
    put('.gitignore',IGNORE)
    put('tools/sync-source.py',Path(__file__).read_bytes())
    put('tools/sync-config.example.json',json.dumps({'macos':'/path/to/Project IRIS','ios':'/path/to/iris-iphone','windows':'/path/to/iris-windows-v1','website':'/path/to/website-working-copy','app_repo':'/path/to/Project-Iris','website_repo':'/path/to/Project-Iris-Website'},indent=2))
    manifest=repo/'SOURCE_MANIFEST.json'
    previous=json.loads(manifest.read_text()).get('files',{}) if manifest.exists() else {}
    for relative in set(previous)-set(files):
        p=repo/relative
        if p.resolve().is_relative_to(repo) and '.git' not in p.parts and p.is_file():p.unlink()
    for relative,body in files.items():
        p=repo/relative;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(body)
    manifest.write_text(json.dumps({'files':{name:hashlib.sha256(body).hexdigest() for name,body in sorted(files.items())}},indent=2)+'\n')
    if not (repo/'.git').exists():subprocess.run(['git','init','-b','main',str(repo)],check=True,stdout=subprocess.DEVNULL)
    remote='https://github.com/MustafaS22/'+('Project-Iris' if kind=='apps' else 'Project-Iris-Website')+'.git'
    if subprocess.run(['git','-C',str(repo),'remote','get-url','origin'],capture_output=True).returncode:subprocess.run(['git','-C',str(repo),'remote','add','origin',remote],check=True)
    if push:
        subprocess.run(['git','-C',str(repo),'add','--all'],check=True)
        if subprocess.run(['git','-C',str(repo),'diff','--cached','--quiet']).returncode:
            subprocess.run(['git','-C',str(repo),'commit','-m',('Sync Iris '+version+' release source' if version else 'Sync current Iris '+kind+' source')],check=True)
        subprocess.run(['git','-C',str(repo),'push','-u','origin','main'],check=True)
        if version and kind=='apps':
            tag='macos-v'+version
            exists=subprocess.run(['git','-C',str(repo),'rev-parse','--verify','refs/tags/'+tag],capture_output=True).returncode==0
            if not exists:subprocess.run(['git','-C',str(repo),'tag','-a',tag,'-m','Iris macOS '+version],check=True)
            subprocess.run(['git','-C',str(repo),'push','origin',tag],check=True)
    print(kind+': '+str(len(files))+' audited source files prepared')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--config',type=Path,required=True);parser.add_argument('--apps',action='store_true');parser.add_argument('--website',action='store_true');parser.add_argument('--push',action='store_true');parser.add_argument('--version');args=parser.parse_args();cfg=json.loads(args.config.read_text())
    if args.apps or not args.website:sync(cfg,'apps',args.push,args.version)
    if args.website or not args.apps:sync(cfg,'website',args.push,args.version)
