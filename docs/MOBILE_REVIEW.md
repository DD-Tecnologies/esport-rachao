# Revisão mobile web

Data: 16/10/2026

## Implementado

- Navegação inferior fixa, com área segura de iPhone/Android e rolagem horizontal quando houver itens administrativos.
- Sorteio em abas no celular: **Disponíveis** e **Lista do jogo**.
- Ao adicionar um jogador no celular, a tela permanece em **Disponíveis**, permitindo incluir vários atletas sem troca automática de aba.
- Ao concluir o sorteio, um diálogo pergunta se o usuário deseja abrir a quadra; a resposta negativa mantém o resultado salvo e o usuário no sorteio.
- Listas longas possuem rolagem interna para preservar o tamanho da tela.
- Botões de sortear e visualizar a quadra permanecem acessíveis acima da navegação inferior.
- Cards de jogadores utilizam imagens com carregamento preguiçoso nas listas.
- Quadra permite troca por toque: selecione dois jogadores do mesmo time.
- Placar possui botões de ponto maiores, cabeçalho compacto, orientação horizontal e pedido de bloqueio de tela quando o navegador permitir.
- Fluxo conectado: sorteio → quadra → placar → quadra, preservando a ordem salva na escalação.
- Campos numéricos usam `inputMode` adequado para abrir o teclado numérico no celular.

## Pontos a validar em dispositivo real

- Aparência do teclado em Android e iOS ao editar atributos e pesos.
- Pedido de bloqueio de tela, pois alguns navegadores recusam o recurso fora de modo instalado/PWA.
- Drag-and-drop da quadra: o fluxo de toque já é a alternativa principal em mobile.
- Instalação PWA: o manifesto existe, mas ainda faltam ícones dedicados para oferecer a instalação completa nos sistemas.

## Decisão de usabilidade

No celular, a troca de posição na quadra não depende de arrastar. O usuário toca no primeiro jogador e depois no segundo; isso evita conflitos entre gesto de rolagem e arrastar, especialmente em iOS.
