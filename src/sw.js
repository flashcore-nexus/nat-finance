'use strict';
/* BUILD_CONSTANTS */
const base=self.registration.scope,prefix='nat-finance:'+base+':',cacheName=prefix+BUILD;
const indexURL=new URL('./index.html',base).href;
const urls=new Map(Object.entries(FILES).map(([p,h])=>[new URL(p,base).href,h]));
// Browsers activate waiting workers after the last tab closes, even without skipWaiting.
// Reject a semantic downgrade during installation as well as hiding it in the UI.
async function preventDowngrade(){
 const active=self.registration.active;if(!active)return;
 const proof=await new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Versão ativa não respondeu'));},4000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};active.postMessage({type:'GET_BUILD'},[channel.port2]);});
 if(proof?.app!=='nat-finance'||!/^\d+\.\d+\.\d+$/.test(proof.version))throw Error('Versão ativa não reconhecida');
 const next=VERSION.split('.').map(Number),old=proof.version.split('.').map(Number);for(let i=0;i<3;i++){if(next[i]<old[i])throw Error('Retrocesso de versão bloqueado');if(next[i]>old[i])break;}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(cacheName);
 try{
  await preventDowngrade();
  const response=await fetch(new URL('./version.json',base),{cache:'no-store',credentials:'omit'});if(!response.ok)throw Error('Metadados da versão indisponíveis');const remote=await response.json();if(remote.app!=='nat-finance'||remote.build!==BUILD||remote.version!==VERSION)throw Error('Publicação em andamento ou versão divergente');
  for(const [url,expected]of urls){const r=await fetch(url,{cache:'no-store',credentials:'omit',redirect:'error'});if(!r.ok)throw Error('Recurso indisponível');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await r.clone().arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==expected)throw Error('Integridade divergente');await cache.put(url,r);}
 }catch(error){await caches.delete(cacheName);throw error;}
 // No skipWaiting: a later release can replace active code only after user approval and tab votes.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==cacheName)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(base))return;
 if(u.pathname===new URL('./version.json',base).pathname||u.pathname===new URL('./sw.js',base).pathname){event.respondWith(fetch(r,{cache:'no-store'}));return;}
 const clean=new URL(u.href);clean.search='';clean.hash='';
 if(r.mode==='navigate'&&(clean.href===base||clean.href===indexURL)){event.respondWith(caches.open(cacheName).then(async c=>(await c.match(indexURL))||new Response('Cache offline incompleto. Reabra conectado.',{status:503})));return;}
 if(urls.has(clean.href))event.respondWith(caches.open(cacheName).then(async c=>(await c.match(clean.href))||new Response('Recurso offline ausente. Reabra conectado.',{status:503})));
 // Arbitrary JSON, user files, API requests and resources from other apps are never cached.
});
let round=null;
const clientsInScope=async()=> (await self.clients.matchAll({type:'window',includeUncontrolled:true})).filter(c=>c.url.startsWith(base));
self.addEventListener('message',event=>{
 const d=event.data||{};
 if(d.type==='GET_BUILD'){event.waitUntil((async()=>{const c=await caches.open(cacheName),keys=new Set((await c.keys()).map(r=>r.url));event.ports[0]?.postMessage({app:'nat-finance',build:BUILD,version:VERSION,ready:[...urls.keys()].every(u=>keys.has(u))});})());return;}
 if(d.type==='UPDATE_VOTE'&&round?.nonce===d.nonce&&round.clients.has(event.source?.id)){round.votes.set(event.source.id,d.ready===true);if(round.votes.size===round.clients.size)round.resolve();return;}
 if(d.type!=='REQUEST_ACTIVATION'||round)return;
 event.waitUntil((async()=>{
  const clients=await clientsInScope();if(!clients.some(c=>c.id===event.source?.id))return;let resolve;const wait=new Promise(ok=>resolve=ok);round={nonce:crypto.randomUUID(),clients:new Set(clients.map(c=>c.id)),votes:new Map(),resolve};
  try{for(const c of clients)c.postMessage({type:'PREPARE_UPDATE',nonce:round.nonce,build:BUILD});await Promise.race([wait,new Promise(ok=>setTimeout(ok,4500))]);const current=await clientsInScope();if(current.every(c=>round.votes.get(c.id)===true))await self.skipWaiting();else for(const c of current)c.postMessage({type:'UPDATE_ABORTED',build:BUILD});}
  catch{for(const c of await clientsInScope())c.postMessage({type:'UPDATE_ABORTED',build:BUILD});}
  finally{round=null;}
 })());
});
