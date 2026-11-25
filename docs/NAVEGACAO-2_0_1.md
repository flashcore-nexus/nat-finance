# Nat Finance 2.0.1 — navegação por finalidade

Revisão concluída em 24/11/2026. Build `5f9ccd51399430b7f729d9a2`. Posteriormente publicada com autorização expressa e validada no endereço público; veja [publicação V2.0.1](V2_0_1-PUBLICACAO.md). As verificações abaixo registram a preparação local; o relatório de publicação acrescenta a atualização e a navegação reais em HTTPS.

## Alterações

- Visão geral exclusivamente de consulta: saldo disponível, compromissos do mês, pago, em aberto, vencimentos, faturas e indicadores existentes. Sem inclusão, edição, pagamento, importação, backup ou fechamento. Mensagens curtas quando vazia e detalhes de lançamentos somente para leitura.
- Principal no desktop: Visão geral, Lançamentos, Cartões e Importar despesas diretamente visível.
- Cadastros recolhível: Contas bancárias, Cartões, Categorias, Contas fixas, Receitas recorrentes e Perfis financeiros. O diretório abre a área solicitada; formulários aparecem ao solicitar uma inclusão ou edição.
- Cartões operacional conserva faturas, compras, parcelamentos, pagamentos e estornos. Cadastro e edição dos metadados ficam em Cadastros > Cartões. Ambas as áreas consultam o mesmo registro existente; nenhuma tabela ou módulo financeiro foi duplicado.
- Contas fixas e receitas recorrentes são duas visualizações filtradas da mesma coleção de regras. A geração continua abrangendo ambas, com o motor original.
- Planejamento: Orçamentos e metas, Meses e fechamentos, Relatórios. Preparação, fechamento, abertura e reabertura de meses ficam nesse módulo, sem abrir automaticamente o formulário de backup ao concluir.
- Mais: Backup e restauração, Configurações, Sobre o aplicativo. O painel existente de instalação, cache e atualização está em Sobre o aplicativo > Aplicativo e versão.
- Mobile: Início, Lançamentos, Cartões, Mais. Mais contém Importar despesas, Cadastros, Planejamento, Backup, Configurações e Sobre. O botão rápido de inclusão aparece somente em Lançamentos.

## Preservação

A cópia anterior está em `Backups/v2_0_0_antes_navegacao_2_0_1/`, incluindo a distribuição V2.0.0 e seu inventário `SHA256.json`. Os 112 arquivos copiados foram conferidos, sem divergências. O backup JSON sintético disponível foi validado antes da alteração. Nenhum perfil financeiro pessoal foi aberto ou alterado.

Conferência SHA-256 de 17 arquivos protegidos confirmou ausência de alterações no motor, armazenamento, importadores, PWA, manifest, ícones e workflows. IndexedDB permanece `nat_finance_offline`, versão física 1, store `state`, chave `main`; backup JSON permanece na versão 1. Nenhum banco online, autenticação ou sincronização foi adicionado. O pacote contém somente arquivos estáticos, sem backups ou dados pessoais.

## Testes executados

Chrome no Windows, HTTP em localhost com subpasta `/nat-finance/`, perfis isolados e dados fictícios:

| Verificação | Resultado |
| --- | --- |
| Testes unitários de finanças, importação e compatibilidade | 38 aprovados |
| Suíte PWA completa | 22 verificações aprovadas, incluindo os cinco fluxos de regressão de navegador |
| Navegação 2.0.1 | 11 cenários aprovados |
| Formulários de todos os cadastros | Abertura correta e recorrências na mesma coleção |
| Cartão criado/editado no cadastro e usado na operação | Mesmo ID, um único registro e parcelas preservadas |
| Importação pelo menu | Prévia, confirmação e bloqueio de reimportação executados |
| Backup em Mais | Exportação real e leitura pelo motor executadas |
| Meses e recorrências | Preparação sem duplicar, fechamento com histórico e sem backup automático |
| Dashboard vazio, preenchido e mês encerrado | Sem ações de criação, edição, pagamento, backup ou fechamento |
| Layout mobile | Navegação completa em 320, 390 e 430 px, sem transbordamento horizontal |
| Ajuda de instalação/PWA | 320, 390 e 1440 px, sem erros de console |
| Atualização real 1.5.0 → 2.0.1 e 2.0.0 → 2.0.1 | Estado financeiro completo idêntico antes/depois, mesmo IndexedDB e backup compatível |
| Offline e novas versões | Recarga e reabertura completas offline; nenhuma notificação na mesma versão; pacote corrompido, abas ocupadas e downgrade protegidos |
| Pacote e caminhos | Build determinístico e 18 recursos SHA-256 conferidos; caminhos relativos preservados |

Evidências locais: `tests/evidence-navigation/`, `tests/evidence-pwa/`, `tests/evidence-v2-migration/`. Essas pastas contêm somente dados fictícios e não entram no Git ou na publicação.

**Limites:** larguras móveis em Chrome não equivalem a um iPhone físico. Safari/iPhone e instalação real no sistema não foram testados. A revisão 2.0.1 foi posteriormente testada no endereço público, conforme o relatório de publicação.

## Executar e revisar

Na pasta do projeto, execute `node scripts/build.mjs`, `node scripts/check-dist.mjs` e `node scripts/serve.mjs`. Abra `http://localhost:4173/nat-finance/`. A origem local tem armazenamento diferente do GitHub Pages; dados definitivos só devem ser migrados por backup completo JSON, conforme o README.

Os testes estão em `npm test`, `npm run test:browser`, `npm run test:ui` e `npm run test:migration`. Para repetir especificamente a atualização 2.0.0 → 2.0.1 em PowerShell, defina `$env:NAT_BASELINE_DIST` com o caminho absoluto de `Backups/v2_0_0_antes_navegacao_2_0_1/dist` e execute `npm run test:migration`. Use somente perfis isolados de teste.

Publicar somente `dist/`, após autorização expressa. Depois da implantação, executar o teste no endereço público e conferir versão, navegação, cache, dados fictícios e ausência de alerta indevido. Os usuários devem atualizar pelos controles do PWA, preservando os dados do site.
