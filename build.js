// Entrada de compatibilidade; o desenvolvimento principal agora gera dist/.
import('./scripts/build.mjs').then(m=>console.log(JSON.stringify(m.build(),null,2))).catch(e=>{console.error(e);process.exitCode=1;});
