(function(root){
'use strict';
const E=root.NatEngine;
let active=null;
const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function assets(){const el=document.querySelector('#nat-ocr-assets');E.assert(el,'Os modelos OCR não estão incluídos neste aplicativo.');if(el.dataset.src){const url=new URL(el.dataset.src,location.href);E.assert(url.origin===location.origin,'Origem de modelos OCR inválida.');const r=await fetch(url,{credentials:'omit'});E.assert(r.ok,'Modelos OCR indisponíveis. Prepare o cache offline conectado e tente novamente.');return r.json();}return JSON.parse(el.textContent);}
function cancel(){if(active){active.cancelled=true;active.worker?.terminate();active.reject?.(Error('OCR cancelado. Nenhum lançamento foi gravado.'));}}
function wait(p,job,ms=120000){return new Promise((resolve,reject)=>{job.reject=reject;const timer=setTimeout(()=>{job.worker?.terminate();reject(Error('OCR excedeu o tempo de processamento. Tente um documento menor ou transcreva os dados.'));},ms);p.then(resolve,reject).finally(()=>{clearTimeout(timer);job.reject=null;});});}
async function session(run,progress=()=>{}){
 E.assert(!active,'Já existe um OCR em andamento.');E.assert(root.Worker&&root.WebAssembly&&root.Tesseract,'Este navegador não suporta o OCR local. Use a transcrição manual.');
 const job={cancelled:false,worker:null,reject:null};active=job;let url;
 try{
  progress({status:'Carregando modelos OCR locais',progress:0});const data=await assets(),workerCode=new TextDecoder().decode(decode(data.worker));
  // Serve the real embedded model bytes from worker memory. No URL is requested from a server.
  const memoryModels=`const natModels=${JSON.stringify({por:data.por,eng:data.eng})};globalThis.fetch=async function(url){const name=String(url).split('/').pop();const code=name==='por.traineddata.gz'?'por':name==='eng.traineddata.gz'?'eng':null;if(!String(url).startsWith('nat-ocr://models/')||!code)throw Error('OCR: acesso de rede desativado');return new Response(Uint8Array.from(atob(natModels[code]),c=>c.charCodeAt(0)),{status:200});};\n`;
  url=URL.createObjectURL(new Blob([memoryModels,workerCode],{type:'text/javascript'}));
  const ready=root.Tesseract.createWorker('por+eng',1,{langPath:'nat-ocr://models',workerPath:url,workerBlobURL:false,cacheMethod:'none',gzip:true,logger:m=>progress({status:({'loading tesseract core':'Preparando motor OCR','initializing tesseract':'Inicializando OCR','loading language traineddata':'Lendo modelos de idioma','initializing api':'Preparando português e inglês','recognizing text':'Reconhecendo texto'}[m.status]||'Processando OCR local'),progress:m.progress||0}),errorHandler:e=>job.reject?.(Error(String(e).slice(0,400)))});
  ready.then(w=>{job.worker=w;if(job.cancelled)w.terminate();}).catch(()=>{});job.worker=await wait(ready,job);if(job.cancelled)throw Error('OCR cancelado.');
  await job.worker.setParameters({preserve_interword_spaces:'1',tessedit_pageseg_mode:'6'});
  const recognize=async canvas=>{if(job.cancelled)throw Error('OCR cancelado.');const result=await wait(job.worker.recognize(canvas,{}, {text:true}),job,90000);return {text:result.data.text.trim(),confidence:result.data.confidence};};
  return await run(recognize,job);
 }catch(error){throw Error('OCR local: '+(error?.message||String(error)));}
 finally{await job.worker?.terminate().catch(()=>{});if(url)URL.revokeObjectURL(url);active=null;}
}
async function imageCanvas(blob){
 const url=URL.createObjectURL(blob);try{const img=new Image();img.src=url;await img.decode();E.assert(img.naturalWidth>0&&img.naturalHeight>0,'Imagem sem dimensões válidas.');E.assert(img.naturalWidth*img.naturalHeight<=40e6,'Imagem muito grande. Reduza para até 40 megapixels.');const max=3000,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas;}finally{URL.revokeObjectURL(url);}}
async function image(blob,progress){const canvas=await imageCanvas(blob);try{return await session(async recognize=>({...await recognize(canvas),pages:1,ocrPages:[1]}),progress);}finally{canvas.width=canvas.height=0;}}
async function pdf(bytes,{pages,progress=()=>{}}={}){
 const task=root.pdfjsLib.getDocument({data:new Uint8Array(bytes.slice(0)),isEvalSupported:false,useWasm:false,useSystemFonts:true,useWorkerFetch:false,disableFontFace:true,verbosity:0});let doc;
 try{doc=await task.promise;const requested=pages?.length?pages:Array.from({length:doc.numPages},(_,i)=>i+1);E.assert(requested.length<=10,'Selecione no máximo 10 páginas sem texto por operação OCR. Divida PDFs maiores antes de importar.');E.assert(requested.every(n=>Number.isInteger(n)&&n>=1&&n<=doc.numPages),'Página OCR inválida.');
  return await session(async recognize=>{const results=[];for(const n of requested){progress({status:`Preparando página ${n} de ${doc.numPages}`,progress:0});const page=await doc.getPage(n),base=page.getViewport({scale:1}),scale=Math.min(2.5,3000/Math.max(base.width,base.height)),viewport=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);try{await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'white'}).promise;results.push({page:n,...await recognize(canvas)});}finally{page.cleanup();canvas.width=canvas.height=0;}}return {results,text:results.map(r=>r.text).join('\n'),confidence:results.reduce((a,r)=>a+r.confidence,0)/results.length,pages:doc.numPages,ocrPages:requested};},progress);
 }finally{if(doc)await doc.destroy();else await task.destroy();}
}
root.NatOCR={image,pdf,cancel};
})(globalThis);
