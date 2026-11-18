'use client';
import {useEffect,useState} from 'react';
import {detectPlatform,requestedPlatform,type DesktopPlatform} from '../lib/platform';
export function usePlatform() {
 const [platform,setPlatform]=useState<DesktopPlatform|null>(null);
 useEffect(()=>{
  const hint=(navigator as Navigator & {userAgentData?:{platform?:string}}).userAgentData?.platform??navigator.platform;
  setPlatform(requestedPlatform(location.search)??detectPlatform(navigator.userAgent,hint,navigator.maxTouchPoints));
 },[]);
 return platform;
}
