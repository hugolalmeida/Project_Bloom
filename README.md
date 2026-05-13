# Projeto Teâncum

MVP simples de um web app gamificado para jovens criarem hábitos de oração, leitura das escrituras e reflexão diária.

No onboarding, cada jovem escolhe um nickname, define metas simples de oração e páginas de escrituras, e pode adicionar uma tarefa diária extra com XP menor.

Na primeira entrada, o app mostra uma abertura curta de aventura e salva `introSeen` no perfil para não repetir sempre.

Quem já vinculou a jornada ao Google pode recuperar o personagem em outro aparelho pelo botão "Entrar com Google" no início.

O tutorial inicial funciona como um primeiro projeto: complete 3 dias de metas para receber XP extra uma única vez.

Os níveis usam XP progressivo: level 1 pede 100 XP, e cada novo level aumenta a exigência em +25 XP para dificultar a evolução aos poucos.

As moedas ficam salvas no perfil do jovem e preparam a loja visual futura: cada passo de tarefa diária dá 1 moeda, completar o dia dá +5 moedas, cada tarefa de projeto dá 2 moedas, o tutorial dá +10 moedas, projetos curtos dão +12 moedas e projetos longos dão +25 moedas ao finalizar.

A loja visual usa essas moedas para comprar itens cosméticos simples. Os itens ficam no inventário do perfil e o item equipado aparece no personagem em pixel.

O combate começa como sala de treino: a partir do level 5 o jovem pode criar uma sala com código/link, e outro jovem pode entrar pelo código. A resolução do vencedor ainda fica para a próxima fase, preferencialmente por uma API no servidor.

Projetos pessoais usam uma biblioteca de tarefas pré-definidas nas áreas espiritual, física, intelectual e social. Cada tarefa pronta vale 10 XP. O jovem também pode criar tarefas próprias: as 3 primeiras valem 10 XP e a 4ª vale 5 XP.
No MVP atual, projetos pessoais podem ser criados com 1 a 4 tarefas, XP por tarefa concluída uma vez por dia e bônus de XP ao concluir todos os dias do projeto. Para manter foco e evitar ganho exagerado de XP, cada jovem pode ter no máximo 2 projetos pessoais ativos ao mesmo tempo. Projetos tem mínimo de 3 dias; até 13 dias são curtos, 14 dias ou mais são longos.

A tela principal foi separada em abas: Início, Hoje, Projetos, Rank e Perfil. A aba Início junta resumo do dia, XP e moedas disponíveis, próximo título, combate e eventos futuros.

O ranking usa a collection pública `leaderboard` com apenas dados leves de jogo: nickname, tipo de conta, level, XP, sequência e dias completos. Contas anônimas também entram no ranking.

O Bloom fica reservado como um evento futuro de 7 semanas com grande recompensa de XP.

## Rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Crie um projeto no Firebase e ative:

- Authentication -> Anonymous
- Authentication -> Google
- Firestore Database
- Regras do Firestore: use `firestore.rules` como base para o MVP

3. Crie `.env.local` a partir de `.env.example` e preencha as chaves públicas do app web Firebase.

4. Rode o app:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Collections

- `users/{uid}`
- `users/{uid}/projects/{projectId}`
- `dailyProgress/{uid_teancum_YYYY-MM-DD}`
- `leaderboard/{uid}`
- `battles/{battleCode}`
