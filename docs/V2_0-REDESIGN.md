# Nat Finance V2.0 · interface minimalista

Publicação V2.0 expressamente autorizada em 24/11/2026 para https://flashcore-nexus.github.io/nat-finance/. A implantação e os testes no endereço público foram concluídos; consulte [Publicação V2.0 verificada](V2_0-PUBLICACAO.md). Este documento descreve o redesign e seus testes locais.

## O que mudou

- Quatro áreas principais: **Início, Lançamentos, Cartões e Mais**. No computador, menu lateral recolhível; no celular, navegação inferior com espaço próprio para a ação rápida, sem cobrir o conteúdo. Áreas seguras do dispositivo consideradas no CSS.
- Início com saudação por perfil, seletores compactos e quatro indicadores: saldo bancário disponível até hoje, compromissos do mês, pago e em aberto. O saldo utiliza `NatEngine.balances`; contas do tipo dinheiro/carteira não entram no indicador bancário. Contas antigas sem tipo mantêm o tratamento bancário compatível. Sem conta bancária, aparece uma ação de configuração, sem saldo inventado. Vencidos aparecem apenas quando existem.
- Ações reais para lançamento, importação e backup. Até cinco vencimentos e faturas resumidas. Relatórios, categorias, lista de contas e parcelamentos completos saíram da tela inicial e continuam nos módulos correspondentes. Orientação inicial opcional, dispensável por perfil, sem modificar seu histórico.
- Formulário de lançamento progressivo. Descrição recebe o foco inicial. Tipo, descrição, valor, categoria e pagamento vêm primeiro; vencimento é solicitado para pendências. Conta, cartão, transferência e parcelas aparecem conforme a operação. Competência, datas específicas, classificação, estimativa e observações ficam em **Mais opções**. Nenhuma regra financeira foi afrouxada: a opção inicial não cria pagamento, datas continuam validadas e registros com baixas continuam protegidos.
- **Nova compra** usa o mesmo formulário geral de lançamentos. A prévia do cronograma pode ser expandida. O cartão mostra primeiro nome, fatura, vencimento e situação; compras, pagamentos, futuro e informações do cartão ficam nos detalhes selecionados.
- Importação começa pelo arquivo. Configurações de leitura, perfil/mês, texto manual, associações e histórico ficam recolhidos. Mapeamento, origem, seleção e conciliação continuam editáveis. A revisão e a confirmação permanecem obrigatórias. No celular, as linhas da prévia são apresentadas como blocos, preservando os mesmos campos e a detecção de duplicidades. CSV, XLSX, PDF textual e OCR de PNG/JPG/JPEG/PDF digitalizado continuam locais.
- Preparar o mês mostra um resumo de contas fixas, receitas, parcelas, orçamentos e metas. A seleção detalhada permanece acessível e a abertura repetida continua idempotente. Contas fixas e recorrências seguem no módulo existente; não foi criada uma nova regra de recorrência no formulário avulso.
- Backup continua completo por padrão; opções de nome, período, mensal e criptografia estão em **Personalizar backup**. Nomes de arquivo, formatos antigos, restauração, conflitos e confirmação de substituição foram preservados. O rodapé informa apenas a exportação solicitada, sem prometer armazenamento no iCloud.

## Preservação

Cópia anterior às alterações: `Backups/v1_5_0_antes_v2_0/`, com 103 arquivos, distribuição 1.5.0, fontes e manifesto SHA-256. Dois backups fictícios disponíveis foram restaurados e validados antes das mudanças; nenhum perfil financeiro pessoal foi aberto.

`src/engine.js`, `src/storage.js`, importador/parser, OCR, service worker, controle de atualização, manifest, ícones e workflows do GitHub Pages permanecem preservados. O IndexedDB continua `nat_finance_offline`, versão física 1, store `state`, chave `main`; JSON continua na versão compatível. A apresentação não recria, limpa ou migra o banco. Não há banco remoto, autenticação ou sincronização.

As mudanças principais estão em `src/view.js`, `src/minimal.css`, `src/navigation.js`, `src/transaction-form.js`, apresentação de `src/app.js` e estrutura visual de `src/shell.html`. O build continua único, determinístico e compatível com caminhos relativos do Pages. O CSS do painel PWA foi ajustado à navegação nova, sem alterar a detecção ou a aprovação de novas versões.

## Executar e revisar

Na pasta do projeto, com Node.js 22 ou superior:

```powershell
node scripts/build.mjs
node scripts/check-dist.mjs
node scripts/serve.mjs
```

Abra http://localhost:4173/nat-finance/. Também pode usar `Iniciar Nat Finance PWA.cmd`. O relatório de publicação identifica a geração confirmada no endereço público. HTML antigo, localhost e site público têm armazenamentos distintos; a transferência entre origens continua sendo por backup JSON completo de cada perfil.

## Verificações

```powershell
npm test
npm run build
npm run check
npm run test:browser
npm run test:ui
npm run test:migration
```

Os testes de navegador exigem Playwright. `test:browser` cobre o PWA e as suítes financeiras anteriores, adaptadas à navegação e às seções recolhidas, além do fluxo específico da V2.0. `test:v2` executa somente esse fluxo. Os critérios financeiros anteriores foram mantidos; os critérios visuais de dez destinos diretos foram atualizados para quatro áreas e acesso via Mais.

`test:migration` usa a cópia 1.5.0 preservada, no mesmo servidor local e no mesmo perfil isolado, e instala a V2.0 pelo service worker real. Compara o estado completo do IndexedDB antes/depois, incluindo histórico, cartões, parcelas, baixas, orçamentos, metas e os dois perfis, e recarrega offline. Se usar outro computador, informe `NAT_BASELINE_DIST` com a distribuição 1.5.0 preservada. A cópia preventiva permanece fora do Git.

O resultado final e os limites de verificação são registrados em `V2_0-VALIDACAO.md`. Evidências e capturas usam somente dados fictícios em `tests/evidence-v2/` e `tests/evidence-v2-migration/`; ficam fora do Git.

## Limites

Layout em largura de iPhone e áreas seguras no CSS não equivalem a teste em iPhone físico. Instalação real pelo sistema e Safari/iPhone físico continuam pendentes. A etapa local descrita aqui foi complementada por implantação em HTTPS e execução no GitHub Actions, conforme [relatório de publicação](V2_0-PUBLICACAO.md). Formatos, limites e precisão do OCR continuam sujeitos às restrições existentes e à conferência manual. Nenhuma interpretação financeira por IA externa foi adicionada.
