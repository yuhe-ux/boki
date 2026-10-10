const CACHE='boki1-commute-all-sources-v3';
const ASSETS=['./','./index.html','./styles.css','./app.js','./questions-cpa-part1.js','./questions-cpa-all.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('boki1-commute-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(e.request.mode==='navigate'){
   try{const fresh=await fetch(e.request);if(fresh.ok)await cache.put(e.request,fresh.clone());return fresh;}catch{return await cache.match('./index.html')||Response.error();}
  }
  return (await cache.match(e.request)) || (async()=>{const resp=await fetch(e.request);if(resp.ok)await cache.put(e.request,resp.clone());return resp;})();
 })());
});
