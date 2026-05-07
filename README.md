# Bloom

MVP simples de um web app gamificado para jovens acompanharem o cuidado diario de uma planta por 7 semanas.

## Rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Crie um projeto no Firebase e ative:

- Authentication -> Anonymous
- Firestore Database
- Regras do Firestore: use `firestore.rules` como base para o MVP

3. Crie `.env.local` a partir de `.env.example` e preencha as chaves publicas do app web Firebase.

4. Rode o app:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Collections

- `users/{uid}`
- `dailyProgress/{uid_YYYY-MM-DD}`
Bloom Program que ajuda os jovens a cuidar de uma planta
