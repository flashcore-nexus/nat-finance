# Publicação GitHub Pages · Nat Finance

Publicação pública expressamente autorizada pelo responsável em 24/11/2026 para **flashcore-nexus/nat-finance**, incluindo criação do repositório se necessário. Endereço definitivo: **https://flashcore-nexus.github.io/nat-finance/**. O relatório `PUBLICACAO-VERIFICADA.md` registra o resultado da implantação e os testes no endereço público. As instruções abaixo descrevem a configuração e as futuras implantações manuais.

## Depois da autorização

1. Revise as alterações locais, os resultados dos testes e `.gitignore`. Nunca adicione `Backups/`, resultados de testes, perfis de navegador ou JSONs pessoais. `tests/fixtures-backups/` contém apenas um exemplo fictício para regressão.
2. Crie ou escolha o repositório autorizado e envie as fontes. Se precisar de uma branch de preparação, use `codex/nat-finance-pwa`. Nenhum endereço de conta ou repositório está fixo no código.
3. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**. Confirme as condições de visibilidade do Pages no plano e organização utilizados: código privado não garante site privado.
4. Configure, nas variáveis de Actions do repositório, `PAGES_PUBLICATION_APPROVED=true`. Quando o plano permitir, configure revisores obrigatórios no ambiente `github-pages` para também exigir aprovação de cada implantação.
5. Em **Actions → Publicar Pages (autorização necessária) → Run workflow**, escolha a branch revisada e digite `PUBLICAR NAT FINANCE`. O fluxo executa os 38 testes, gera e confere o pacote, envia apenas `dist/` e implanta. A variável ausente/falsa ou a frase diferente faz o fluxo pular a publicação. Não há publicação em push.
6. Abra o endereço HTTPS retornado pelo Pages, confirme o manifest e cache offline, feche/reabra, teste atualização sem versão nova e migre um backup de teste. Faça a validação em iPhone/Safari e na instalação real antes de considerar essas plataformas validadas. Só então transfira os backups completos definitivos.

Os caminhos `./` funcionam tanto em `https://CONTA.github.io/REPOSITORIO/` quanto na raiz ou domínio próprio. Mantenha a barra final. Não edite caminhos para inserir o nome do repositório. O SW se limita à pasta da instalação; cache de outro aplicativo não é removido. O banco original é compartilhado por origem, portanto não crie duas cópias Nat Finance com expectativas de isolamento no mesmo domínio.

## Novas versões

Edite `src/`/`public/`, atualize a versão semântica em `package.json`, execute os testes e o build e revise `version.json`. A implantação deve conter o pacote inteiro da mesma geração. Não envie só o novo `sw.js`. Uma implantação em andamento ou arquivo divergente faz a preparação offline falhar com segurança; a versão instalada continua disponível e a próxima consulta pode tentar novamente.

O usuário precisa aceitar a nova versão; não há recarga automática com trabalho aberto. O cache antigo é retirado somente na ativação aprovada. IndexedDB, JSONs exportados e caches fora do escopo Nat Finance não são apagados.

Para desfazer uma entrega, restaure as fontes desejadas, **aumente** o número da versão e publique um pacote completo novo. Versões semânticas inferiores não são oferecidas como atualização. Reverter arquivos estáticos não reverte movimentações financeiras; restauração de dados é uma decisão separada, pela interface JSON. Não limpe armazenamento do navegador para solucionar uma atualização.

## Referências oficiais

- [GitHub Pages: workflows personalizados](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [MDN: utilização de service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Ciclo de atualização de PWAs](https://web.dev/learn/pwa/update)
