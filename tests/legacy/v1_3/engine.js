(function(root){
'use strict';
const VERSION=1, now=()=>new Date().toISOString(), today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const uid=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const fail=m=>{throw new Error(m);};
const assert=(v,m)=>{if(!v)fail(m);};
const month=s=>String(s).slice(0,7);
const validMonth=s=>/^\d{4}-(0[1-9]|1[0-2])$/.test(s)&&+s.slice(0,4)>=1900&&+s.slice(0,4)<=2200;
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s&&validMonth(month(s));
function addMonth(m,n=1){assert(validMonth(m),'Competência inválida.');let d=new Date(Date.UTC(+m.slice(0,4),+m.slice(5)-1+n,1));return d.toISOString().slice(0,7);}
function dateAt(m,day){assert(validMonth(m),'Competência inválida.');return `${m}-${String(Math.min(day,new Date(+m.slice(0,4),+m.slice(5),0).getDate())).padStart(2,'0')}`;}
function cents(s){const v=String(s).trim();assert(/^(\d+)([.,]\d{1,2})?$/.test(v),'Informe um valor positivo, sem separador de milhar (ex.: 1250,50).');const [a,b='']=v.replace(',','.').split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));assert(Number.isSafeInteger(n)&&n<=1e12,'Valor fora do limite.');return n;}
function money(n){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n/100);}
const amount=(n,zero=false)=>Number.isSafeInteger(n)&&n>=(zero?0:1)&&n<=1e12;
function upgradeProfile(p){for(const key of ['importRules','importHistory','importKeys'])if(p[key]===undefined)p[key]=[];return p;}
function profile(name){return upgradeProfile({id:uid(),name,updatedAt:now(),lastBackup:null,accounts:[],cards:[],categories:['Moradia','Alimentação','Transporte','Saúde','Educação','Lazer','Assinaturas','Salário','Outros'].map(name=>({id:uid(),name})),entries:[],settlements:[],rules:[],purchases:[],budgets:[],goals:[],contributions:[],periods:[],audit:[]});}
function initial(){return {version:VERSION,revision:0,profiles:[profile('Douglas'),profile('Vanessa')]};}
function touch(p,action,detail=''){p.updatedAt=now();p.audit.push({id:uid(),at:now(),action,detail});}
function ensureOpen(p,m){assert(validMonth(m),'Competência inválida.');assert(!p.periods.find(x=>x.month===m)?.closed,'Competência encerrada. Reabra o mês antes de alterar.');}
function ensurePeriod(p,m){if(!p.periods.some(x=>x.month===m))p.periods.push({id:`period:${m}`,month:m,closed:false,createdAt:now(),reopened:false});}
function entity(p,key,id){return p[key].find(x=>x.id===id)||fail('Registro relacionado não encontrado.');}
function paid(p,id){return p.settlements.filter(s=>s.sourceId===id).reduce((a,s)=>a+s.amount,0);}
function isCard(e){return !!e.cardId;}
function invoiceId(cardId,m){return `invoice:${cardId}:${m}`;}
function invoice(p,c,m){const rows=p.entries.filter(e=>e.cardId===c&&e.month===m);let carry=0;const prior=[...new Set(p.entries.filter(e=>e.cardId===c&&e.month<m).map(e=>e.month))].sort();for(const previous of prior){const gross=p.entries.filter(e=>e.cardId===c&&e.month===previous).reduce((a,e)=>a+(e.kind==='refund'?-e.amount:e.amount),0);carry=Math.max(0,carry-gross);}const total=rows.reduce((a,e)=>a+(e.kind==='refund'?-e.amount:e.amount),0)-carry;const id=invoiceId(c,m);return {id,cardId:c,month:m,amount:Math.max(0,total),credit:Math.max(0,-total),paid:paid(p,id),date:dateAt(m,entity(p,'cards',c).dueDay),rows};}
function firstInvoice(card,date){let m=month(date);if(+date.slice(8)>=+dateAt(m,card.closeDay).slice(8))m=addMonth(m);if(card.dueDay<=card.closeDay)m=addMonth(m);return m;}
function invoices(p,m){return p.cards.map(c=>invoice(p,c.id,m)).filter(i=>i.rows.length||i.paid);}
function consumption(e){return e.kind==='expense'||e.kind==='card'?e.amount:e.kind==='refund'?-e.amount:0;}
function stats(p,m,asOf=today()){
 const rows=p.entries.filter(e=>e.month===m), inv=invoices(p,m), direct=rows.filter(e=>e.kind==='expense'&&!isCard(e));
 const obligations=[...direct.map(e=>({...e,paid:paid(p,e.id)})),...inv];
 const total=obligations.reduce((a,e)=>a+e.amount,0), totalPaid=obligations.reduce((a,e)=>a+Math.min(e.amount,e.paid),0);
 const inc=rows.filter(e=>e.kind==='income'||e.kind==='reimbursement'||e.kind==='refund'&&!e.cardId);
 return {total,paid:totalPaid,open:total-totalPaid,overdue:obligations.filter(e=>e.date<asOf).reduce((a,e)=>a+Math.max(0,e.amount-e.paid),0),income:inc.reduce((a,e)=>a+e.amount,0),received:inc.reduce((a,e)=>a+paid(p,e.id),0),consumption:rows.reduce((a,e)=>a+consumption(e),0),obligations,inv,rows};
}
function balances(p,until=today()){
 const out=Object.fromEntries(p.accounts.map(a=>[a.id,a.initial]));
 for(const s of p.settlements.filter(s=>s.date<=until)){if(s.sourceType==='invoice')out[s.accountId]-=s.amount;else {const e=entity(p,'entries',s.sourceId);out[s.accountId]+=(e.kind==='expense'?-1:1)*s.amount;}}
 for(const e of p.entries.filter(e=>e.kind==='transfer'&&e.date<=until)){out[e.accountId]-=e.amount;out[e.toAccountId]+=e.amount;}
 return out;
}
function saveEntry(p,input){
 const old=input.id?p.entries.find(e=>e.id===input.id):null;
 if(old){ensureOpen(p,old.month);assert(!paid(p,old.id),'Remova as baixas vinculadas antes de editar.');assert(!old.purchaseId,'Compra parcelada: remova a compra e refaça o cronograma antes de alterar.');if(old.cardId)assert(!paid(p,invoiceId(old.cardId,old.month)),'Fatura com pagamento: remova a baixa antes de alterar.');}
 const e={...clone(input),id:old?.id||uid()};
 assert(['income','expense','transfer','refund','reimbursement'].includes(e.kind)||e.kind==='card'&&old?.importStandalone,'Tipo inválido.');assert(amount(e.amount),'Valor inválido.');assert(validDate(e.date)&&validMonth(e.month),'Data ou competência inválida.');assert(e.description?.trim(),'Informe a descrição.');ensureOpen(p,e.month);
 if(e.expenseClass)assert(['fixed','variable','excess'].includes(e.expenseClass),'Classificação inválida.');if(e.kind!=='transfer'||e.categoryId)entity(p,'categories',e.categoryId);
 if(e.cardId){assert(e.kind==='refund'||e.kind==='card'&&old?.importStandalone,'Use Compras para lançar no cartão.');entity(p,'cards',e.cardId);assert(!paid(p,invoiceId(e.cardId,e.month)),'Fatura já paga: remova a baixa antes de alterar.');}else if(e.accountId)entity(p,'accounts',e.accountId);else assert(e.paymentMethod==='pending'&&e.kind!=='transfer','Selecione uma conta para a movimentação.');
 if(e.kind==='transfer'){entity(p,'accounts',e.toAccountId);assert(e.accountId!==e.toAccountId,'Escolha contas diferentes.');assert(month(e.date)===e.month,'Transferência deve pertencer ao mês da movimentação.');}
 if(old)Object.assign(old,e);else p.entries.push(e);ensurePeriod(p,e.month);touch(p,old?'Editar lançamento':'Criar lançamento',e.id);return e;
}
function purchaseSchedule(p,input){
 const c=entity(p,'cards',input.cardId);assert(validDate(input.date),'Data inválida.');assert(amount(input.amount)&&Number.isInteger(input.count)&&input.count>=1&&input.count<=120&&input.amount>=input.count,'Valor ou número de parcelas inválido.');assert(input.description?.trim(),'Informe a descrição.');entity(p,'categories',input.categoryId);
 const first=input.firstMonth||firstInvoice(c,input.date);assert(validMonth(first)&&first>=month(input.date),'A primeira competência deve ser válida e não pode anteceder o mês da compra.');const rows=[];
 for(let k=0;k<input.count;k++){const m=addMonth(first,k);assert(validMonth(m),'Cronograma fora do intervalo permitido.');rows.push({number:k+1,count:input.count,kind:'card',cardId:c.id,categoryId:input.categoryId,date:dateAt(m,c.dueDay),purchaseDate:input.date,month:m,description:input.description,notes:input.notes||'',amount:Math.floor(input.amount/input.count)+(k<input.amount%input.count?1:0),estimated:!!input.estimated,paymentMethod:'credit',expenseClass:input.expenseClass||'variable'});}return rows;
}
function purchase(p,input){
 const planned=purchaseSchedule(p,input),first=planned[0].month,id=uid();
 for(const r of planned){ensureOpen(p,r.month);assert(!paid(p,invoiceId(r.cardId,r.month)),'Uma das faturas já tem pagamento. Remova a baixa antes de incluir compras.');}
 const rows=planned.map(r=>({...r,id:`part:${id}:${r.number}`,purchaseId:id}));input={...input,paymentMethod:'credit',expenseClass:input.expenseClass||'variable',estimated:!!input.estimated};
 p.purchases.push({...input,id,firstMonth:first});p.entries.push(...rows);ensurePeriod(p,first);touch(p,'Criar compra',id);return rows;
}
const paymentMethods=['credit','debit','pix','cash','transfer','pending'];
function recordTransaction(original,input){
 const p=clone(original),old=input.id?entity(p,'entries',input.id):null,method=input.paymentMethod;
 assert(paymentMethods.includes(method),'Forma de pagamento inválida.');
 const kind=input.kind,movementDate=input.movementDate||input.date;let result;if(method!=='pending')assert(validDate(movementDate),'Data da compra ou movimentação inválida.');
 if(kind==='expense'&&method==='credit'){
  if(old){assert(!old.ruleId,'Para uma ocorrência recorrente, preserve a regra e cadastre compras avulsas separadamente.');removeEntry(p,old.id);}
  result=purchase(p,{description:input.description,amount:input.amount,categoryId:input.categoryId,expenseClass:input.expenseClass,date:movementDate,count:input.count??1,cardId:input.cardId,firstMonth:input.firstMonth,notes:input.notes,estimated:input.estimated});
 }else{
  assert(method!=='credit'||kind==='refund'||old?.importStandalone&&kind==='card','Forma de pagamento incompatível com este tipo.');
  if(kind==='transfer'){assert(['pix','transfer'].includes(method),'Transferência exige Pix ou transferência bancária.');assert(validDate(movementDate)&&movementDate<=today(),'Use uma data efetiva até hoje.');}
  const card=method==='credit'?entity(p,'cards',input.cardId):null;
  const e=saveEntry(p,{...(old||{}),...input,...(old?.importStandalone?{number:old.number,count:old.count}:{}),date:card?dateAt(input.month,card.dueDay):kind==='transfer'?movementDate:input.date,movementDate:method==='pending'?null:movementDate,cardId:card?.id||null,accountId:card?null:input.accountId||null,purchaseDate:card?movementDate:null,paymentMethod:method});
  if(kind!=='transfer'&&method!=='pending'&&!card)settle(p,{sourceId:e.id,accountId:input.accountId,date:movementDate,amount:e.amount});
  result=e;
 }
 validate(p);Object.assign(original,p);return result;
}
function removeEntry(p,id){const e=entity(p,'entries',id), rows=e.purchaseId?p.entries.filter(x=>x.purchaseId===e.purchaseId):[e];for(const r of rows){ensureOpen(p,r.month);assert(!paid(p,r.id)&&(!r.cardId||!paid(p,invoiceId(r.cardId,r.month))),'Há pagamentos vinculados. Remova as baixas primeiro.');}p.entries=p.entries.filter(x=>!rows.some(r=>r.id===x.id));if(e.purchaseId)p.purchases=p.purchases.filter(x=>x.id!==e.purchaseId);touch(p,'Remover lançamento/compra',id);}
function settle(p,{sourceId,sourceType='entry',accountId,date,amount:value}){
 entity(p,'accounts',accountId);assert(validDate(date)&&date<=today(),'Use uma data efetiva até hoje.');assert(amount(value),'Valor inválido.');let total,m;
 if(sourceType==='invoice'){const i=p.cards.flatMap(c=>[...new Set(p.entries.filter(e=>e.cardId===c.id).map(e=>e.month))].map(m=>invoice(p,c.id,m))).find(x=>x.id===sourceId);assert(i,'Fatura não encontrada.');total=i.amount;m=i.month;}
 else{assert(sourceType==='entry','Origem inválida.');const e=entity(p,'entries',sourceId);assert(!e.cardId&&e.kind!=='transfer','Este lançamento não aceita baixa direta.');total=e.amount;m=e.month;}
 ensureOpen(p,m);ensureOpen(p,month(date));assert(value<=total-paid(p,sourceId),'Baixa maior que o saldo em aberto.');p.settlements.push({id:uid(),sourceId,sourceType,accountId,date,amount:value,obligationMonth:m});touch(p,'Registrar baixa',sourceId);
}
function removeSettlement(p,id){const s=entity(p,'settlements',id);ensureOpen(p,s.obligationMonth);ensureOpen(p,month(s.date));p.settlements=p.settlements.filter(x=>x.id!==id);touch(p,'Remover baixa',id);}
function ruleDue(r,m){const diff=(+m.slice(0,4)-+r.start.slice(0,4))*12+(+m.slice(5)-+r.start.slice(5,7));return r.active&&diff>=0&&diff%r.every===0&&dateAt(m,r.day)>=r.start&&(!r.end||dateAt(m,r.day)<=r.end);}
function preview(p,m,from){
 assert(validMonth(m),'Competência inválida.');const candidates=[];
 for(const r of p.rules.filter(r=>ruleDue(r,m))){const id=`occ:${r.id}:${m}`,previous=r.variable?p.entries.filter(e=>e.ruleId===r.id&&e.month<m&&(!r.effectiveFrom||e.month>=r.effectiveFrom)).sort((a,b)=>b.month.localeCompare(a.month))[0]:null,value=previous?.amount??r.amount;if(!p.entries.some(e=>e.id===id))candidates.push({key:id,type:'rule',label:r.description,amount:value,record:{id,ruleId:r.id,kind:r.kind,expenseClass:r.kind==='expense'?(r.variable?'variable':'fixed'):null,description:r.description,categoryId:r.categoryId,accountId:r.accountId,date:dateAt(m,r.day),month:m,amount:value,estimated:!!r.variable,notes:r.variable?'Estimativa: confirmar o valor desta ocorrência.':''}});}
 for(const b of p.budgets.filter(b=>b.month===from&&b.carry)){const id=`budget:${b.categoryId}:${m}`;if(!p.budgets.some(x=>x.month===m&&x.categoryId===b.categoryId))candidates.push({key:id,type:'budget',label:`Orçamento · ${entity(p,'categories',b.categoryId).name}`,amount:b.amount,record:{...b,id,month:m}});}
 return {month:m,exists:p.periods.some(x=>x.month===m),closed:!!p.periods.find(x=>x.month===m)?.closed,candidates,installments:p.entries.filter(e=>e.month===m&&e.purchaseId),goals:p.goals.filter(g=>g.active)};
}
function openMonth(p,m,{from,selected,close=false}={}){const v=preview(p,m,from);ensureOpen(p,m);if(close){assert(from&&m===addMonth(from),'O fechamento deve iniciar o mês imediatamente seguinte.');assert(validMonth(from),'Competência de origem inválida.');}const keys=new Set(selected??v.candidates.map(x=>x.key));for(const x of v.candidates.filter(x=>keys.has(x.key))){if(x.type==='rule')p.entries.push(x.record);else p.budgets.push(x.record);}ensurePeriod(p,m);if(close&&!p.periods.find(x=>x.month===from)?.closed){ensurePeriod(p,from);Object.assign(p.periods.find(x=>x.month===from),{closed:true,closedAt:now()});}touch(p,close?'Fechar mês e iniciar próximo':'Iniciar/completar mês',`${from||''} / ${m}`);return v;}
function reopen(p,m){const r=p.periods.find(x=>x.month===m);assert(r?.closed,'Mês não está encerrado.');r.closed=false;r.reopened=true;touch(p,'Reabrir competência',m);}
function saveRule(p,input,from){
 assert(['expense','income'].includes(input.kind)&&amount(input.amount),'Recorrência inválida.');assert(input.description?.trim(),'Informe a descrição.');assert(validDate(input.start)&&(!input.end||validDate(input.end)&&input.end>=input.start),'Intervalo inválido.');assert([1,3,6,12].includes(input.every)&&Number.isInteger(input.day)&&input.day>=1&&input.day<=31,'Periodicidade inválida.');entity(p,'accounts',input.accountId);entity(p,'categories',input.categoryId);
 const old=p.rules.find(x=>x.id===input.id), r={...input,id:old?.id||uid(),effectiveFrom:old?from:month(input.start)};
 if(old){assert(validMonth(from),'Informe a competência para alterar a série futura.');for(const e of p.entries.filter(e=>e.ruleId===r.id&&e.month>=from)){ensureOpen(p,e.month);assert(!paid(p,e.id),'A série futura contém baixas. Ajuste a competência inicial ou remova as baixas.');}p.entries=p.entries.filter(e=>!(e.ruleId===r.id&&e.month>=from));Object.assign(old,r);for(const period of p.periods.filter(x=>x.month>=from&&!x.closed)){const v=preview(p,period.month);p.entries.push(...v.candidates.filter(x=>x.type==='rule'&&x.record.ruleId===r.id).map(x=>x.record));}}
 else p.rules.push(r);touch(p,'Salvar recorrência',r.id);return r;
}
const collections=['accounts','cards','categories','entries','settlements','rules','purchases','budgets','goals','contributions','periods','audit','importRules','importHistory','importKeys'];
function validate(p){
 assert(p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=100,'Perfil inválido.');
 upgradeProfile(p);
 for(const k of collections){assert(Array.isArray(p[k])&&p[k].length<=100000,`Coleção inválida: ${k}`);const ids=new Set();for(const r of p[k]){assert(r&&typeof r.id==='string'&&r.id.length<250&&!ids.has(r.id),`Identificador inválido/duplicado em ${k}`);ids.add(r.id);}}
 let magnitude=0;for(const a of [...p.accounts,...p.entries,...p.settlements]){magnitude+=Math.abs(a.amount??a.initial??0);assert(Number.isSafeInteger(magnitude),'Valor inválido: volume financeiro excede a precisão segura.');}
 const ref=(key,id)=>assert(p[key].some(x=>x.id===id),`Vínculo ausente em ${key}: ${id}`);
 for(const a of p.accounts)assert(typeof a.name==='string'&&Number.isSafeInteger(a.initial)&&Math.abs(a.initial)<=1e12,'Conta inválida.');
 for(const c of p.cards)assert(typeof c.name==='string'&&Number.isInteger(c.closeDay)&&c.closeDay>=1&&c.closeDay<=31&&Number.isInteger(c.dueDay)&&c.dueDay>=1&&c.dueDay<=31&&amount(c.limit||0,true),'Cartão inválido.');
 for(const c of p.categories)assert(typeof c.name==='string'&&c.name.trim(),'Categoria inválida.');
 for(const e of p.entries){assert(['income','expense','card','transfer','refund','reimbursement'].includes(e.kind)&&amount(e.amount)&&validDate(e.date)&&validMonth(e.month)&&typeof e.description==='string','Lançamento inválido.');if(e.kind!=='transfer'||e.categoryId)ref('categories',e.categoryId);if(e.expenseClass)assert(['fixed','variable','excess'].includes(e.expenseClass),'Classificação inválida.');if(e.cardId){ref('cards',e.cardId);assert(['card','refund'].includes(e.kind),'Tipo incompatível com cartão.');}else if(e.accountId)ref('accounts',e.accountId);else assert(e.paymentMethod==='pending'&&e.kind!=='transfer','Conta do lançamento ausente.');if(e.kind==='transfer'){ref('accounts',e.toAccountId);assert(e.toAccountId!==e.accountId&&month(e.date)===e.month,'Transferência inválida.');}if(e.purchaseId)ref('purchases',e.purchaseId);if(e.ruleId)ref('rules',e.ruleId);}
 for(const r of p.rules){assert(['income','expense'].includes(r.kind)&&typeof r.description==='string'&&amount(r.amount)&&validDate(r.start)&&(!r.end||validDate(r.end)&&r.end>=r.start)&&[1,3,6,12].includes(r.every)&&Number.isInteger(r.day)&&r.day>=1&&r.day<=31&&typeof r.active==='boolean','Regra inválida.');ref('accounts',r.accountId);ref('categories',r.categoryId);}
 for(const x of p.purchases){ref('cards',x.cardId);assert(amount(x.amount)&&validDate(x.date)&&Number.isInteger(x.count)&&x.count>0&&x.count<=120&&validMonth(x.firstMonth),'Compra inválida.');const parts=p.entries.filter(e=>e.purchaseId===x.id);assert(parts.length===x.count&&parts.reduce((a,e)=>a+e.amount,0)===x.amount,'Cronograma incompleto ou divergente.');const nums=new Set();for(const e of parts){assert(e.kind==='card'&&e.cardId===x.cardId&&e.id===`part:${x.id}:${e.number}`&&e.count===x.count&&Number.isInteger(e.number)&&e.number>=1&&e.number<=x.count&&!nums.has(e.number)&&e.month===addMonth(x.firstMonth,e.number-1),'Parcela inválida.');nums.add(e.number);}}
 for(const e of p.entries){if(e.paymentMethod!==undefined)assert(paymentMethods.includes(e.paymentMethod),'Forma de pagamento inválida.');if(e.kind==='card')assert(e.purchaseId||e.importStandalone&&e.importSource&&typeof e.importSource.rowKey==='string'&&validDate(e.purchaseDate),'Compra sem cronograma ou origem de importação.');if(e.importStandalone){assert(!e.purchaseId&&e.cardId&&e.kind==='card','Parcela avulsa importada inválida.');assert((e.number==null&&e.count==null)||(Number.isInteger(e.number)&&Number.isInteger(e.count)&&e.number>=1&&e.number<=e.count&&e.count<=120),'Parcela importada inválida.');}if(e.ruleId)assert(e.id===`occ:${e.ruleId}:${e.month}`,'Identificador de recorrência inválido.');}
 for(const s of p.settlements){assert(amount(s.amount)&&validDate(s.date)&&validMonth(s.obligationMonth),'Baixa inválida.');ref('accounts',s.accountId);if(s.sourceType==='entry'){ref('entries',s.sourceId);const e=entity(p,'entries',s.sourceId);assert(!e.cardId&&e.kind!=='transfer'&&s.obligationMonth===e.month&&paid(p,e.id)<=e.amount,'Baixa incompatível.');}else{assert(s.sourceType==='invoice','Origem inválida.');const i=p.cards.map(c=>invoice(p,c.id,s.obligationMonth)).find(i=>i.id===s.sourceId);assert(i&&i.paid<=i.amount&&i.rows.length,'Baixa de fatura inválida.');}}
 const bs=new Set();for(const b of p.budgets){ref('categories',b.categoryId);assert(validMonth(b.month)&&amount(b.amount)&&!bs.has(b.month+b.categoryId),'Orçamento inválido/duplicado.');bs.add(b.month+b.categoryId);}
 for(const g of p.goals)assert(typeof g.name==='string'&&amount(g.target)&&typeof g.active==='boolean','Meta inválida.');
 for(const c of p.contributions){ref('goals',c.goalId);assert(amount(c.amount)&&validDate(c.date),'Contribuição inválida.');}
 const ms=new Set();for(const x of p.periods){assert(validMonth(x.month)&&typeof x.closed==='boolean'&&!ms.has(x.month),'Competência inválida/duplicada.');ms.add(x.month);}
 for(const r of p.importRules){assert(typeof r.merchant==='string'&&r.merchant.trim()&&Array.isArray(r.aliases)&&r.aliases.length>0&&r.aliases.every(a=>typeof a==='string'&&a.trim()),'Associação de importação inválida.');ref('categories',r.categoryId);}
 for(const h of p.importHistory)assert(typeof h.filename==='string'&&validMonth(h.month)&&typeof h.at==='string'&&['total','imported','ignored','flagged','linked'].every(k=>Number.isSafeInteger(h[k])&&h[k]>=0),'Histórico de importação inválido.');
 for(const k of p.importKeys){assert(typeof k.key==='string'&&typeof k.batchId==='string','Identidade de importação inválida.');ref('importHistory',k.batchId);}
 assert(new Set(p.importKeys.map(k=>k.key)).size===p.importKeys.length,'Identidade de origem duplicada.');
 return true;
}
function backup(p,m,type='full'){assert(['full','monthly'].includes(type)&&validMonth(m),'Tipo ou período inválido.');validate(p);const copy=clone(p);if(type==='monthly'){
 // Include complete card histories to preserve installment schedules, credits and invoice settlements.
 const selectedCards=new Set(copy.entries.filter(e=>e.month===m&&e.cardId).map(e=>e.cardId));copy.entries=copy.entries.filter(e=>e.month===m||selectedCards.has(e.cardId));const buys=new Set(copy.entries.map(e=>e.purchaseId).filter(Boolean));copy.purchases=copy.purchases.filter(x=>buys.has(x.id));const ids=new Set(copy.entries.map(e=>e.id));const invIds=new Set(copy.entries.filter(e=>e.cardId).map(e=>invoiceId(e.cardId,e.month)));copy.settlements=copy.settlements.filter(s=>ids.has(s.sourceId)||invIds.has(s.sourceId));copy.periods=copy.periods.filter(x=>x.month===m);copy.budgets=copy.budgets.filter(x=>x.month===m);copy.contributions=copy.contributions.filter(x=>month(x.date)===m);copy.audit=[];
 }validate(copy);return {app:'Nat Finance',formatVersion:VERSION,type,exportedAt:now(),reference:m,profile:copy};}
function parseBackup(raw){const b=typeof raw==='string'?JSON.parse(raw):clone(raw);const scan=x=>{if(x&&typeof x==='object')for(const k of Object.keys(x)){assert(!['__proto__','prototype','constructor'].includes(k),'Arquivo contém campos reservados.');scan(x[k]);}};scan(b);assert(b?.app==='Nat Finance'&&b.formatVersion===VERSION,'Arquivo ou versão incompatível.');assert(['full','monthly'].includes(b.type)&&validMonth(b.reference)&&typeof b.exportedAt==='string'&&!isNaN(Date.parse(b.exportedAt)),'Cabeçalho de backup inválido.');validate(b.profile);return b;}
function mergePreview(p,b){const missing=[],conflicts=[];for(const k of collections){if(k==='audit')continue;for(const r of b.profile[k]){const old=p[k].find(x=>x.id===r.id);if(!old)missing.push({collection:k,record:r});else if(JSON.stringify(old)!==JSON.stringify(r))conflicts.push({collection:k,id:r.id});}}return {missing,conflicts};}
function importBackup(p,b,mode){b=parseBackup(b);upgradeProfile(p);assert(p.id===b.profile.id,'Perfil de origem diferente. Importe como perfil separado.');if(mode==='restore'){assert(b.type==='full','Backup mensal permite apenas mesclar.');const id=p.id;Object.assign(p,clone(b.profile),{id});}else{const v=mergePreview(p,b);assert(!v.conflicts.length,'Há conflitos. Revise os dados ou restaure um backup completo; nenhum registro foi alterado.');const copy=clone(p);for(const x of v.missing)copy[x.collection].push(clone(x.record));validate(copy);Object.assign(p,copy);}touch(p,mode==='restore'?'Restaurar backup completo':'Mesclar backup',b.exportedAt);}
const api={VERSION,uid,now,today,month,validMonth,validDate,addMonth,dateAt,cents,money,profile,initial,clone,assert,amount,touch,ensureOpen,ensurePeriod,entity,paid,invoiceId,invoice,invoices,firstInvoice,stats,balances,consumption,saveEntry,purchase,removeEntry,settle,removeSettlement,ruleDue,preview,openMonth,reopen,saveRule,validate,backup,parseBackup,mergePreview,importBackup,collections};
Object.assign(api,{upgradeProfile,purchaseSchedule,recordTransaction,paymentMethods});root.NatEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
