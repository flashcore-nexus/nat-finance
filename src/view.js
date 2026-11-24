(function(root){
'use strict';
// Presentation only. All amounts, dates, writes and validations stay in NatEngine/NatStorage.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,id='',cls='')=>`<button type="button" data-action="${action}"${id?` data-id="${esc(id)}"`:''} class="${cls}">${label}</button>`;
const when=d=>d.split('-').reverse().join('/');
const monthName=m=>new Date(m+'-15T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
const heading=(title,subtitle,actions='')=>`<div class="heading"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="actions">${actions}</div></div>`;
const disclosure=(title,content,key,open=false)=>`<details class="disclosure" data-disclosure="${key}"${open?' open':''}><summary>${title}</summary><div class="disclosure-body">${content}</div></details>`;
const opened=new Map();
document.addEventListener('toggle',e=>{if(e.target.matches?.('details[data-disclosure]'))opened.set(e.target.dataset.disclosure,e.target.open);},true);
function dashboard({E,p,month}){
 const s=E.stats(p,month),balances=E.balances(p),banks=p.accounts.filter(a=>!a.type||a.type==='bank');
 const available=banks.reduce((n,a)=>n+balances[a.id],0),due=s.obligations.filter(e=>e.amount>e.paid).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
 const metric=(label,value,caption,key)=>`<article class="metric" data-metric="${key}"><span>${label}</span><div class="value">${value}</div><small>${caption}</small></article>`;
 let dismissed=false;try{dismissed=localStorage.getItem('nat_finance_welcome_'+p.id)==='1';}catch{}
 const welcome=!dismissed&&!p.entries.length&&!p.purchases.length?`<section class="welcome"><div><strong>Seu dinheiro, do seu jeito.</strong><p>Comece pelo que você usa. O restante pode esperar.</p></div><div class="welcome-steps">${!p.accounts.length?button('Adicionar conta','new-account'):''}${!p.cards.length?button('Adicionar cartão','new-card'):''}${button('Primeiro lançamento','new-entry','','primary')}</div>${button('Agora não','dismiss-welcome','','text-button')}</section>`:'';
 const invoiceStatus=i=>i.credit?'Crédito disponível':!i.amount?'Sem valor a pagar':i.paid>=i.amount?'Paga':i.paid?'Parcial':i.date<E.today()?'Vencida':'Em aberto';
 const future=E.stats(p,E.addMonth(month));
 return heading('Olá, '+p.name+'!',monthName(month))+
 `<div class="metrics">${metric('Saldo disponível',banks.length?E.money(available):'—',banks.length?'Contas bancárias · saldo até hoje':button('Adicionar conta','new-account','','text-button'),'balance')}${metric('Total do mês',E.money(s.total),'Compromissos do mês','total')}${metric('Pago',E.money(s.paid),'Pagamentos confirmados','paid')}${metric('Em aberto',E.money(s.open),'O que falta pagar','open')}</div>`+
 (s.overdue?`<div class="overdue-alert" role="status"><span>${E.money(s.overdue)} em compromissos vencidos</span>${button('Conferir','go-entries','','text-button')}</div>`:'')+
 `<div class="quick-actions" aria-label="Ações rápidas">${button(NatNavigation.icon('plus')+'Novo lançamento','new-entry','','primary')}${button(NatNavigation.icon('imports')+'Importar fatura','go-imports')}${button(NatNavigation.icon('backups')+'Salvar backup','export')}</div>`+welcome+
 `<div class="grid home-grid"><section class="panel"><div class="panel-title"><h2>Próximos vencimentos</h2>${button('Ver todos','go-entries','','text-button')}</div>${due.length?due.map(e=>`<div class="row due-item"><div><strong>${esc(e.cardId?'Fatura · '+p.cards.find(c=>c.id===e.cardId)?.name:e.description)}</strong><small>${when(e.date)}${e.date<E.today()?' · Vencido':e.paid?' · Parcial':''}</small></div><div class="amount">${E.money(e.amount-e.paid)}${button(e.cardId?'Pagar fatura':'Pagar',e.cardId?'settle-invoice':'settle-entry',e.id,'small')}</div></div>`).join(''):'<div class="empty quiet-empty"><strong>Tudo em dia!</strong><span>Nenhum vencimento próximo.</span></div>'}</section><section class="panel"><div class="panel-title"><h2>Faturas do mês</h2>${p.cards.length?button('Ver cartões','go-cards','','text-button'):''}</div>${s.inv.length?s.inv.map(i=>`<button class="invoice-summary" data-action="card-details" data-id="${esc(i.cardId)}"><span><strong>${esc(p.cards.find(c=>c.id===i.cardId)?.name)}</strong><small>${invoiceStatus(i)} · ${when(i.date)}</small></span><strong>${E.money(i.amount)}</strong><span aria-hidden="true">›</span></button>`).join(''):p.cards.length?'<div class="empty quiet-empty"><strong>Nenhuma fatura neste mês</strong><span>Suas compras aparecerão aqui.</span></div>':`<div class="empty quiet-empty"><strong>Nenhum cartão cadastrado</strong>${button('Adicionar cartão','new-card','','small')}</div>`}</section></div>`+
 (future.total?`<div class="future-hint"><span>${E.money(future.total)} já previstos para ${esc(monthName(E.addMonth(month)))}</span>${button('Ver planejamento','go-months','','text-button')}</div>`:'');
}
function more({p,mode}){
 const item=(title,page,description,icon=page)=>`<button class="more-item" data-page="${page}"><span class="more-icon">${NatNavigation.icon(icon)}</span><span><strong>${title}</strong><small>${description}</small></span><span class="chevron" aria-hidden="true">›</span></button>`;
 return heading('Mais','Tudo o que você precisa, quando precisar.')+`<div class="more-grid"><section class="panel"><h2 class="section-eyebrow">Organizar</h2>${item('Importar despesas','imports','Arquivo, imagem, PDF ou texto')}${item('Contas fixas','rules','Despesas e receitas recorrentes')}${item('Orçamentos e metas','planning','Limites e objetivos')}${item('Meses e fechamentos','months','Preparar o próximo mês')}${item('Relatórios','reports','Consultar o histórico')}</section><section class="panel"><h2 class="section-eyebrow">Seu espaço</h2>${item('Contas bancárias','accounts','Contas, carteiras e saldos','accounts')}${item('Categorias','categories','Organizar os lançamentos','categories')}${item('Perfis financeiros','profiles','Espaços separados','profiles')}${item('Backup e restauração','backups','Salvar e recuperar seu histórico')}${item('Configurações','settings','Preferências e armazenamento')}</section></div><section class="device-strip"><span><strong>Nat Finance <small>by FlashCore</small></strong><small>${mode==='memory'?'Armazenamento indisponível':mode==='localstorage'?'Armazenamento alternativo ativo':'Dados neste dispositivo'}${p.lastBackup?' · Última exportação solicitada em '+new Date(p.lastBackup).toLocaleDateString('pt-BR'):''}</small></span>${button('Aplicativo e versão','app-info','','small')}</section>`;
}
function cards({E,p,month,selected,tab,entryRows}){
 const selectedCard=p.cards.find(c=>c.id===selected),i=selectedCard?E.invoice(p,selectedCard.id,month):null;
 let html=heading('Cartões',monthName(month),p.cards.length?button('Nova compra','new-purchase','','primary')+button('Adicionar cartão','new-card'):'');
 if(!p.cards.length)return html+`<section class="panel empty"><strong>Nenhum cartão cadastrado</strong><p>Adicione o cartão que você usa.</p>${button('Adicionar cartão','new-card','','primary')}</section>`;
 html+=`<div class="card-grid">${p.cards.map(c=>{const inv=E.invoice(p,c.id,month),status=!inv.rows.length&&!inv.paid?'Sem fatura':inv.credit?'Crédito':inv.paid>=inv.amount?'Paga':inv.paid?'Parcial':inv.date<E.today()?'Vencida':'Em aberto';return `<button class="card-tile ${selected===c.id?'selected':''}" data-action="card-details" data-id="${esc(c.id)}" aria-expanded="${selected===c.id}" aria-controls="card-detail"><span class="card-tile-head">${NatNavigation.icon('cards')}<strong>${esc(c.name)}</strong><span aria-hidden="true">›</span></span><span class="card-value">${inv.rows.length||inv.paid?E.money(inv.amount):'—'}</span><span class="card-tile-foot"><small>Vence dia ${c.dueDay}</small><span class="pill ${status==='Paga'?'green':status==='Vencida'?'red':''}">${status}</span></span></button>`;}).join('')}</div>`;
 if(!selectedCard)return html+'<p class="selection-hint">Selecione um cartão para ver a fatura e os detalhes.</p>';
 const c=selectedCard,labels={invoice:'Fatura',purchases:'Compras',payments:'Pagamentos',future:'Futuros'};
 let body='';
 if(tab==='invoice')body=`<div class="invoice-overview"><div><small>Fatura de ${esc(monthName(month))}</small><strong>${E.money(i.amount)}</strong><span>Vencimento ${when(i.date)}${i.credit?' · Crédito '+E.money(i.credit):''}</span></div><div><small>Pago ${E.money(i.paid)}</small>${i.amount>i.paid?button('Pagar fatura','settle-invoice',i.id,'primary'):''}${button('Detalhes da fatura','invoice-details',i.id,'small')}</div></div>`+(i.rows.length?i.rows.map(e=>`<div class="row"><span><strong>${esc(e.description)}</strong><small>${e.number?e.number+'/'+e.count+' · ':''}${when(e.date)}</small></span><strong>${E.money(e.kind==='refund'?-e.amount:e.amount)}</strong></div>`).join(''):'<div class="empty">Nenhuma compra nesta fatura.</div>');
 if(tab==='purchases')body=entryRows(p.entries.filter(e=>e.cardId===c.id&&e.month===month));
 if(tab==='future')body=entryRows(p.entries.filter(e=>e.cardId===c.id&&e.month>month).sort((a,b)=>a.date.localeCompare(b.date)),false);
 if(tab==='payments'){const payments=p.settlements.filter(s=>s.sourceType==='invoice'&&s.sourceId===i.id);body=payments.length?payments.map(s=>`<div class="row"><span><strong>${E.money(s.amount)}</strong><small>${when(s.date)} · ${esc(p.accounts.find(a=>a.id===s.accountId)?.name)}</small></span>${button('Remover baixa','delete-settlement',s.id,'small danger')}</div>`).join(''):'<div class="empty">Nenhum pagamento nesta fatura.</div>';}
 const outstanding=p.entries.filter(e=>e.cardId===c.id).reduce((a,e)=>a+E.consumption(e),0)-p.settlements.filter(s=>s.sourceType==='invoice'&&s.sourceId.startsWith('invoice:'+c.id+':')).reduce((a,s)=>a+s.amount,0);
 return html+`<section class="panel spacer" id="card-detail"><div class="panel-title"><h2>${esc(c.name)}</h2>${button('Editar cartão','edit-card',c.id,'text-button')}</div><div class="tabs" role="tablist" aria-label="Detalhes do cartão">${Object.entries(labels).map(([key,label])=>`<button role="tab" id="card-tab-${key}" aria-controls="card-tab-panel" aria-selected="${tab===key}" data-action="card-tab" data-id="${key}">${label}</button>`).join('')}</div><div role="tabpanel" id="card-tab-panel" aria-labelledby="card-tab-${tab}">${body}</div>${disclosure('Informações do cartão',`<div class="row"><span>Fechamento</span><strong>Dia ${c.closeDay}</strong></div><div class="row"><span>Limite</span><strong>${c.limit?E.money(c.limit):'Não informado'}</strong></div><div class="row"><span>Compromissos ainda em aberto</span><strong>${E.money(Math.max(0,outstanding))}</strong></div>`,'card-info:'+c.id)}</section>`;
}
function wrap(nodes,title,key,parent){const list=[...nodes].filter(Boolean);if(!list.length)return null;const d=document.createElement('details');d.className='disclosure';d.dataset.disclosure=key;const summary=document.createElement('summary');summary.textContent=title;d.append(summary);const body=document.createElement('div');body.className='disclosure-body';d.append(body);(parent||list[0].parentNode).insertBefore(d,parent?null:list[0]);list.forEach(n=>body.append(n));return d;}
function enhance(page){
 const main=document.querySelector('#main');
 main.querySelectorAll('table').forEach(t=>{const labels=[...t.querySelectorAll('thead th')].map(n=>n.textContent);t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{td.dataset.label=labels[i]||'';}));});
 if(['accounts','categories','profiles','settings'].includes(page)){
  const grid=main.querySelector('.grid.equal'),panels=grid?[...grid.children]:[],last=main.querySelector(':scope>section.panel');
  if(page!=='settings'){
   const chosen=page==='accounts'?panels[0]:page==='categories'?panels[1]:last;
   grid?.classList.add('settings-single');
   for(const panel of panels)if(panel!==chosen)panel.remove();if(last!==chosen)last?.remove();
   const titles={accounts:'Contas bancárias',categories:'Categorias',profiles:'Perfis financeiros'};main.querySelector('h1').textContent=titles[page];main.querySelector('.heading p').textContent=page==='accounts'?'Seu saldo começa pelas contas que você usa.':page==='categories'?'Cada lançamento no seu lugar.':'Um espaço para cada pessoa.';
   main.querySelector('.heading .actions').hidden=page!=='profiles';
   if(page==='profiles'){const h=[...chosen.querySelectorAll('h2')].find(n=>n.textContent.includes('Armazenamento'));if(h){const all=[...chosen.childNodes],at=all.indexOf(h);all.slice(at).forEach(n=>n.remove());}}
  }else{
   panels.forEach((n,i)=>wrap([n],i?'Categorias':'Contas bancárias','settings:'+i,grid));
   if(last)wrap([last],'Perfis e armazenamento','settings:storage');
  }
 }
 if(page==='imports')simplifyImport(main);
 // Long operational explanations are available on demand, never hide financial/storage alerts.
 if(['rules','planning','months','backups'].includes(page)){
  main.querySelectorAll(':scope>.notice:not(.error):not(.warning),:scope>.backup-note').forEach((n,i)=>wrap([n],'Sobre esta tela',page+':help:'+i));
  if(page==='months'){const audit=main.querySelector('.audit')?.closest('section');if(audit)wrap([audit],'Histórico de alterações','months:audit');}
 }
 main.querySelectorAll('details[data-disclosure]').forEach(d=>{if(opened.has(d.dataset.disclosure))d.open=opened.get(d.dataset.disclosure);});
}
function simplifyImport(main){
 const root=main.querySelector('#expense-import-page'),panel=root.querySelector('section.panel'),grid=panel.querySelector('.form-grid'),actions=panel.querySelector('.actions');
 root.querySelector('h1').textContent='Importar despesas';root.querySelector('.heading p').textContent='Escolha o arquivo. Confira antes de confirmar.';
 const label=id=>root.querySelector('#'+id)?.closest('label'),file=label('exp-file');file.className='file-drop';file.prepend(Object.assign(document.createElement('strong'),{textContent:'1. Selecione seu arquivo'}));grid.prepend(file);
 const readOptions=wrap(['exp-format','exp-locale','exp-convention','exp-payment-account','exp-settled'].map(label),'Ajustar leitura','imports:options',panel);readOptions.querySelector('.disclosure-body').classList.add('form-grid');
 const profile=wrap(['exp-profile','exp-month'].map(label),'Perfil e mês','imports:profile',panel);profile.querySelector('.disclosure-body').classList.add('form-grid');
 const pasted=wrap([label('exp-text')],'Colar texto ou transcrever','imports:paste',panel);const textButton=actions.querySelector('[data-exp-action=text]');pasted.querySelector('.disclosure-body').append(textButton);
 const origin=label('exp-destination');origin.classList.add('import-origin');
 const mapping=root.querySelector('[data-exp-map]')?.closest('section');if(mapping){wrap([mapping.querySelector('.form-grid')],'Ajustar colunas','imports:columns');mapping.querySelector('h2').textContent='2. Confira a leitura';}
 wrap([...root.querySelectorAll(':scope>.notice:not([role])')],'Sobre a importação e OCR','imports:help',root);
 const originSuggestion=root.querySelector('.origin-suggestions');
 if(originSuggestion&&!originSuggestion.querySelector('[data-exp-action=use-origin]'))wrap([originSuggestion],'Identificar a origem do documento','imports:origin');
 const meta=panel.querySelector(':scope>p.muted');if(meta?.textContent.trim().startsWith('Documento:'))file.append(Object.assign(document.createElement('span'),{className:'selected-file',textContent:meta.textContent.trim()})),meta.hidden=true;
 const status=root.querySelector(':scope>.notice[role=status]');if(status&&/pendente|confirme|não foi|inválid|remova|informe|bloquead/i.test(status.textContent))status.classList.add('warning');
 const preview=root.querySelector('.import-table')?.closest('section');
 if(preview){
  const top=preview.querySelector(':scope>.actions');top?.querySelector('[data-exp-action=confirm]')?.remove();if(top)wrap([top],'Seleção e revalidação','imports:selection');
  preview.querySelectorAll('[data-exp-action=confirm-one]').forEach((n,i)=>wrap([n],'Ações da linha','imports:row:'+i));
  preview.querySelectorAll(':scope>.notice:not(.warning):not(.error)').forEach(n=>wrap([n],'Sobre esta conferência','imports:review-help'));
 }
 const secondary=root.querySelector(':scope>.grid.equal');if(secondary){const headingActions=root.querySelector('.heading .actions');secondary.prepend(headingActions);wrap([secondary],'Associações e histórico','imports:history');}
 // Keep existing selectors and delegated event handlers; only move their containers.
 const help=panel.querySelector(':scope>small');if(help)readOptions.querySelector('.disclosure-body').append(help);
}
root.NatView={dashboard,more,cards,enhance,disclosure};
})(globalThis);
