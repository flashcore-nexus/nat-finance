import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {root} from './build.mjs';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
export function createPreviewServer({directory=path.join(root,'dist'),basePath='/nat-finance/'}={}){
 if(!basePath.startsWith('/')||!basePath.endsWith('/'))throw Error('Base deve começar e terminar em /');
 return http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(pathname===basePath.slice(0,-1)&&basePath!=='/'){res.writeHead(308,{Location:basePath});res.end();return;}
  if(!pathname.startsWith(basePath)){res.writeHead(404);res.end();return;}
  const dir=path.resolve(typeof directory==='function'?directory():directory),relative=pathname.slice(basePath.length)||'index.html',target=path.resolve(dir,relative);
  if(!target.startsWith(dir+path.sep)||relative.includes('\\')){res.writeHead(403);res.end();return;}
  let stat;try{stat=fs.statSync(target);}catch{res.writeHead(404);res.end();return;}
  if(!stat.isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':relative.startsWith('assets/')?'public, max-age=31536000, immutable':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=n=>process.argv[process.argv.indexOf(n)+1],basePath=process.argv.includes('--base')?arg('--base'):'/nat-finance/',port=process.argv.includes('--port')?Number(arg('--port')):4173;
 const server=createPreviewServer({basePath});server.listen(port,'127.0.0.1',()=>console.log(`Nat Finance: http://localhost:${port}${basePath}\nCtrl+C para encerrar. Use sempre esta origem para manter o acesso aos mesmos dados locais.`));
}
