# Nat Finance V2.0.1 — publicação verificada

Publicação no repositório `flashcore-nexus/nat-finance` autorizada expressamente pelo responsável e concluída em 24/11/2026, horário de Brasília.

- Aplicativo: **https://flashcore-nexus.github.io/nat-finance/**
- Versão: **2.0.1**. Build: `5f9ccd51399430b7f729d9a2`.
- Commit implantado: `6cd60d35f3a9017ca13875434073607b9f7b8dda`.
- [Validação automática aprovada](https://github.com/flashcore-nexus/nat-finance/actions/runs/45524587975): testes financeiros, importação, regressões de navegador, PWA e interface em Ubuntu/Chromium.
- [GitHub Pages concluído](https://github.com/flashcore-nexus/nat-finance/actions/runs/45524937250): somente a distribuição estática `dist/` foi publicada.

## Atualização real com preservação dos dados

Antes da implantação, um perfil de Chrome isolado foi preparado no endereço público V2.0.0 com dados fictícios em Douglas e Vanessa: contas, cartões, compras parceladas, pagamentos, receitas e histórico. Nenhum perfil pessoal foi aberto ou alterado.

Após a implantação, o mesmo perfil atualizou para V2.0.1 pelo mecanismo real de service worker e aceite. O estado completo serializado permaneceu **idêntico** antes/depois. A recarga offline manteve esse mesmo estado. Todos os conjuntos financeiros dos backups dos dois perfis foram conferidos com o estado anterior.

IndexedDB continua `nat_finance_offline`, versão física 1, store `state`, chave `main`; JSON versão 1. Motor, persistência, importadores, OCR, manifest, ícones e protocolo de atualização permanecem preservados. A cópia anterior de 112 arquivos continua íntegra em `Backups/v2_0_0_antes_navegacao_2_0_1/`.

## Testes executados no endereço público

Chrome/Windows em HTTPS, com perfis isolados e dados fictícios:

- Geração pública igual ao build revisado, cache completo com integridade e critérios de instalação sem erros no Chrome.
- Consulta repetida da mesma versão sem aviso de atualização.
- Recarregamento e navegação offline em todos os módulos.
- Cadastro de conta e despesa fictícias pela interface offline, saldo correto e persistência no IndexedDB após recarga.
- Download real de backup JSON completo offline, validado pelo motor.
- Somente requisições GET de recursos da própria origem nos testes de publicação e atualização: nenhum envio de dados financeiros.
- Os 11 cenários completos de navegação foram novamente executados, desta vez carregando o PWA público e desconectando o contexto de teste: Dashboard vazio/preenchido/encerrado sem ações de alteração; todos os cadastros e formulários; cartão com mesmo ID no cadastro e na operação; recorrências sem duplicação; importação CSV com prévia, confirmação e bloqueio de reimportação; backup em Mais; fechamento mensal com histórico; navegação em 320/390/430 px e recarga offline.
- Nenhum erro de JavaScript ou acesso a origem externa registrado nas suítes.

Evidências locais: `tests/evidence-publicacao-v2_0_1/upgrade-results.json`, `tests/evidence-publicacao/resultados.json` e `tests/evidence-navigation-public/resultados.json`, com capturas desktop/mobile. Perfis e resultados sintéticos ficam fora do Git e da publicação.

## Como atualizar

Use o mesmo endereço, navegador e perfil em que seus dados estão. Na V2.0.0, abra **Mais → Aplicativo e versão → Verificar atualização** e, quando o pacote estiver pronto, **Atualizar agora**. Na V2.0.1, o painel fica em **Mais → Sobre o aplicativo → Aplicativo e versão**. Conclua formulários e importações pendentes em todas as abas antes de aceitar.

A troca atualiza os arquivos do aplicativo e mantém o banco local. **Não limpe os dados do site para atualizar.** Backups continuam em **Mais → Backup e restauração**, por perfil. Migrar de HTML antigo, localhost ou outro navegador continua exigindo exportação/importação do backup JSON completo, conforme o README.

## Limites

Layouts móveis foram testados em Chrome, sem iPhone/Safari físico ou instalação pelo sistema operacional. Esses ambientes não estão declarados como validados. Não foi adicionado banco online, autenticação ou sincronização automática.
