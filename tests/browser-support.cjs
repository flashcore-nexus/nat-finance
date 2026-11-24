const path=require('node:path');
exports.appURL=root=>process.env.NAT_APP_URL||require('node:url').pathToFileURL(path.join(root,'Nat_Finance_v1_1.html')).href;
exports.externalRequest=r=>/^https?:/.test(r.url())&&(!process.env.NAT_APP_URL||new URL(r.url()).origin!==new URL(process.env.NAT_APP_URL).origin);
exports.loadApp=async(page,url)=>{
 if(/^https?:/.test(url)){await page.context().setOffline(false);await page.goto(url);await page.waitForFunction(()=>window.NatPWA?.ready&&navigator.serviceWorker.controller,{},{timeout:60000});await page.context().setOffline(true);}
 else await page.goto(url);
};
