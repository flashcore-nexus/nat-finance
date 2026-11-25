# Validação local · Nat Finance V2.0

Data: **24/11/2026**. Geração: `290b265bf165120085f0572f`. Ambiente: **Windows/Chrome automatizado**, em servidores localhost, com perfis isolados e dados fictícios. A conexão é desativada após a instalação do cache para os fluxos offline. Nenhum navegador com dados pessoais do usuário foi aberto.

## Resultado final: aprovado nas verificações executadas

| Verificação | Resultado |
| --- | --- |
| Motor e parsers | 38 testes aprovados, antes e depois do redesign |
| Regressão dos fluxos existentes | 57 verificações aprovadas nas quatro suítes anteriores, com navegação adaptada à V2.0 |
| Experiência específica V2.0 | 13 cenários completos aprovados |
| PWA, integridade e atualização | Suíte completa aprovada; relatório com 22 etapas, incluindo as cinco suítes agregadas |
| Atualização real da distribuição 1.5.0 para 2.0.0 | Aprovada, usando o mesmo endereço, service worker e IndexedDB |
| Preservação completa do estado financeiro na atualização | Estado antes/depois idêntico, inclusive após recarga offline |
| Ajuda de instalação e painel PWA | Aprovados em 320, 390 e 1440px; sem erros de console nessa conferência |
| Layout da aplicação | Navegação e fluxos testados em 320, 390, 430 e 1440px; capturas finais em 320, 390 e 1440px inspecionadas |
| Build e conteúdo de publicação | Determinístico, caminhos relativos, 18 recursos conferidos por SHA-256, pacote sem arquivos pessoais |

Não somar as etapas agregadas do relatório PWA aos testes internos como se fossem testes independentes.

## Fluxos efetivamente exercitados

- Quatro áreas principais, acesso a todos os módulos em Mais, menu lateral recolhível e navegação inferior. A ação rápida ocupa um espaço central próprio na barra móvel; a geometria foi conferida para não cobrir controles do conteúdo. Ausência de transbordamento horizontal da página.
- Estado vazio sem saldo inventado; orientação inicial dispensável; saudação e isolamento Douglas/Vanessa; troca de mês e seleção de cartão.
- Cadastro de contas, carteira e cartões; lançamento pendente sem baixa; Pix, dinheiro, débito, receita e transferência; edição de pendência e proteção contra edição de registro já pago.
- Compra à vista e parcelada no formulário geral; previsão de primeira e última parcela; ajuste da primeira fatura; centavos exatos; pagamento de fatura sem duplicar consumo; pagamento de despesa, estorno e histórico de pagamentos.
- CSV e XLSX, PDF textual e OCR real de PNG/JPG/JPEG e PDF digitalizado, inclusive cancelamento. Prévia editável, conferência de categoria, origem não identificada, associação por perfil, conciliação de parcela e bloqueio de reimportação.
- Recorrências de despesas e receitas, orçamentos, metas, fechamento e abertura de competência; repetição sem duplicação de registros; parcelas e meses antigos preservados.
- Arquivos JSON reais exportados: completo, mensal e criptografado. Senha incorreta recusada; restauração com confirmação e conflito; criação de perfil separado; nomes personalizados e padrão preservados.
- Persistência após recarga e fechamento/reabertura do Chrome; recusa de gravação por janela desatualizada; mensagem de armazenamento indisponível quando os mecanismos são bloqueados no teste.
- Cache completo e primeira instalação sem aviso falso; mesma versão e ausência de conexão sem oferta falsa; atualização A → B mediante aceite e votação das abas; bloqueio por formulário, gravação/prévia pendente ou outra aba; pacote adulterado rejeitado; cache de outro projeto mantido; retrocesso de versão recusado; instalação em subpasta e na raiz.

## Integridade e preservação

A cópia preventiva anterior às alterações está em `Backups/v1_5_0_antes_v2_0/`, com distribuição 1.5.0, fontes, manifesto SHA-256 e o registro dos dois backups fictícios restaurados antes da mudança.

A comparação final de hashes confirmou **nenhuma alteração** em:

- `src/engine.js` e `src/storage.js`;
- `src/expense-import.js` e `src/ocr.js`;
- `src/sw.js` e `src/pwa.js`;
- manifest, ícones e workflows do GitHub Pages.

O CSS do PWA e o build foram ajustados apenas para a apresentação e inclusão da camada visual. Nome/esquema do IndexedDB, formato JSON, regras de cálculo e limites do importador/OCR permanecem iguais. O teste 1.5.0 → 2.0.0 compara o estado completo serializado, sem apagar ou recriar o banco.

Evidências locais: `tests/evidence-v2/`, `tests/evidence-v2-migration/`, `tests/evidence-pwa/`, `tests/evidence/`, `tests/evidence-v1_2/`, `tests/evidence-v1_3/` e `tests/evidence-v1_4/`. `preservacao.json` contém a comparação de hashes. Esses diretórios permanecem fora do Git e da publicação.

## Limites e publicação

Este relatório registra a validação local anterior à autorização. A publicação V2.0 foi autorizada em 24/11/2026; a conferência posterior em HTTPS público é registrada separadamente em `V2_0-PUBLICACAO.md`.

Não foram executados para a V2.0: teste em iPhone/Safari físico, instalação pelo sistema operacional, publicação HTTPS real ou execução no GitHub Actions. A compatibilidade de layout e os critérios de instalação do Chromium não comprovam essas plataformas. A precisão do OCR continua aproximada e exige conferência humana.

Nenhum banco online, autenticação, sincronização ou nova funcionalidade financeira foi introduzido.
