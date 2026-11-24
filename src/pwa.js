(function(root){
'use strict';
const $=s=>document.querySelector(s),version=$('meta[name=nat-version]').content,build=$('meta[name=nat-build]').content;
const base=new URL('./',location.href),state={version,build,ready:false,registration:null,available:null,locked:false};root.NatPWA=state;
let eligible=null,checking=null,deferredInstall=null,preparedBuild=null;
const text=(selector,value)=>{const el=$(selector);if(el)el.textContent=value;};
const panel=()=>{$('#pwa-panel').hidden=false;$('#pwa-open').setAttribute('aria-expanded','true');};
const message=msg=>text('#pwa-check-status',msg);
function safe(){try{return !document.querySelector('dialog[open]')&&root.NatApp?.isUpdateSafe?.()===true;}catch{return false;}}
function lock(){document.activeElement?.blur?.();state.locked=true;root.NatApp?.setUpdateLock?.(true);document.documentElement.classList.add('pwa-updating');}
function unlock(){state.locked=false;preparedBuild=null;root.NatApp?.setUpdateLock?.(false);document.documentElement.classList.remove('pwa-updating');}
function info(worker){return new Promise(resolve=>{if(!worker){resolve(null);return;}const c=new MessageChannel(),timer=setTimeout(()=>resolve(null),3500);c.port1.onmessage=e=>{clearTimeout(timer);c.port1.close();resolve(e.data);};try{worker.postMessage({type:'GET_BUILD'},[c.port2]);}catch{clearTimeout(timer);resolve(null);}});}
function valid(meta){return meta?.app==='nat-finance'&&/^[0-9a-f]{24}$/.test(meta.build)&&/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(meta.version)&&meta.schema===1;}
function newer(remote){const a=remote.version.split('.').map(Number),b=version.split('.').map(Number);for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}return remote.build!==build;}
async function remoteVersion(){const url=new URL('./version.json',base);url.searchParams.set('check',Date.now().toString());const r=await fetch(url,{cache:'no-store',credentials:'omit',redirect:'error',headers:{Accept:'application/json'}});if(!r.ok)throw Error('Não foi possível consultar a versão');const meta=await r.json();if(!valid(meta))throw Error('Metadados de versão inválidos');return meta;}
async function proveWaiting(meta){const worker=state.registration?.waiting,proof=await info(worker);if(!worker||!proof?.ready||proof.app!=='nat-finance'||proof.build!==meta.build||proof.version!==meta.version||proof.build===build)return false;state.available={...proof,worker,mode:'activate'};text('#pwa-update-title','Nova versão '+proof.version+' pronta para instalar');$('#pwa-update').hidden=false;return true;}
async function readiness(){const proof=await info(state.registration?.active);state.ready=!!(proof?.ready&&proof.build===build);text('#pwa-cache-status',state.ready?'Cache offline completo · dados financeiros locais.':'Cache offline ainda não confirmado. Mantenha a conexão e tente verificar novamente.');$('#pwa-cache-status').dataset.ready=String(state.ready);}
function waitForInstalled(ms=18000){return new Promise(resolve=>{const start=Date.now(),tick=()=>{if(state.registration.waiting||Date.now()-start>=ms){resolve();return;}setTimeout(tick,180);};tick();});}
async function check(manual=false){
 if(checking)return checking;
 checking=(async()=>{if(manual){panel();message('Verificando arquivos publicados…');}try{
  const meta=await remoteVersion();eligible=meta;
  if(!newer(meta)){$('#pwa-update').hidden=true;state.available=null;await state.registration?.update();await readiness();if(manual)message('Nenhuma nova versão disponível. Versão '+version+'.');return {status:'current'};}
  await state.registration.update();if(state.registration.installing)await waitForInstalled();
  if(await proveWaiting(meta)){if(manual)message('Nova versão verificada e armazenada para uso offline.');return {status:'available'};}
  const active=await info(state.registration.active);if(active?.ready&&active.build===meta.build&&active.build!==build){state.available={...active,mode:'reload'};$('#pwa-update').hidden=false;text('#pwa-update-title','Versão '+active.version+' pronta para carregar');return {status:'available'};}
  if(manual)message('Verificação não concluída: o pacote publicado ainda não está pronto ou falhou na integridade. A versão atual foi mantida.');return {status:'incomplete'};
 }catch{if(manual)message('Sem confirmação de nova versão. Confira a conexão e tente novamente. O aplicativo continua com a versão local.');return {status:'unavailable'};}finally{checking=null;}})();return checking;
}
async function apply(){
 if(!state.available)return;
 if(!safe()){text('#pwa-update-status','Conclua gravações, feche formulários e confirme ou limpe a prévia de importação antes de atualizar.');return;}
 const proof=state.available.mode==='activate'?await info(state.registration.waiting):await info(state.registration.active);
 if(!proof?.ready||proof.build!==state.available.build){text('#pwa-update-status','A versão disponível mudou. Verifique novamente.');return;}
 if(!safe()){text('#pwa-update-status','Existe trabalho aberto. Conclua a edição antes de atualizar.');return;}
 if(state.available.mode==='reload'){lock();location.reload();return;}
 text('#pwa-update-status','Conferindo todas as abas antes de atualizar…');state.registration.waiting.postMessage({type:'REQUEST_ACTIVATION'});
}
document.addEventListener('click',e=>{if(state.locked&&!e.target.closest('#pwa-system')){e.preventDefault();e.stopImmediatePropagation();}},true);
for(const event of ['keydown','beforeinput'])document.addEventListener(event,e=>{if(state.locked&&!e.target.closest?.('#pwa-system')){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('submit',e=>{if(state.locked){e.preventDefault();e.stopImmediatePropagation();}},true);
$('#pwa-open').addEventListener('click',()=>{const open=$('#pwa-panel').hidden;$('#pwa-panel').hidden=!open;$('#pwa-open').setAttribute('aria-expanded',String(open));});
$('#pwa-close').addEventListener('click',()=>{$('#pwa-panel').hidden=true;$('#pwa-open').setAttribute('aria-expanded','false');});
$('#pwa-check').addEventListener('click',()=>check(true));$('#pwa-apply').addEventListener('click',apply);$('#pwa-later').addEventListener('click',()=>{$('#pwa-update').hidden=true;});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;text('#pwa-install','Instalar aplicativo');});
$('#pwa-install').addEventListener('click',async()=>{if(deferredInstall){await deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;text('#pwa-install','Como instalar');}else{$('#pwa-install-help').hidden=false;$('#pwa-install-help').showModal();}});
$('#pwa-install-close').addEventListener('click',()=>{$('#pwa-install-help').close();$('#pwa-install-help').hidden=true;});
addEventListener('appinstalled',()=>{deferredInstall=null;text('#pwa-install','Aplicativo instalado');});
state.check=check;state.apply=apply;state.isSafe=safe;
if(!('serviceWorker'in navigator)||!root.isSecureContext||!/^https?:$/.test(location.protocol)){text('#pwa-cache-status','PWA requer HTTPS ou localhost. Use a versão HTML preservada para exportar seus dados.');return;}
navigator.serviceWorker.addEventListener('message',e=>{
 const d=e.data||{};if(d.type==='PREPARE_UPDATE'){const ready=safe();if(ready){preparedBuild=d.build;lock();}e.source?.postMessage({type:'UPDATE_VOTE',nonce:d.nonce,ready});}
 if(d.type==='UPDATE_ABORTED'){unlock();text('#pwa-update-status','Atualização adiada: existe outra aba com trabalho aberto, gravação ou sem confirmação. Feche-a ou conclua o trabalho e tente novamente.');}
});
navigator.serviceWorker.addEventListener('controllerchange',()=>{if(preparedBuild){location.reload();return;}readiness().catch(()=>{});});
(async()=>{try{
 state.registration=await navigator.serviceWorker.register(new URL('./sw.js',base),{scope:base.href,updateViaCache:'none'});
 const watch=worker=>{if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'){if(!navigator.serviceWorker.controller){navigator.serviceWorker.ready.then(readiness).catch(()=>{});}else if(eligible&&newer(eligible)){proveWaiting(eligible).catch(()=>{});}else check(false);}});};
 state.registration.addEventListener('updatefound',()=>watch(state.registration.installing));watch(state.registration.installing);
 if(state.registration.active)await readiness();else navigator.serviceWorker.ready.then(readiness).catch(()=>{});
 // First installation is never an update notification. A waiting worker must pass metadata/build checks.
 if(state.registration.waiting)await check(false);else if(navigator.serviceWorker.controller)check(false);
 addEventListener('online',()=>check(false));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&state.registration.active)check(false);});setInterval(()=>{if(document.visibilityState==='visible')check(false);},15*60*1000);
}catch{state.ready=false;text('#pwa-cache-status','Não foi possível preparar o cache offline. Seus dados continuam locais; verifique a conexão e reabra o aplicativo.');}})();
})(globalThis);
