# Nat Finance

Desenvolver sobre `src/`, `public/` e `scripts/`. `dist/` é gerado com `node scripts/build.mjs`; nunca corrigir só a saída. `build.js` delega ao mesmo build. HTMLs antigos são fontes de migração congeladas, não o aplicativo atual.

Preservar o motor financeiro e a persistência existentes: IndexedDB `nat_finance_offline`, versão física 1, store `state`, chave `main`; JSON versão 1. Dados reais ficam fora de testes e Git. Não adicionar servidor financeiro, autenticação ou sincronização sem solicitação explícita. Antes de alterações arriscadas, preservar cópia e validar backups disponíveis. Nunca utilizar perfil normal do navegador em automações.

Regressão: `node --test tests/engine.test.js tests/expense-import.test.js tests/transactions-v1_3.test.js tests/consolidated-v1_4.test.js`, `node scripts/build.mjs`, `node scripts/check-dist.mjs` e `node tests/pwa-browser.test.cjs` com Playwright instalado. Documentar navegador/protocolo realmente testados. Não afirmar validação de iPhone, instalação do sistema ou HTTPS público com base somente em emulação ou localhost.

Versões: aumentar `package.json.version` em entregas; build determinístico, arquivos estáticos com hashes, consultas de `version.json` sempre pela rede. Não mostrar atualização só por haver conexão ou SW registrado. Preservar aprovação explícita, conferência integral do pacote e votação das abas antes de ativar. Não armazenar dados financeiros no Cache Storage. Caminhos relativos para Pages em subpastas.

Publicação pública exige autorização expressa do usuário. O workflow manual e a variável de liberação não substituem essa autorização. CI comum valida sem publicar. Publicar somente `dist/`.

V2.0: manter as quatro áreas Início/Lançamentos/Cartões/Mais, formulário progressivo e campos avançados acessíveis. Apresentação em `src/view.js`/`src/minimal.css`; evitar duplicar cálculos ou adicionar outra implementação do formulário de compra. `npm run test:browser` inclui a regressão V2; `test:v2` executa esse fluxo isolado. `test:migration` exige a distribuição 1.5.0 preservada ou `NAT_BASELINE_DIST`. `test:published` compara a publicação à versão local e só deve ser usado após a implantação autorizada dessa versão.
