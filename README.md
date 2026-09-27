# Esporte — Sorteador de Times

Aplicação full-stack para cadastro de jogadores, sorteio equilibrado de times e administração de usuários. O frontend é Next.js, a API é Express e a persistência usa ArcadeDB.

## Desenvolvimento

1. Copie `.env.example` para `.env` e preencha os segredos.
2. Execute `npm install`.
3. Execute `npm run dev`.

No primeiro início, a API cria o schema e garante a conta master definida no ambiente. A senha é armazenada somente como hash scrypt. Fotos são redimensionadas no navegador e persistidas como Data URL; para produção em maior escala, use armazenamento de objetos e guarde apenas a URL no ArcadeDB.

## Aplicativos

- `apps/desktop`: shell Electron para Windows e macOS.
- `apps/mobile`: shell Expo/React Native para Android e iOS.
- O site também é responsivo e instalável como PWA.
