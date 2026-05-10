# Projeto Teâncum

MVP simples de um web app gamificado para jovens criarem habitos de oracao, leitura das escrituras e reflexao diaria.

No onboarding, cada jovem escolhe um nickname, define metas simples de oracao e paginas de escrituras, e pode adicionar uma tarefa diaria extra com XP menor.

Na primeira entrada, o app mostra uma abertura curta de aventura e salva `introSeen` no perfil para nao repetir sempre.

O tutorial inicial funciona como um primeiro projeto: complete 3 dias de metas para receber XP extra uma unica vez.

Projetos pessoais usam uma biblioteca de tarefas pre-definidas nas areas espiritual, fisica, intelectual e social. Cada tarefa pronta vale 10 XP, e o jovem tambem pode criar uma tarefa propria no projeto, valendo 5 XP.
No MVP atual, projetos pessoais podem ser criados com 1 a 3 tarefas, XP por tarefa concluida uma vez por dia e bonus de XP ao concluir todos os dias do projeto. Para manter foco e evitar ganho exagerado de XP, cada jovem pode ter no maximo 2 projetos pessoais ativos ao mesmo tempo. Projetos tem minimo de 3 dias; ate 13 dias sao curtos, 14 dias ou mais sao longos.

A tela principal foi separada em abas: Inicio, Hoje, Projetos e Perfil. A aba Inicio junta resumo do dia, XP disponivel e todas as missoes acionaveis, incluindo tarefas de projetos.

O Bloom fica reservado como um evento futuro de 7 semanas com grande recompensa de XP.

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
- `users/{uid}/projects/{projectId}`
- `dailyProgress/{uid_teancum_YYYY-MM-DD}`
