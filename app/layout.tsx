import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL('https://projectiris.lovelyabbey.chatgpt.site'), title:{default:'Iris — Your computer. Now with company.',template:'%s · Iris by AriZe'},description:'Meet Iris, your personal AI assistant for your computer. Available for macOS and as a Windows 1.0 test edition. Talk, create, learn and get help on your computer. Made by AriZe.',icons:{icon:'/favicon.svg'},openGraph:{title:'Meet Iris, your computer’s new companion.',description:'A personal AI assistant. Right where you need it.',images:['/images/desktop.png']} };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
