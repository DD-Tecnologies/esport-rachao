# Deploy seguro com GitHub Actions

O workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) valida o projeto em todo push para `main` e só então atualiza o checkout existente no VPS. Ele não envia o arquivo `.env`, senhas do ArcadeDB, JWT ou a senha master para o GitHub Actions.

## Fluxo

1. O GitHub Actions instala as dependências travadas pelo `package-lock.json`.
2. Executa `npm test` e os builds da API e do frontend.
3. Depois da aprovação, abre uma sessão SSH autenticada por chave e verificada por `known_hosts`.
4. O VPS faz `git pull --ff-only origin main` e `docker compose up -d --build`.
5. O `.env` já existente no VPS continua local ao servidor e nunca entra no repositório, logs ou runner.

## Secrets obrigatórios

Cadastre-os no ambiente GitHub **production**, não como variáveis comuns do repositório.

| Secret | Uso | Exemplo de formato |
| --- | --- | --- |
| `DEPLOY_HOST` | Hostname ou IP do VPS | `vps.exemplo.com` |
| `DEPLOY_PORT` | Porta SSH | `22` |
| `DEPLOY_USER` | Usuário SSH dedicado ao deploy | `deploy` |
| `DEPLOY_PATH` | Checkout já existente no VPS | `/opt/esporte` |
| `DEPLOY_SSH_KEY` | Chave privada exclusiva do deploy | conteúdo PEM/OpenSSH completo |
| `VPS_KNOWN_HOSTS` | Chave pública do host SSH | linha completa de `known_hosts` |

Não cadastre `ARCADE_PASSWORD`, `JWT_SECRET`, `MASTER_PASSWORD` ou o `.env` como Secrets do GitHub para este fluxo: eles não são necessários ao pipeline e devem permanecer apenas no VPS.

## Preparação segura do VPS

1. Crie um usuário dedicado, sem senha e sem acesso administrativo geral.
2. Restrinja o `sudo` desse usuário somente aos comandos necessários para o projeto, ou dê a ele permissão controlada ao Docker.
3. Gere uma chave SSH exclusiva para GitHub Actions; não reutilize sua chave pessoal.
4. Adicione apenas a chave pública ao `~deploy/.ssh/authorized_keys` do usuário dedicado.
5. Copie a chave pública do host para `VPS_KNOWN_HOSTS` usando uma fonte confiável, por exemplo a impressão digital conferida diretamente no VPS. Não use `ssh-keyscan` sem validar a impressão digital.
6. Configure regras de proteção do ambiente `production` no GitHub para exigir aprovação antes do job de deploy, se desejar revisão humana.

## Segurança aplicada

- Permissão mínima: o workflow tem apenas `contents: read`.
- `actions/checkout` não mantém token do GitHub no checkout.
- Chave de deploy só existe durante a execução e é removida mesmo em falha.
- `StrictHostKeyChecking=yes` impede conexão com servidor cuja identidade não corresponda ao secret `VPS_KNOWN_HOSTS`.
- `git pull --ff-only` evita sobrescrever alterações locais inesperadas no VPS.
- Os comandos usam `set -euo pipefail` e não habilitam impressão de comandos ou variáveis.
- A concorrência impede dois deploys simultâneos.

## Validação após o deploy

O workflow valida compilação antes do deploy. Para validação pública completa, mantenha uma etapa posterior de health check quando o domínio estiver definido como secret separado ou use monitoramento externo para `GET /api/health`.
