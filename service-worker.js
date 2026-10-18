const CACHE='boki1-commute-kaihou-v11.1';
const ASSETS=["./", "./index.html", "./styles.css?v=11.1", "./app.js?v=11.1", "./questions-foundation.js?v=11.1", "./questions-advanced.js?v=11.1", "./questions-applied-v6.js?v=11.1", "./questions-kaihou-master.js?v=11.1", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('boki1-commute-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response;}
  catch{return (await cache.match(req))||(req.mode==='navigate'?await cache.match('./index.html'):undefined)||Response.error();}
 })());
});
