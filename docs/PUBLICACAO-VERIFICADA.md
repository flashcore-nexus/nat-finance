# Publicação verificada · Nat Finance 1.5.0

Publicação pública autorizada e realizada em **24/11/2026**.

- Aplicativo: **https://flashcore-nexus.github.io/nat-finance/**
- Repositório público: **https://github.com/flashcore-nexus/nat-finance**
- Geração publicada: `6399f3b5a8c34d9de4731b63`, idêntica à geração validada localmente.
- Commit da aplicação implantada: `a0266bfa60a440e3fe59fd6df99732547ecc6cd5`.
- [Implantação GitHub Pages concluída com sucesso](https://github.com/flashcore-nexus/nat-finance/actions/runs/45505520034).
- [Validação CI concluída com sucesso](https://github.com/flashcore-nexus/nat-finance/actions/runs/45505867614): 38 testes do motor/importação, build, hashes, quatro suítes de regressão, cenários PWA e interface, em Ubuntu/Chromium. Commit validado: `de0b5a06d348d488f1f447827bb29b1dd2b5738e`.
- HTTPS habilitado, publicação por GitHub Actions, somente conteúdo de `dist/`.

## Verificação real do endereço público

Chrome/Windows em perfil isolado, com dados fictícios; nenhuma sessão financeira pessoal foi aberta. Evidências locais em `tests/evidence-publicacao/`, excluídas do Git.

- HTTP 200 pelo endereço HTTPS; geração e versão conferidas com os arquivos locais.
- Service worker instalado e cache completo com conferência SHA-256 de todos os recursos.
- Manifest e critérios de instalabilidade sem erros reportados pelo Chrome.
- Verificações repetidas da mesma versão sem aviso de atualização.
- Recarga sem conexão e navegação nas dez páginas do aplicativo.
- Conta e despesa fictícias cadastradas pela interface offline, saldo calculado corretamente e estado preservado após recarga no IndexedDB original.
- Exportação real de backup JSON completo pela versão pública, sem conexão, e validação pelo motor.
- Somente solicitações GET de recursos estáticos na própria origem durante o teste; nenhum envio de dados financeiros ao servidor.
- Capturas desktop e 390px. Instalação pelo sistema e iPhone/Safari físico continuam sem teste.

Os arquivos públicos não contêm os backups pessoais, os perfis de navegador ou o banco financeiro do usuário. O repositório possui apenas exemplos fictícios destinados aos testes. Nenhum banco online, autenticação ou sincronização foi adicionado.

## Uso definitivo e migração

Abra o endereço público e espere a confirmação de cache offline completo em **Aplicativo e versão**. Instale pelo menu do Chrome/Edge ou, no iPhone, pelo Safari em **Compartilhar → Adicionar à Tela de Início**. Confira a persistência na instalação definitiva.

O HTML antigo e localhost usam origens diferentes do site publicado. Exporte **um backup JSON completo por perfil** no ambiente antigo, importe em **Backup e restauração** no PWA publicado e confira saldos, meses, cartões e parcelas. Não limpe os dados do navegador para atualizar. Preserve backups externos e faça uma nova exportação completa pelo PWA após conferir a migração.

## Desenvolvimento e próximas publicações

As fontes definitivas ficam neste repositório. O fluxo CI valida sem publicar; o Pages continua com implantação manual, variável `PAGES_PUBLICATION_APPROVED=true` e frase `PUBLICAR NAT FINANCE`. As mudanças de teste/documentação posteriores ao commit implantado não alteram a geração publicada.

A conferência de preservação final confirmou os hashes originais do motor, da persistência e dos HTMLs antigos mantidos no computador. A espera corrigida no teste de importação afeta somente a execução automatizada; não modifica o aplicativo publicado.

Para repetir a verificação do endereço público, execute `npm run test:published` com Playwright instalado. O teste cria um perfil isolado e usa somente dados fictícios; não exige nem acessa seus backups pessoais.
