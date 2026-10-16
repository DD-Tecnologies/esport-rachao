# Plano de testes — Rachão

Este documento registra o escopo de validação do projeto após as melhorias de jogadores, sorteio, quadra, placar, permissões atuais e experiência mobile.

## Ambientes e dados de teste

- Local: `npm run dev` com ArcadeDB de desenvolvimento.
- Produção: https://esporte.ddtech.cloud.
- Conta administrativa: `admmaster` (não deve perder a função `admin`).
- Perfis a validar: `default`, `leader` e `admin`.
- Massa mínima: 12 jogadores, incluindo foto, posições variadas, atributos diferentes e um jogador temporário.

## Níveis de teste

| Nível | Objetivo | Estado atual | Comando/ferramenta |
| --- | --- | --- | --- |
| Unitário | Regras puras, seleção do sorteio e segurança | Implementado | `npm test` |
| Build e tipos | Compilação de API e Next.js | Implementado | `npm run build --workspace=@esporte/api` e `npm run build --workspace=@esporte/web` |
| Integração | API + ArcadeDB + permissões | Checklist manual até existir suíte HTTP | Ver cenários abaixo |
| E2E visual | Fluxos completos em navegadores e celulares | Checklist manual | Chrome/Edge e dispositivos reais |
| Produção | Containers, saúde e rotas públicas | Implementado no deploy | `GET /api/health` e HTTP 200 das páginas |

## Casos funcionais

### Autenticação e usuários

- [ ] Login com usuário e senha válidos cria sessão.
- [ ] Credenciais inválidas retornam erro sem expor detalhes.
- [ ] Logout remove a sessão.
- [ ] Admin cria usuário `default`, `leader` e `admin`.
- [ ] Busca de usuários filtra por nome.
- [ ] Usuário master não pode ter função alterada ou ser removido.

### Jogadores e atributos

- [ ] Usuário `default` visualiza os cards e não visualiza controles de edição.
- [ ] Usuário `default` cria um jogador temporário.
- [ ] Jogador temporário recebe `temporary=true` e `expiresAt` com cerca de 24 horas.
- [ ] Jogador expirado não aparece em `GET /players`.
- [ ] Líder/admin criam jogador permanente e temporário.
- [ ] Campos de atributos aceitam inteiros de 0 a 100 e rejeitam valores fora do intervalo.
- [ ] Nome, número e posição são persistidos no ArcadeDB.
- [ ] Foto é comprimida no navegador antes do envio e reaparece no card.
- [ ] O card, o radar e o Position Skill atualizam antes de salvar.
- [ ] Exclusão exige a digitação exata do nome do jogador.

### Pesos

- [ ] Somente admin acessa a página de pesos.
- [ ] Pesos aceitam decimais a partir de 0,1.
- [ ] A soma por função é exibida e destaca total diferente de 100%.
- [ ] Salvar e recarregar preserva os pesos no ArcadeDB.
- [ ] Peso alterado modifica o Position Skill e o equilíbrio do sorteio.

### Sorteio, quadra e placar

- [ ] No mobile, adicionar jogador mantém a aba **Disponíveis** ativa e atualiza o contador da lista.
- [ ] Remover jogador devolve-o à lista disponível.
- [ ] A lista informa quantos jogadores faltam para o sorteio.
- [ ] Sorteio exige quantidade mínima configurada.
- [ ] Sorteio gera times e grava o histórico.
- [ ] Após sortear, o diálogo pergunta se o usuário quer abrir a quadra.
- [ ] Ao responder “não”, o resultado permanece salvo e o usuário continua na tela de sorteio.
- [ ] Ao responder “sim”, o usuário é levado à quadra com os times recém-sorteados.
- [ ] A quadra recebe os times do último sorteio.
- [ ] Troca por clique em dois jogadores do mesmo time funciona.
- [ ] Arrastar e soltar funciona em desktop.
- [ ] A escalação permanece ao sair e voltar para a quadra.
- [ ] “Ir para o placar” transfere a escalação da quadra como ordem inicial.
- [ ] Placar permite escolher dois times quando há mais de dois times sorteados.
- [ ] Placar inicia sem sorteio usando elenco disponível.
- [ ] Pontuação altera saque/rotação e persiste a partida.
- [ ] Desfazer restaura ponto, saque, rotação e sets anteriores.
- [ ] Tie-break de 15 e 21 substitui o último set de MD3/MD5.
- [ ] Botão “Quadra” retorna à escalação sem apagar a partida.

## Matriz mobile

Execute cada cenário em orientação vertical e, para placar, também horizontal.

| Tela | 360×800 | 390×844 | 412×915 | Critério de aceite |
| --- | --- | --- | --- | --- |
| Login | [ ] | [ ] | [ ] | Campos visíveis, teclado não cobre o botão de entrar |
| Jogadores | [ ] | [ ] | [ ] | Grade em uma coluna, cards e modal sem rolagem horizontal |
| Card do jogador | [ ] | [ ] | [ ] | Radar legível; edição numérica usável com teclado numérico |
| Sorteio | [ ] | [ ] | [ ] | Abas Disponíveis/Lista funcionam; ações não ficam sob a navegação |
| Quadra | [ ] | [ ] | [ ] | Ordem móvel `1-2-3 \| 4-5-6`; rede vertical à direita; toque em dois jogadores troca posições |
| Placar | [ ] | [ ] | [ ] | Botões de ponto têm área mínima de 44 px e placar permanece legível |
| Administração | [ ] | [ ] | [ ] | Busca, permissões e ações não estouram a tela |

## Regressão antes de cada deploy

1. Executar `npm test`.
2. Executar os builds da API e do web.
3. Conferir `git diff --check`.
4. Validar o fluxo: login → jogadores → sorteio → quadra → placar → desfazer → quadra.
5. Executar a matriz mobile nos tamanhos 360, 390 e 412 px.
6. Após deploy: validar `https://esporte.ddtech.cloud/api/health` e `https://esporte.ddtech.cloud/placar`.

## Cobertura planejada para automação

Prioridade para a próxima suíte de testes:

1. Extração de `makeTeams`, cálculo de pesos e regras de tie-break para módulos puros com testes unitários.
2. Testes HTTP da API com banco isolado ou mock do cliente ArcadeDB.
3. Playwright para autenticação, jogador temporário, sorteio → quadra → placar e regressão mobile.
