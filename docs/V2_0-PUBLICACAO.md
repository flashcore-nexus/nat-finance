# Publicação verificada · Nat Finance V2.0

**Publicação autorizada e verificada em 24/11/2026, horário de Brasília.**

- Aplicativo: **https://flashcore-nexus.github.io/nat-finance/**
- Repositório: **https://github.com/flashcore-nexus/nat-finance**
- Versão: **2.0.0**. Geração: `290b265bf165120085f0572f`.
- Commit implantado: `17ab1d7c8bc85d97b467b4e068a227b05132825f`.
- [Validação automática aprovada](https://github.com/flashcore-nexus/nat-finance/actions/runs/45515502198).
- [Implantação GitHub Pages concluída](https://github.com/flashcore-nexus/nat-finance/actions/runs/45515885788).

A suíte do GitHub passou em Ubuntu/Chromium: motor/importação, regressão financeira anterior, experiência V2.0, PWA, atualização, cache, interface e build. A alteração posterior ao redesign corrigiu somente a espera do teste pelo foco do campo de descrição; os arquivos da aplicação e a geração aprovada permaneceram iguais.

## Atualização real em HTTPS, com dados locais preservados

Antes da implantação, foi preparado um **perfil de navegador isolado** na produção 1.5.0, com dados fictícios nos espaços Douglas e Vanessa: contas, cartões, parcelas, pagamentos, receitas e histórico. Nenhum perfil pessoal do usuário foi aberto.

Depois da implantação, o mesmo perfil voltou ao mesmo endereço público e atualizou para 2.0.0 pelo mecanismo real de service worker e aceite. A comparação do **estado completo serializado do IndexedDB antes/depois foi idêntica**. A recarga offline manteve os dados dos dois perfis. Backups gerados após a atualização foram validados pelo motor e suas coleções conferidas com o estado anterior.

O banco continua `nat_finance_offline`, versão física 1, store `state`, chave `main`. Não houve limpeza ou recriação do banco. Motor, persistência, parser/importador, OCR e protocolo de atualização permanecem preservados. A publicação entrega somente arquivos estáticos de `dist/`.

## Conferência adicional do endereço público

Em outro perfil isolado, Chrome/Windows:

- HTTPS retornou a geração exata revisada, com cache completo e hashes dos recursos verificados.
- Manifest e critérios de instalabilidade sem erros reportados pelo Chrome.
- Mesma versão consultada repetidamente sem aviso de atualização.
- Recarga e navegação offline nas dez páginas/módulos verificados, através da navegação nova.
- Conta e despesa fictícias cadastradas pela interface offline, com saldo correto e persistência após recarga.
- Backup JSON completo realmente exportado offline e validado.
- Nenhuma solicitação de envio: somente GET de recursos estáticos na própria origem nos testes. Nenhum dado financeiro foi transmitido ao servidor.
- Capturas desktop e 390px salvas localmente.

Evidências locais: `tests/evidence-publicacao/` e `tests/evidence-publicacao-v2/`. Esses diretórios, os perfis de teste e os backups pessoais ficam fora do Git e da publicação. O repositório contém somente exemplos financeiros fictícios para testes.

## Como atualizar

Mantenha o mesmo endereço, navegador e perfil usados anteriormente. Abra **Aplicativo e versão → Verificar atualização → Atualizar agora** quando a versão estiver pronta. Na V2.0, o painel fica em **Mais**. Conclua formulários ou prévias abertas nas demais abas antes de aceitar a troca. A atualização altera os arquivos do aplicativo e conserva os dados locais.

Backups JSON continuam disponíveis por perfil, completos, mensais, personalizados ou criptografados. A transferência de um HTML antigo, localhost ou outro navegador para o site público continua exigindo exportação/importação de backup completo, pois são ambientes diferentes.

## Limites

Instalação pelo sistema operacional e iPhone/Safari físico continuam sem teste. A verificação de layout em largura móvel e os critérios de instalação do Chromium não substituem esses testes. Não foi adicionado banco online, autenticação ou sincronização automática.
