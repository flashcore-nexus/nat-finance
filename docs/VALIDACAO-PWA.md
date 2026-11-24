# Validação da entrega PWA 1.5.0

Build da entrega: `6399f3b5a8c34d9de4731b63`. Execução em 24/11/2026, Windows, Chrome instalado em modo automatizado, HTTP em localhost. Dados fictícios e perfis de navegador isolados. Nenhum perfil financeiro real do usuário foi aberto ou modificado.

## Preservação anterior às alterações

- Cinco JSONs de teste existentes foram analisados pelo motor; os completos também foram restaurados e validados. Resultado: `tests/evidence-pwa/backups-antes.json`.
- Cópia do HTML atual, fontes, bibliotecas e arquivos de distribuição preservada em `Backups/v1_4_antes_pwa/`, antes da conversão. A lista SHA-256 está em `Backups/v1_4_antes_pwa/SHA256.json`.
- Conferência final confirmou os mesmos hashes do HTML original, do motor e da persistência, tanto na origem quanto na cópia. `src/engine.js` e `src/storage.js` não foram alterados.
- Os quatro ZIPs de distribuição anteriores passaram pela conferência CRC de todos os membros: `tests/evidence-pwa/archives.json`. Essa conferência adicional foi realizada ao finalizar; a análise dos JSONs e a cópia preventiva ocorreram antes das alterações.

Os JSONs disponíveis para validação eram fictícios, de testes anteriores. A integridade dos dados pessoais que permanecem no navegador deve ser conferida pelo responsável ao exportar e migrar cada perfil, conforme o README. Validar um exemplo não comprova um backup pessoal que não foi fornecido.

| Arquivo preservado | SHA-256 |
| --- | --- |
| HTML V1.4 original | `1bb690d0ce3c7c7a1f7ee539e4d3729d49ee7995a20f100981a4349fc535453a` |
| `src/engine.js` | `a6ee5f26f8abe40cf9544d453d17016af939ca4e9edc74efb42c9536aac55e66` |
| `src/storage.js` | `4e6e6fe2c2e639558c7cbbd4f27bcfbff880836c78851d2d94c489a36917bc56` |

## Testes executados e aprovados

- **38 testes** do motor e parsers: centavos, obrigações, caixa, cartões, parcelas, baixas, transferências, recorrências, fechamento idempotente, histórico, duplicidades, conciliação e backups 1.1/1.2/1.3/1.4.
- **57 verificações de regressão** das quatro suítes de navegador existentes, executadas contra o PWA gerado: 15 da suíte original; 13 da importação; 14 da V1.3; 15 da V1.4. A abertura prepara o cache conectado; os fluxos posteriores rodam offline. Incluem restauração com conflitos, recusa de gravação por aba desatualizada, reabertura com persistência, exportação real, senha incorreta recusada, importação separada e navegação móvel.
- Suíte específica PWA: geração determinística, instalação em subpasta `/nat-finance/` e na raiz, manifest/ícones sem erros de instalabilidade reportados pelo Chromium, primeira instalação e verificações repetidas sem aviso falso, migração real por JSON e restauração de backup criptografado.
- Uso offline após recarga e após fechar/reabrir completamente o Chrome, com versão e estado financeiro preservados. Cache limitado à lista de recursos estáticos; metadados de versão consultados pela rede; cache de outro projeto preservado.
- Atualização real A → B: download, SHA-256, versão em espera, aceite, duas abas recarregadas e estado financeiro idêntico antes/depois. Formulário aberto, texto de importação pendente e formulário em outra aba impedem a troca.
- Pacote C com recurso adulterado: instalação recusada, cache incompleto removido, sem anúncio de nova versão e B continua funcionando offline. Hospedagem com versão semântica inferior: instalação recusada também no SW, sem retrocesso ao fechar todas as abas.
- OCR real offline de PNG, JPG, JPEG e PDF digitalizado, cancelamento, revisão obrigatória e importação confirmada. CSV, XLSX e PDF textual também testados offline.
- Ajuda de instalação em diálogo e painel PWA em 320, 390 e 1440px, sem transbordamento horizontal ou erros no console nesta conferência visual. Capturas inspecionadas.
- Conferência final de `dist/`: caminhos locais relativos, dimensões dos ícones, SHA-256 de todos os recursos e ausência de arquivos fora da lista de publicação. O pacote não inclui testes, backups nem perfis de navegador.

Evidências locais: `tests/evidence-pwa/`, `tests/evidence/`, `tests/evidence-v1_2/`, `tests/evidence-v1_3/`, `tests/evidence-v1_4/`. Foram mantidos alguns títulos históricos das suítes; os metadados de protocolo identificam a execução PWA HTTP. O relatório PWA inclui as quatro suítes como etapas agregadas. Não somar etapas agregadas com os testes internos como se fossem testes independentes.

## Limites confirmados

Não foram executados: instalação pelo menu do sistema operacional, iPhone/Safari físico, Edge nesta entrega, publicação HTTPS real, execução dos workflows nos servidores do GitHub ou migração de dados pessoais. Critérios de instalabilidade no Chromium e layout móvel não substituem esses testes.

A publicação permanece bloqueada por decisão do usuário até autorização expressa. Nenhum remoto foi configurado, nenhum push foi realizado e nenhum Pages foi habilitado nesta preparação. Os workflows foram preparados localmente; a validação CI não publica e o fluxo de publicação exige liberação manual.
