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
 name=name==='Visão geral'?'Início':name;
 const primary=['Início','Lançamentos','Cartões','Mais'],mobile=await page.locator('#bottom-nav').isVisible();
 const nav=page.locator(mobile?'#bottom-nav':'#nav');
 if(primary.includes(name)){await nav.getByRole('button',{name,exact:true}).click();return;}
 await nav.getByRole('button',{name:'Mais',exact:true}).click();await page.locator('#main').getByRole('button',{name:new RegExp('^'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();
};
exports.openPwa=async page=>{if(await page.locator('#pwa-panel').isVisible())return;await exports.navigate(page,'Mais');await page.locator('#main [data-action=app-info]').click();};
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
