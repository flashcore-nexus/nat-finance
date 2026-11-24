(function(root){
'use strict';
const E=root.NatEngine;
const Storage={db:null,mode:'memory',state:null,
 async init(){
  try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('nat_finance_offline',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Banco bloqueado por outra janela.'));});this.db.onversionchange=()=>{this.db.close();location.reload();};this.state=await new Promise((resolve,reject)=>{const t=this.db.transaction('state','readonly'),r=t.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});this.mode='indexeddb';}
  catch(error){console.warn('IndexedDB indisponível',error);try{const key='nat_finance_probe';localStorage.setItem(key,'ok');if(localStorage.getItem(key)!=='ok')throw Error();localStorage.removeItem(key);const saved=localStorage.getItem('nat_finance_state');this.state=saved?JSON.parse(saved):null;this.mode='localstorage';}catch{this.mode='memory';}}
  if(this.state){E.assert(this.state.version===E.VERSION&&Number.isSafeInteger(this.state.revision)&&Array.isArray(this.state.profiles)&&this.state.profiles.length>0&&new Set(this.state.profiles.map(p=>p.id)).size===this.state.profiles.length,'Dados locais incompatíveis. Não foram sobrescritos.');for(const p of this.state.profiles)E.validate(p);}else{this.state=E.initial();await this.save(this.state,true);}return this.state;
 },
 async save(next,first=false){
  for(const p of next.profiles)E.validate(p);
  const expected=next.revision;const data=E.clone(next);data.revision=first?0:expected+1;
  if(this.mode==='indexeddb')await new Promise((resolve,reject)=>{const t=this.db.transaction('state','readwrite'),s=t.objectStore('state'),r=s.get('main');let conflict=false;r.onsuccess=()=>{if(first&&r.result||!first&&r.result?.revision!==expected){conflict=true;t.abort();return;}s.put(data,'main');};t.oncomplete=resolve;t.onerror=()=>reject(t.error||Error('Falha ao salvar.'));t.onabort=()=>reject(Error(conflict?'Outra janela alterou os dados. Recarregue esta página antes de continuar.':'Operação cancelada: os dados não foram gravados.'));});
  else if(this.mode==='localstorage'){const raw=localStorage.getItem('nat_finance_state'),old=raw?JSON.parse(raw):null;E.assert(first||!old||old.revision===expected,'Outra janela alterou os dados. Recarregue a página.');localStorage.setItem('nat_finance_state',JSON.stringify(data));}
  this.state=data;return data;
 }
};root.NatStorage=Storage;
})(globalThis);
