(function(root){
'use strict';
const labels={dashboard:'Início',entries:'Lançamentos',cards:'Cartões',more:'Mais',imports:'Importar despesas',rules:'Contas fixas',planning:'Orçamentos e metas',months:'Meses e fechamentos',reports:'Relatórios',accounts:'Contas bancárias',categories:'Categorias',profiles:'Perfis financeiros',settings:'Configurações',backups:'Backup e restauração'};
const paths={dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',entries:'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',cards:'M3 7h18 M3 11h18 M6 16h4 M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',imports:'M12 3v12 M8 11l4 4 4-4 M4 14v6h16v-6',rules:'M20 7V3l-4 4 M20 7a9 9 0 1 0 1 8 M9 8v5l4 2',planning:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 10v4 M10 12h4',months:'M3 8h18 M7 3v4 M17 3v4 M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2 M7 12h3 M14 12h3 M7 16h3',reports:'M4 3v18h17 M8 16v-4 M13 16V8 M18 16V5',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 3h4l1 3 3-1 3 3-1 3 1 3-3 3-3-1-1 3h-4l-1-3-3 1-3-3 1-3-1-3 3-3 3 1z',backups:'M12 3v12 M8 7l4-4 4 4 M3 14v6h18v-6 M7 17h.01',collapse:'M4 4h16v16H4z M9 4v16 M16 9l-3 3 3 3',close:'M6 6l12 12 M18 6L6 18'};
Object.assign(paths,{dashboard:'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7',more:'M5 12h.01 M12 12h.01 M19 12h.01',plus:'M12 5v14 M5 12h14',accounts:'M3 10h18 M4 21h16 M6 10v8 M12 10v8 M18 10v8 M3 7l9-4 9 4v3H3z',categories:'M3 4h7l11 11-6 6L3 9z M7 7h.01',profiles:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.8'});
function icon(id){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.more)+'"/></svg>';}
function create(){
 const shell=document.querySelector('.shell'),aside=document.querySelector('#sidebar'),bottom=document.querySelector('#bottom-nav');
 let collapsed=false;try{collapsed=localStorage.getItem('nat_finance_nav_collapsed')==='1';}catch{}
 function update(){const mobile=matchMedia('(max-width:760px)').matches;shell.classList.toggle('is-collapsed',collapsed);aside.inert=mobile;bottom.inert=!mobile;const b=aside.querySelector('[data-nav=collapse]');b.setAttribute('aria-label',collapsed?'Expandir menu':'Recolher menu');b.setAttribute('aria-expanded',String(!collapsed));b.title=collapsed?'Expandir menu':'Recolher menu';}
 function render(page,p,mode){
  document.body.dataset.page=page;const active=['dashboard','entries','cards'].includes(page)?page:'more';
  const items=['dashboard','entries','cards','more'];
  const buttons=()=>items.map(id=>'<button type="button" data-page="'+id+'" title="'+labels[id]+'" aria-label="'+labels[id]+'"'+(active===id?' aria-current="page" class="active"':'')+'><span class="nav-icon">'+icon(id)+'</span><span class="nav-label">'+labels[id]+'</span></button>').join('');
  document.querySelector('#nav').innerHTML=buttons();bottom.innerHTML=buttons();
  const backup=document.querySelector('#nav-backup');backup.textContent=p.lastBackup?'Backup solicitado em '+new Date(p.lastBackup).toLocaleDateString('pt-BR'):'Seu histórico, sempre com você';backup.title=p.lastBackup?'Última exportação solicitada: '+new Date(p.lastBackup).toLocaleString('pt-BR'):'Nenhum backup exportado para este perfil';
  document.querySelector('#storage-label').textContent=mode==='indexeddb'?'IndexedDB disponível':mode==='localstorage'?'IndexedDB indisponível · localStorage ativo':'Armazenamento indisponível · somente sessão';
  update();
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-nav=collapse]')){collapsed=!collapsed;try{localStorage.setItem('nat_finance_nav_collapsed',collapsed?'1':'0');}catch{}update();}});
 addEventListener('resize',update);update();return {render,closeMobile:()=>{},toggleMobile:()=>{document.querySelector('#bottom-nav [data-page=more]')?.click();}};
}
root.NatNavigation={create,labels,icon};
})(globalThis);
