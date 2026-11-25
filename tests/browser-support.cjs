const path=require('node:path');
exports.appURL=root=>process.env.NAT_APP_URL||require('node:url').pathToFileURL(path.join(root,'Nat_Finance_v1_1.html')).href;
exports.externalRequest=r=>/^https?:/.test(r.url())&&(!process.env.NAT_APP_URL||new URL(r.url()).origin!==new URL(process.env.NAT_APP_URL).origin);
exports.loadApp=async(page,url)=>{
 if(/^https?:/.test(url)){await page.context().setOffline(false);await page.goto(url);await page.waitForFunction(()=>window.NatPWA?.ready&&navigator.serviceWorker.controller,{},{timeout:60000});await page.context().setOffline(true);}
 else await page.goto(url);
};
exports.reveal=async locator=>{
 const details=locator.locator('xpath=ancestor::details');
 for(let i=await details.count()-1;i>=0;i--){const d=details.nth(i);if(await d.getAttribute('open')===null)await d.locator(':scope>summary').click();}
};
exports.navigate=async(page,name)=>{
 const ids={'Início':'dashboard','Visão geral':'dashboard','Lançamentos':'entries','Cartões':'cards','Mais':'more','Importar despesas':'imports','Cadastros':'registrations','Contas bancárias':'accounts','Cartões de crédito':'card-register','Categorias':'categories','Contas fixas':'rules','Receitas recorrentes':'income-rules','Perfis financeiros':'profiles','Orçamentos e metas':'planning','Meses e fechamentos':'months','Relatórios':'reports','Backup e restauração':'backups','Configurações':'settings','Sobre o aplicativo':'about'},id=ids[name];if(!id)throw Error('Destino desconhecido: '+name);
 const mobile=await page.locator('#bottom-nav').isVisible(),primary=['dashboard','entries','cards','more'];
 if(mobile){const nav=page.locator('#bottom-nav');if(primary.includes(id)){await nav.locator('[data-page="'+id+'"]').click();return;}await nav.locator('[data-page=more]').click();if(id==='registrations'||['accounts','card-register','categories','rules','income-rules','profiles'].includes(id)){await page.locator('#main [data-page=registrations]').click();if(id==='registrations')return;}const target=page.locator('#main [data-page="'+id+'"]');await exports.reveal(target);await target.click();return;}
 if(id==='registrations'||id==='more'){const summary=page.locator('[data-nav-group="'+(id==='registrations'?'registrations':'more')+'"]');if(await summary.getAttribute('aria-expanded')==='true')await summary.click();await summary.click();return;}
 const target=page.locator('#nav [data-page="'+id+'"]');await exports.reveal(target);await target.click();
};
exports.openPwa=async page=>{if(await page.locator('#pwa-panel').isVisible())return;await exports.navigate(page,'Sobre o aplicativo');await page.locator('#main [data-action=app-info]').click();};
exports.fillFields=async(page,id,values)=>{
 const purchase=id==='purchase-form';if(purchase&&await page.locator('#entry-form').count())id='entry-form';
 const f=page.locator('#'+id);
 if(purchase&&Number(values.count||1)>1){await f.locator('[name=purchaseMode]').selectOption('installments');}
 for(let [name,v]of Object.entries(values)){
  if(purchase&&id==='entry-form'&&name==='date')name='movementDate';
  const el=f.locator(`[name="${name}"]`);await exports.reveal(el);
  if(typeof v==='boolean')await el.setChecked(v);else if(await el.evaluate(e=>e.tagName)==='SELECT')await el.selectOption(String(v));else await el.fill(String(v));
 }
 return f;
};
exports.expandLegacy=async page=>{
 const ds=page.locator('#main details[data-disclosure]');
 for(let i=0;i<await ds.count();i++){const d=ds.nth(i);if(await d.getAttribute('open')===null)await d.locator(':scope>summary').click();}
};
