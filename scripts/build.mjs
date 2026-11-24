import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function moduleClassic(file,name){let s=read(file),ex=s.match(/export \{([^}]+)\};/g)?.at(-1);if(!ex)throw Error('Export ausente: '+file);s=s.replace(ex,`globalThis.${name}={${ex.match(/\{([^}]+)\}/)[1].replace(/(\w+)\s+as\s+(\w+)/g,'$2:$1')}};`).replace(/import\.meta\.url/g,'document.baseURI').replace(/\/\/# sourceMappingURL=.*$/gm,'');return '(function(){\n'+s+'\n})();';}
export function build({out=path.join(root,'dist'),version=JSON.parse(read('package.json')).version}={}){
 fs.mkdirSync(out,{recursive:true});const files={};
 const put=(name,body)=>{const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);files['./'+name]=sha(bytes);return './'+name;};
 const asset=(name,body,ext)=>put(`assets/${name}.${sha(body).slice(0,16)}.${ext}`,body);
 const css=asset('styles',read('src/styles.css')+'\n'+read('src/minimal.css')+'\n'+read('src/pwa.css'),'css');
 const vendor=asset('vendor',read('vendor/ocr/tesseract.min.js')+'\n'+read('vendor/jszip.min.js')+'\n'+moduleClassic('vendor/pdf.worker.mjs','pdfjsWorker')+'\n'+moduleClassic('vendor/pdf.mjs','pdfjsLib'),'js');
 const b64=p=>fs.readFileSync(path.join(root,p)).toString('base64');
 const ocr=asset('ocr-assets',JSON.stringify({worker:Buffer.from(read('vendor/ocr/core.wasm.js')+'\n'+read('vendor/ocr/worker.min.js')).toString('base64'),por:b64('vendor/ocr/por.traineddata.gz'),eng:b64('vendor/ocr/eng.traineddata.gz')}),'json');
 const modules=['engine','storage','ocr','expense-import','expense-import-ui','transaction-form','navigation','view','app'];
 const app=asset('app',modules.map(name=>read(`src/${name}.js`)).join('\n;\n'),'js');
 const client=asset('pwa',read('src/pwa.js'),'js');
 for(const name of fs.readdirSync(path.join(root,'public/icons')).sort())put('icons/'+name,fs.readFileSync(path.join(root,'public/icons',name)));
 put('manifest.webmanifest',read('public/manifest.webmanifest'));put('.nojekyll','');delete files['./.nojekyll'];
 for(const name of fs.readdirSync(path.join(root,'Licencas')).sort())put('licenses/'+name,fs.readFileSync(path.join(root,'Licencas',name)));
 let html=read('src/shell.html').replace(/<style>\/\*__CSS__\*\/<\/style>/,'<link rel="stylesheet" href="'+css+'">');
 html=html.replace(/<script id="nat-ocr-assets"[^>]*>.*?<\/script>/s,`<script id="nat-ocr-assets" type="application/json" data-src="${ocr}"></script>`);
 html=html.replace(/<script>\/\*__\w+__\*\/<\/script>/g,'');
 html=html.replace("script-src 'unsafe-inline' 'wasm-unsafe-eval'", "script-src 'self' 'wasm-unsafe-eval'").replace("style-src 'unsafe-inline'", "style-src 'self' 'unsafe-inline'").replace("img-src data: blob:","img-src 'self' data: blob:").replace("connect-src 'none'","connect-src 'self'").replace("worker-src blob:","worker-src 'self' blob:");
 html=html.replace("default-src 'none'", "default-src 'none'; manifest-src 'self'");
 html=html.replace('</head>','<link rel="manifest" href="./manifest.webmanifest"><link rel="icon" href="./icons/favicon-32.png"><link rel="apple-touch-icon" href="./icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Nat Finance"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="nat-version" content="'+version+'"><meta name="nat-build" content="__NAT_BUILD__"></head>');
 html=html.replace('Versão 1.4.0','Versão '+version).replace('</body>',`<section id="pwa-system" class="pwa-system" aria-label="Instalação e versão"><button type="button" id="pwa-open" aria-expanded="false" aria-controls="pwa-panel">Aplicativo e versão</button><div id="pwa-panel" hidden><div class="pwa-heading"><strong>Nat Finance · ${version}</strong><button type="button" id="pwa-close" aria-label="Fechar painel">✕</button></div><p id="pwa-cache-status" role="status">Preparando o uso offline…</p><p id="pwa-check-status" role="status"></p><div class="actions"><button type="button" id="pwa-check">Verificar atualização</button><button type="button" id="pwa-install">Como instalar</button></div><small>Dados financeiros ficam neste navegador. Transferência do HTML antigo: exporte um JSON completo e importe em Backup e restauração.</small></div></section><section id="pwa-update" class="pwa-update" role="status" hidden><strong id="pwa-update-title">Atualização disponível</strong><p>Salve o trabalho aberto. Atualizar troca apenas os arquivos do aplicativo; os dados locais permanecem.</p><div class="actions"><button type="button" id="pwa-apply">Atualizar agora</button><button type="button" id="pwa-later">Depois</button></div><p id="pwa-update-status"></p></section><dialog id="pwa-install-help" hidden aria-labelledby="pwa-install-title"><div><h2 id="pwa-install-title">Instalar Nat Finance</h2><p>No Chrome/Edge, use Instalar aplicativo no menu do navegador. No iPhone, abra no Safari, toque em Compartilhar e em Adicionar à Tela de Início.</p><p>Primeiro aguarde a confirmação de cache offline completo. O serviço requer HTTPS ou localhost; o arquivo HTML por file:// continua sendo a versão de origem dos dados.</p><button type="button" id="pwa-install-close">Entendi</button></div></dialog><script src="${vendor}" defer></script><script src="${app}" defer></script><script src="${client}" defer></script></body>`);
 const buildId=sha(JSON.stringify({version,files,html,sw:read('src/sw.js')})).slice(0,24);
 html=html.replaceAll('__NAT_BUILD__',buildId);put('index.html',html);
 // version.json is network-only at runtime; it must never masquerade as a fresh check from cache.
 const release={app:'nat-finance',version,build:buildId,schema:1,files};fs.writeFileSync(path.join(out,'version.json'),JSON.stringify(release,null,2)+'\n');
 const sw=read('src/sw.js').replace('/* BUILD_CONSTANTS */',`const BUILD=${JSON.stringify(buildId)},VERSION=${JSON.stringify(version)},FILES=${JSON.stringify(files)};`);fs.writeFileSync(path.join(out,'sw.js'),sw);
 const keep=new Set([...Object.keys(files).map(x=>x.slice(2)),'version.json','sw.js']);
 // Generated assets only: remove obsolete fingerprinted assets, never source or financial backups.
 const assetsDir=path.join(out,'assets');for(const n of fs.readdirSync(assetsDir))if(!keep.has('assets/'+n))fs.unlinkSync(path.join(assetsDir,n));
 return {version,build:buildId,out,files:Object.keys(files).length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){console.log(JSON.stringify(build(),null,2));}
