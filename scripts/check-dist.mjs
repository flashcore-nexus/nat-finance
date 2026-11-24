import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {root} from './build.mjs';
const dir=path.join(root,'dist'),read=p=>fs.readFileSync(path.join(dir,p)),meta=JSON.parse(read('version.json')),manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(meta.app,'nat-finance');assert.match(meta.build,/^[0-9a-f]{24}$/);assert.equal(meta.version,JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version);
for(const [name,hash]of Object.entries(meta.files)){assert(name.startsWith('./')&&!name.includes('..'));assert.equal(crypto.createHash('sha256').update(read(name)).digest('hex'),hash,name);}
for(const name of ['id','start_url','scope'])assert.equal(manifest[name],'./');
for(const icon of manifest.icons){assert(icon.src.startsWith('./icons/'));const png=read(icon.src),size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
const html=read('index.html').toString(),sw=read('sw.js').toString();assert(html.includes(meta.build));assert(sw.includes(meta.build));assert(!sw.includes('/* BUILD_CONSTANTS */'));assert(!html.includes('/*__'));
for(const m of html.matchAll(/(?:src|href|data-src)="([^"]+)"/g)){assert(m[1].startsWith('./'),m[1]);assert(fs.existsSync(path.join(dir,m[1])),m[1]);}
const allowed=new Set([...Object.keys(meta.files).map(x=>x.slice(2)),'sw.js','version.json','.nojekyll']);
function walk(p=''){for(const entry of fs.readdirSync(path.join(dir,p),{withFileTypes:true})){const name=p+entry.name;if(entry.isDirectory())walk(name+'/');else assert(allowed.has(name),'Arquivo inesperado na publicação: '+name);}}walk();
console.log(`Publicação verificada: ${meta.version}, build ${meta.build}, ${Object.keys(meta.files).length} arquivos com SHA-256. Sem backups ou dados de usuários no pacote.`);
