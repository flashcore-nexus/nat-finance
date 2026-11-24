(function(root){
'use strict';
const E=root.NatEngine,methods={credit:'Cartão de crédito',debit:'Cartão de débito',pix:'Pix',cash:'Dinheiro',transfer:'Transferência bancária',pending:'Conta a pagar (pendente)'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const option=(v,t,s)=>`<option value="${esc(v)}"${v===s?' selected':''}>${esc(t)}</option>`;
function create(api){
 let current=null;
 const opts=(key,id)=>api.profile()[key].map(x=>option(x.id,x.name+(key==='accounts'&&x.type==='cash'?' · Dinheiro':''),id)).join('');
 const input=(label,n,type,value,extra='')=>`<label>${label}<input name="${n}" type="${type}" value="${esc(value??'')}" ${extra}></label>`;
 function open(id,defaults={}){
  const p=api.profile(),e=id?E.entity(p,'entries',id):{kind:'expense',month:api.month(),date:E.dateAt(api.month(),+E.today().slice(8)),amount:0,...defaults};current=e;
  const initial=e.paymentMethod||(e.cardId?'credit':e.kind==='transfer'?'transfer':'pending'),movement=id?(e.purchaseDate||e.movementDate||e.date):E.today();
  const body=`<input type="hidden" name="id" value="${esc(id||'')}"><div class="form-grid transaction-basics"><label>Tipo<select name="kind">${Object.entries({expense:'Despesa',income:'Receita',transfer:'Transferência'}).map(([v,t])=>option(v,t,e.kind)).join('')}<optgroup label="Outros tipos">${Object.entries({refund:'Estorno',reimbursement:'Reembolso',...(e.importStandalone?{card:'Compra no cartão · importada'}:{})}).map(([v,t])=>option(v,t,e.kind)).join('')}</optgroup></select></label>${input('Descrição','description','text',e.description||'','required maxlength="160" placeholder="Ex.: Supermercado"')}
  ${input('Valor (R$)','amount','text',e.amount?(e.amount/100).toFixed(2):'','required inputmode="decimal" placeholder="0,00"')}<label>Categoria<select name="categoryId">${opts('categories',e.categoryId)}</select></label><label data-control="payment">Forma de pagamento<select name="paymentMethod">${Object.entries(methods).map(([v,t])=>option(v,t,initial)).join('')}</select></label><div class="transaction-dynamic">
  <label data-control="account">Conta utilizada<select name="accountId">${option('','Definir depois',e.accountId||'')}${opts('accounts',e.accountId||p.accounts[0]?.id)}</select></label><label data-control="toAccount">Conta de destino<select name="toAccountId">${option('','Selecione',e.toAccountId||'')}${opts('accounts',e.toAccountId)}</select></label>
  <label data-control="card">Cartão utilizado<select name="cardId">${option('','Selecione o cartão',e.cardId||'')}${opts('cards',e.cardId)}</select></label><label data-control="purchaseMode">Compra<select name="purchaseMode"><option value="single">À vista</option><option value="installments">Parcelada</option></select></label>${input('Quantidade de parcelas','count','number','','min="2" max="120"')}
  </div></div><p class="transaction-explanation" id="transaction-explanation"></p><div id="transaction-schedule" role="status"></div>
  <details class="disclosure transaction-additional" id="transaction-more"><summary>Mais opções</summary><div class="disclosure-body advanced-grid">
  ${input('Data da movimentação','movementDate','date',movement,'required')}${input('Vencimento','date','date',e.date,'required')}${input('Competência','month','month',e.month,'required')}
  ${input('Primeira competência da fatura','firstMonth','month','','required')}<label data-control="classification">Classificação<select name="expenseClass">${Object.entries({fixed:'Fixa',variable:'Variável',excess:'Excedente'}).map(([v,t])=>option(v,t,e.expenseClass||'variable')).join('')}</select></label>
  <label class="full">Observações<textarea name="notes" maxlength="2000">${esc(e.notes||'')}</textarea></label><label class="check"><input name="estimated" type="checkbox" ${e.estimated?'checked':''}>Valor estimado</label>
  ${e.ruleId?'<small class="full">Ocorrência de conta fixa. A edição altera apenas este mês.</small>':''}</div></details>`;
  api.modal(id?'Editar lançamento':initial==='credit'?'Nova compra':'Novo lançamento',api.form('entry-form',body));sync(true);
 }
 function show(form,name,visible,required=false){const el=form.elements[name];if(!el)return;const box=el.closest('label');if(box)box.hidden=!visible;el.disabled=!visible;el.required=visible&&required;}
 function sync(recalculate=false){
  const f=document.querySelector('#entry-form');if(!f)return;
  const kind=f.elements.kind.value,select=f.elements.paymentMethod,previous=select.value;
  let allowed=kind==='transfer'?['pix','transfer']:kind==='card'?['credit']:['income','reimbursement'].includes(kind)?['pix','cash','transfer','pending']:['credit','debit','pix','cash','transfer','pending'];
  if(current?.ruleId)allowed=allowed.filter(x=>x!=='credit');
  select.innerHTML=allowed.map(v=>option(v,v==='pending'&&kind!=='expense'?'A receber (pendente)':methods[v],previous)).join('');if(!allowed.includes(previous))select.value=kind==='transfer'?'transfer':allowed.includes('pending')?'pending':allowed[0];
  const method=select.value,credit=method==='credit',buy=credit&&kind==='expense',split=buy&&f.elements.purchaseMode.value==='installments',pending=method==='pending';
  show(f,'accountId',!credit,!pending);show(f,'toAccountId',kind==='transfer',true);show(f,'cardId',credit,true);show(f,'purchaseMode',buy);show(f,'count',split,true);show(f,'firstMonth',buy,true);show(f,'movementDate',!pending,true);show(f,'date',!buy&&kind!=='transfer',true);show(f,'month',!buy,true);show(f,'expenseClass',kind==='expense');show(f,'categoryId',kind!=='transfer',kind!=='transfer');
  f.elements.month.readOnly=!!current?.ruleId;
  const main=f.querySelector('.transaction-dynamic'),advanced=f.querySelector('.advanced-grid');
  (pending?advanced:main).append(f.elements.accountId.closest('label'));
  (pending?main:advanced).append(f.elements.date.closest('label'));
  f.elements.date.closest('label').firstChild.textContent=kind==='income'||kind==='reimbursement'?'Recebimento previsto':'Vencimento';
  if(kind==='income')select.querySelector('option[value=pending]')?.replaceChildren(document.createTextNode('A receber'));
  else if(kind==='expense')select.querySelector('option[value=pending]')?.replaceChildren(document.createTextNode('Conta a pagar'));
  if(current&&!current.id&&!pending&&!credit&&!f.elements.date.dataset.manual)f.elements.date.value=f.elements.movementDate.value;
  f.elements.amount.closest('label').firstChild.textContent=buy?'Valor total da compra (R$)':'Valor (R$)';
  const explanation=document.querySelector('#transaction-explanation');explanation.textContent=buy?'A compra entra na fatura. O pagamento é registrado depois.':credit?'O valor fica vinculado ao cartão.':pending?'Em aberto. Nenhum pagamento será registrado.':kind==='transfer'?'Movimenta as duas contas, sem criar uma despesa.':'Pagamento confirmado na conta selecionada.';
  const target=document.querySelector('#transaction-schedule');target.hidden=!buy;
  if(buy){try{if(recalculate&&!f.elements.firstMonth.dataset.manual){const card=pCard(f.elements.cardId.value);if(card&&E.validDate(f.elements.movementDate.value))f.elements.firstMonth.value=E.firstInvoice(card,f.elements.movementDate.value);}const rows=E.purchaseSchedule(api.profile(),{cardId:f.elements.cardId.value,date:f.elements.movementDate.value,amount:E.cents(f.elements.amount.value),count:split?Number(f.elements.count.value):1,firstMonth:f.elements.firstMonth.value,description:f.elements.description.value||'Prévia da compra',categoryId:f.elements.categoryId.value});target.innerHTML=scheduleHTML(rows);}catch(error){target.innerHTML=`<div class="notice">Prévia: ${esc(error.message)}</div>`;}}
 }
 function pCard(id){return api.profile().cards.find(c=>c.id===id);}
 function scheduleHTML(rows){return `<details class="schedule-preview"><summary>${rows.length===1?'À vista':rows.length+' parcelas'} · total ${E.money(rows.reduce((a,e)=>a+e.amount,0))} · conferir</summary><p class="muted">Primeira ${rows[0].month} · última prevista ${rows.at(-1).month}, vencimento ${rows.at(-1).date.split('-').reverse().join('/')}</p><div class="table-wrap"><table><thead><tr><th>Parcela</th><th>Competência</th><th>Vencimento</th><th>Valor</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.number}/${r.count}</td><td>${r.month}</td><td>${r.date.split('-').reverse().join('/')}</td><td>${E.money(r.amount)}</td></tr>`).join('')}</tbody></table></div></details>`;}
 function values(f){const get=n=>f.elements[n]?.disabled?'':f.elements[n]?.value||'',method=get('paymentMethod'),kind=get('kind'),buy=kind==='expense'&&method==='credit';return {id:get('id')||undefined,kind,paymentMethod:method,description:get('description').trim(),amount:E.cents(get('amount')),categoryId:get('categoryId')||undefined,expenseClass:kind==='expense'?get('expenseClass'):undefined,movementDate:get('movementDate')||get('date'),date:get('date')||get('movementDate'),month:get('month')||get('firstMonth')||E.month(get('movementDate')),accountId:get('accountId')||null,toAccountId:kind==='transfer'?get('toAccountId'):null,cardId:method==='credit'?get('cardId'):null,count:buy?(get('purchaseMode')==='installments'?Number(get('count')):1):undefined,firstMonth:buy?get('firstMonth'):undefined,estimated:f.elements.estimated.checked,notes:get('notes')};}
 document.addEventListener('input',e=>{if(e.target.closest('#entry-form')&&['amount','description','count','movementDate','firstMonth'].includes(e.target.name)){if(e.target.name==='firstMonth')e.target.dataset.manual='1';sync(['movementDate'].includes(e.target.name));}});
 document.addEventListener('change',e=>{if(e.target.closest('#entry-form')){if(['firstMonth','date'].includes(e.target.name))e.target.dataset.manual='1';sync(['cardId','paymentMethod','movementDate','kind'].includes(e.target.name));}});
 document.addEventListener('invalid',e=>{if(e.target.closest('#entry-form')){for(let n=e.target.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;}},true);
 return {open,values};
}
root.NatTransactionForm={create};
})(globalThis);
