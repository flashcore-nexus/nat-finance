# Nat Finance · by FlashCore

PWA 1.5.0, derivado da versão HTML 1.4. Dados financeiros locais, IndexedDB original e backups JSON compatíveis. Sem servidor financeiro, contas de acesso ou sincronização. A estrutura é o ponto de partida para futuras melhorias.

Endereço definitivo: **https://flashcore-nexus.github.io/nat-finance/**. Repositório: [flashcore-nexus/nat-finance](https://github.com/flashcore-nexus/nat-finance). Publicação autorizada pelo responsável em 24/11/2026. O endereço local de desenvolvimento usa um armazenamento diferente; transfira os dados por backup JSON ao começar no endereço definitivo.

## Executar

Requer Node.js 22 ou superior. Na pasta do projeto:

```powershell
node scripts/build.mjs
node scripts/check-dist.mjs
node scripts/serve.mjs
```

Abra **http://localhost:4173/nat-finance/** no Chrome ou Edge. Aguarde “Cache offline completo” em **Aplicativo e versão** antes de desconectar. O servidor atende somente este computador. Encerre com Ctrl+C. Abrir `dist/index.html` por duplo clique não instala o PWA. Não use navegação anônima para seus dados definitivos.

Com npm instalado, os equivalentes são `npm run build`, `npm run check` e `npm start`. O aplicativo pronto não depende de Node nem npm: a hospedagem entrega somente arquivos estáticos.

## Instalar e atualizar

No Chrome/Edge, use **Aplicativo e versão → Instalar aplicativo**, quando disponível, ou a opção de instalação do navegador. No iPhone, abra o endereço HTTPS no Safari e use **Compartilhar → Adicionar à Tela de Início**. Faça a primeira abertura conectado e confirme o uso offline na instalação em que trabalhará. O navegador e o aplicativo instalado podem usar áreas de armazenamento diferentes em algumas plataformas; confira os perfis e importe o JSON na instalação definitiva, se necessário.

O aplicativo consulta a versão ao abrir, ao voltar à aba, ao recuperar a conexão e a cada 15 minutos com a aba visível. Você também pode usar **Verificar atualização**. A consulta exige conexão. Só há aviso quando existe uma versão diferente elegível e seu pacote foi integralmente baixado e conferido. Primeira instalação, mesma versão, falta de conexão e download incompleto não geram aviso de nova versão.

Escolha **Atualizar agora** depois de salvar o trabalho. Formulários, gravações, OCR e prévias de importação pendentes impedem a troca. Todas as abas abertas precisam confirmar que estão prontas; uma aba sem resposta adia a operação. **Depois** conserva a versão atual e permite verificar novamente. A troca atualiza arquivos estáticos e mantém IndexedDB e backups. Não limpe dados do site para atualizar. Navegadores podem remover armazenamento local por limpeza manual ou políticas de espaço: mantenha seus backups externos.

## Migrar do HTML antigo

1. Abra o HTML antigo no **mesmo navegador e perfil** em que os dados estão. A versão preservada permanece em `Backups/v1_4_antes_pwa/`; os HTMLs antigos na raiz também foram mantidos.
2. Selecione Douglas, entre em **Backup e restauração → Salvar Backup**, escolha **Completo · todo o histórico** e exporte. Confirme que o arquivo foi salvo. Repita para Vanessa e para cada perfil adicional. O backup é por perfil; mensal não substitui uma migração completa. Se usar senha, preserve-a.
3. Abra o PWA no endereço definitivo ou na instalação definitiva. Em **Backup e restauração**, selecione o JSON, confira origem, histórico e destino e confirme. Se o ID do perfil original ainda não existir, será criado um perfil separado. Pode aparecer “Douglas (importado)” ao lado do Douglas vazio inicial: nome igual não significa mesmo perfil. Se o ID já existir, confira os conflitos e o modo de mesclagem/restauração antes de confirmar; restauração substitui o histórico daquele perfil.
4. Confira meses antigos, saldos, cartões, parcelas, baixas, recorrências, metas e totais de cada perfil. Recarregue offline e confira a persistência. Exporte um novo backup completo pelo PWA antes de encerrar o uso do HTML.

`file://`, localhost e GitHub Pages são origens diferentes. A mudança de endereço, porta, navegador, perfil ou dispositivo não transfere o banco. Use JSON novamente ao sair do teste local para a hospedagem definitiva. O PWA não lê os dados do HTML automaticamente. Evite manter lançamentos paralelos nas duas versões após a migração.

## Desenvolvimento e testes

```powershell
node --test tests/engine.test.js tests/expense-import.test.js tests/transactions-v1_3.test.js tests/consolidated-v1_4.test.js
node scripts/build.mjs
node scripts/check-dist.mjs
```

Para os testes reais de navegador: instale as dependências com `npm install`, depois execute `npx playwright install chromium` e `npm run test:browser`. `npm run test:ui` confere também a ajuda de instalação e o painel em três tamanhos. No Windows, o teste usa o Chrome instalado; `NAT_BROWSER` permite indicar outro executável. Em outros sistemas, usa o Chromium do Playwright. `NAT_PLAYWRIGHT` pode apontar para uma instalação já existente de Playwright. Os testes abrem servidores somente locais e perfis isolados, sem acessar o perfil financeiro do usuário. Não execute a suíte em paralelo consigo mesma: os relatórios usam os mesmos caminhos. Não é necessário iniciar o servidor manualmente para a suíte.

Teste manual: importe um JSON de teste, registre uma despesa, feche/reabra o navegador, desligue a conexão e recarregue; teste OCR e backups. Teste instalação real e persistência no dispositivo de destino. Veja [validação realizada](docs/VALIDACAO-PWA.md).

## Estrutura definitiva

| Caminho | Finalidade |
| --- | --- |
| `src/engine.js`, `src/storage.js` | Motor e persistência preservados |
| `src/app.js`, formulários, navegação e importadores | Aplicativo existente e proteção de trabalho durante atualizações |
| `src/pwa.js`, `src/sw.js`, `src/pwa.css` | Instalação, atualização e cache offline |
| `public/manifest.webmanifest`, `public/icons/` | Manifest e ícones locais |
| `vendor/`, `Licencas/` | Bibliotecas, modelos OCR e licenças para uso offline |
| `scripts/` | Build determinístico, conferência e servidor local |
| `tests/` | Regressão financeira, fixtures fictícias e testes reais PWA |
| `tests/legacy/` | Somente motores históricos congelados para compatibilidade de backups |
| `.github/workflows/` | Validação e publicação manual protegida |
| `dist/` | Saída gerada; único conteúdo publicável |
| `Backups/` | Cópias locais preventivas, excluídas do Git e da publicação |

Edite as fontes, aumente `package.json.version` para uma nova entrega e gere novamente `dist`. `node build.js` é um atalho compatível para o novo build PWA. Os antigos HTMLs são referências congeladas e não recebem novas versões. O build não contém datas variáveis: mesmas fontes produzem o mesmo identificador e os mesmos arquivos. SHA-256 vincula cada recurso ao pacote; isso detecta download inconsistente, sem substituir a segurança HTTPS da hospedagem.

Não altere o nome/esquema do banco, formato JSON, regras de centavos, parcelas ou fechamento sem migração e testes explícitos. Não envie backups financeiros ao Git. Por serem mantidos os identificadores originais, PWAs Nat Finance no **mesmo domínio/origem** compartilham o IndexedDB mesmo em caminhos distintos. Use uma única instalação definitiva por origem; o escopo do cache separa os arquivos, não os bancos.

## Publicação no GitHub Pages

Veja [GitHub Pages e autorização](docs/PUBLICACAO.md). A validação automática não publica. A publicação é manual, exige uma variável de liberação e a frase de confirmação. Só `dist/` é enviado ao Pages. Os dados inseridos posteriormente continuam no navegador. O relatório de implantação e a verificação do endereço público serão registrados em `docs/PUBLICACAO-VERIFICADA.md`.
