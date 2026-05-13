import type {
  DailyProgress,
  PersonalProject,
  ProjectArea,
  ProjectDuration,
  ShopItemId,
  TaskId,
  TaskProgress,
  UserGoals,
  UserProfile,
} from "@/types/teancum";

export type DailyTask = {
  id: TaskId;
  label: string;
  target: number;
  unit: string;
  xpPerStep: number;
};

export const DEFAULT_GOALS: UserGoals = {
  prayerTarget: 2,
  scriptureTarget: 3,
};

export const EMPTY_TASK_PROGRESS: TaskProgress = {
  prayer: 0,
  scripture: 0,
  reflect: 0,
  custom: 0,
};

export const DAILY_BONUS_XP = 20;
export const BASE_XP_PER_LEVEL = 100;
export const XP_PER_LEVEL_STEP = 25;
export const DAILY_PROGRESS_MODE = "teancum";
export const TUTORIAL_PROJECT_DAYS = 3;
export const TUTORIAL_PROJECT_XP = 50;
export const MAX_PROJECT_TASKS = 4;
export const MAX_ACTIVE_PROJECTS = 2;
export const MIN_PROJECT_DAYS = 3;
export const LONG_PROJECT_MIN_DAYS = 14;
export const MAX_PROJECT_DAYS = 60;
export const PRESET_PROJECT_TASK_XP = 10;
export const CUSTOM_PROJECT_TASK_XP = 10;
export const EXTRA_CUSTOM_PROJECT_TASK_XP = 5;
export const BATTLE_UNLOCK_LEVEL = 5;
export const DAILY_TASK_COINS = 1;
export const DAILY_COMPLETE_COINS = 5;
export const PROJECT_TASK_COINS = 2;
export const TUTORIAL_PROJECT_COINS = 10;
export const SHORT_PROJECT_COINS = 12;
export const LONG_PROJECT_COINS = 25;

export const CHARACTER_TITLE_MILESTONES = [
  {
    level: 1,
    title: "Viajante",
    emoji: "🧭",
    message: "Primeiros passos da jornada.",
  },
  {
    level: 3,
    title: "Aprendiz",
    emoji: "📖",
    message: "A constância começou a aparecer.",
  },
  {
    level: 5,
    title: "Discípulo em treinamento",
    emoji: "🏹",
    message: "Combate será desbloqueado em breve.",
  },
  {
    level: 8,
    title: "Guardião",
    emoji: "⚔️",
    message: "Um defensor mais firme a cada dia.",
  },
  {
    level: 10,
    title: "Teâncum",
    emoji: "🛡️",
    message: "Coragem, fé e disciplina em ação.",
  },
] as const;

export type Achievement = {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progressLabel: string;
};

export type ShopItem = {
  id: ShopItemId;
  name: string;
  description: string;
  price: number;
  minLevel: number;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "blue-cape",
    name: "Capa Azul",
    description: "Um visual de aventureiro para começar a jornada.",
    price: 25,
    minLevel: 1,
  },
  {
    id: "gold-headband",
    name: "Faixa Dourada",
    description: "Marca de foco para quem está criando constância.",
    price: 35,
    minLevel: 1,
  },
  {
    id: "light-medal",
    name: "Medalha de Luz",
    description: "Um pequeno símbolo das missões concluídas.",
    price: 45,
    minLevel: 2,
  },
  {
    id: "sky-aura",
    name: "Aura Celeste",
    description: "Brilho suave para destacar progresso espiritual.",
    price: 60,
    minLevel: 3,
  },
  {
    id: "training-shield",
    name: "Escudo de Treino",
    description: "Preparação visual para o combate futuro.",
    price: 90,
    minLevel: 5,
  },
];

export const PROJECT_AREA_LABELS: Record<ProjectArea, string> = {
  spiritual: "Espiritual",
  physical: "Física",
  intellectual: "Intelectual",
  social: "Social",
};

export const PROJECT_DURATION_LABELS: Record<ProjectDuration, string> = {
  short: "Curto",
  long: "Longo",
};

export const PROJECT_TASK_LIBRARY: Record<ProjectArea, string[]> = {
  spiritual: [
    "Orar por alguém por 3 dias",
    "Ler um capítulo",
    "Memorizar uma escritura",
    "Preparar uma mensagem curta",
    "Escrever no diário espiritual",
    "Ouvir um discurso",
    "Compartilhar uma escritura",
    "Fazer uma pergunta para estudar",
  ],
  physical: [
    "Caminhar por 20 minutos",
    "Beber agua durante o dia",
    "Dormir mais cedo",
    "Alongar por 10 minutos",
    "Fazer exercicio leve",
    "Organizar o quarto",
    "Preparar um lanche saudável",
    "Evitar tela antes de dormir",
  ],
  intellectual: [
    "Estudar por 20 minutos",
    "Ler 5 páginas de um livro",
    "Fazer um resumo",
    "Aprender uma palavra nova",
    "Assistir uma aula curta",
    "Praticar um idioma",
    "Resolver exercícios",
    "Pesquisar um tema importante",
  ],
  social: [
    "Mandar mensagem para alguém",
    "Servir alguém em casa",
    "Conversar com um familiar",
    "Agradecer uma pessoa",
    "Convidar alguém para uma atividade",
    "Fazer um elogio sincero",
    "Ajudar em uma tarefa",
    "Conhecer alguém novo",
  ],
};

export function getDailyProgressId(uid: string, dateKey = getTodayKey()) {
  return `${uid}_${DAILY_PROGRESS_MODE}_${dateKey}`;
}

export function getProjectReward(duration: ProjectDuration) {
  return duration === "long" ? 90 : 40;
}

export function getProjectCoinReward(duration: ProjectDuration) {
  return duration === "long" ? LONG_PROJECT_COINS : SHORT_PROJECT_COINS;
}

export function formatCoins(amount: number) {
  return amount === 1 ? "1 moeda" : `${amount} moedas`;
}

export function getProjectTaskXp(source: "preset" | "custom" | undefined, customTaskIndex = 0) {
  if (source === "custom") {
    return customTaskIndex >= 3 ? EXTRA_CUSTOM_PROJECT_TASK_XP : CUSTOM_PROJECT_TASK_XP;
  }

  return PRESET_PROJECT_TASK_XP;
}

export function clampProjectDays(days: number) {
  if (Number.isNaN(days)) return MIN_PROJECT_DAYS;
  return Math.min(MAX_PROJECT_DAYS, Math.max(MIN_PROJECT_DAYS, Math.round(days)));
}

export function getProjectDurationFromDays(days: number): ProjectDuration {
  return clampProjectDays(days) >= LONG_PROJECT_MIN_DAYS ? "long" : "short";
}

export function getProjectRewardFromDays(days: number) {
  return getProjectReward(getProjectDurationFromDays(days));
}

export function getGoals(profile: UserProfile): UserGoals {
  return {
    ...DEFAULT_GOALS,
    ...profile.goals,
  };
}

export function getDailyTasks(profile: UserProfile): DailyTask[] {
  const goals = getGoals(profile);
  const tasks: DailyTask[] = [
    {
      id: "prayer",
      label: "Oração",
      target: goals.prayerTarget,
      unit: goals.prayerTarget === 1 ? "vez" : "vezes",
      xpPerStep: 8,
    },
    {
      id: "scripture",
      label: "Ler escrituras",
      target: goals.scriptureTarget,
      unit: goals.scriptureTarget === 1 ? "página" : "páginas",
      xpPerStep: 5,
    },
    {
      id: "reflect",
      label: "Registrar reflexao",
      target: 1,
      unit: "vez",
      xpPerStep: 10,
    },
  ];

  if (goals.customTaskLabel?.trim()) {
    tasks.push({
      id: "custom",
      label: goals.customTaskLabel.trim(),
      target: 1,
      unit: "vez",
      xpPerStep: 5,
    });
  }

  return tasks;
}

export function normalizeTaskProgress(
  progress: Partial<DailyProgress> | undefined,
  profile: UserProfile,
): TaskProgress {
  const normalized = { ...EMPTY_TASK_PROGRESS };
  const tasks = getDailyTasks(profile);
  const storedProgress = progress?.taskProgress;
  const legacyTasks = progress?.tasks;

  for (const task of tasks) {
    const storedValue = storedProgress?.[task.id];
    const legacyValue = legacyTasks?.[task.id];

    if (typeof storedValue === "number") {
      normalized[task.id] = Math.min(task.target, Math.max(0, storedValue));
    } else if (typeof legacyValue === "number") {
      normalized[task.id] = Math.min(task.target, Math.max(0, legacyValue));
    } else if (legacyValue === true) {
      normalized[task.id] = task.target;
    }
  }

  return normalized;
}

export function areAllTasksComplete(taskProgress: TaskProgress, profile: UserProfile) {
  return getDailyTasks(profile).every((task) => taskProgress[task.id] >= task.target);
}

export function getXpRequiredForLevel(level: number) {
  return BASE_XP_PER_LEVEL + Math.max(0, level - 1) * XP_PER_LEVEL_STEP;
}

export function getTotalXpForLevel(level: number) {
  if (level <= 1) return 0;

  let totalXp = 0;

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    totalXp += getXpRequiredForLevel(currentLevel);
  }

  return totalXp;
}

export function getLevelFromXp(xp: number) {
  let level = 1;
  let remainingXp = Math.max(0, xp);

  while (remainingXp >= getXpRequiredForLevel(level)) {
    remainingXp -= getXpRequiredForLevel(level);
    level += 1;
  }

  return level;
}

export function getXpInCurrentLevel(xp: number) {
  return Math.max(0, xp - getTotalXpForLevel(getLevelFromXp(xp)));
}

export function getXpForCurrentLevel(xp: number) {
  return getXpRequiredForLevel(getLevelFromXp(xp));
}

export function getXpToNextLevel(xp: number) {
  return getXpForCurrentLevel(xp) - getXpInCurrentLevel(xp);
}

export function getLevelProgress(xp: number) {
  return Math.min(100, Math.round((getXpInCurrentLevel(xp) / getXpForCurrentLevel(xp)) * 100));
}

export function getPlantEmoji(level: number) {
  if (level >= 10) return "🌸";
  if (level >= 8) return "🌳";
  if (level >= 5) return "🌿";
  if (level >= 3) return "🪴";
  return "🌱";
}

export function getCharacterEmoji(level: number) {
  return getCharacterMilestone(level).emoji;
}

export function getCharacterTitle(level: number) {
  return getCharacterMilestone(level).title;
}

export function getCharacterMilestone(level: number) {
  return (
    [...CHARACTER_TITLE_MILESTONES]
      .reverse()
      .find((milestone) => level >= milestone.level) ?? CHARACTER_TITLE_MILESTONES[0]
  );
}

export function getNextCharacterMilestone(level: number) {
  return CHARACTER_TITLE_MILESTONES.find((milestone) => milestone.level > level) ?? null;
}

export function getCharacterMotivation(level: number) {
  return getCharacterMilestone(level).message;
}

export function isBattleUnlocked(level: number) {
  return level >= BATTLE_UNLOCK_LEVEL;
}

export function getAchievements(profile: UserProfile, projects: PersonalProject[]): Achievement[] {
  const currentLevel = getLevelFromXp(profile.xp);
  const completedProjects = projects.filter((project) => project.completed);
  const hasSocialProgress = projects.some(
    (project) =>
      project.area === "social" &&
      project.tasks.some((task) => (task.completedCount ?? 0) > 0 || task.completed),
  );

  return [
    {
      id: "first-day",
      name: "Primeira Jornada",
      icon: "✨",
      description: "Complete seu primeiro dia de metas.",
      unlocked: profile.completedDays >= 1,
      progressLabel: `${Math.min(profile.completedDays, 1)}/1 dia`,
    },
    {
      id: "streak-3",
      name: "Constante",
      icon: "🔥",
      description: "Alcance 3 dias de sequência.",
      unlocked: profile.streak >= 3,
      progressLabel: `${Math.min(profile.streak, 3)}/3 dias`,
    },
    {
      id: "scripture-7",
      name: "Leitor Fiel",
      icon: "📘",
      description: "Complete 7 dias com leitura das escrituras.",
      unlocked: profile.completedDays >= 7,
      progressLabel: `${Math.min(profile.completedDays, 7)}/7 dias`,
    },
    {
      id: "tutorial",
      name: "Ciclo Aprendido",
      icon: "🧭",
      description: "Conclua o projeto tutorial.",
      unlocked: Boolean(profile.tutorialProject?.rewardClaimed),
      progressLabel: profile.tutorialProject?.rewardClaimed ? "Feito" : "Pendente",
    },
    {
      id: "first-project",
      name: "Projeto Concluído",
      icon: "🏅",
      description: "Finalize seu primeiro projeto pessoal.",
      unlocked: completedProjects.length >= 1,
      progressLabel: `${Math.min(completedProjects.length, 1)}/1 projeto`,
    },
    {
      id: "social-action",
      name: "Servir Alguém",
      icon: "🤝",
      description: "Conclua uma tarefa em projeto social.",
      unlocked: hasSocialProgress,
      progressLabel: hasSocialProgress ? "Feito" : "Pendente",
    },
    {
      id: "level-5",
      name: "Discípulo em Treinamento",
      icon: "🏹",
      description: "Chegue ao level 5.",
      unlocked: currentLevel >= BATTLE_UNLOCK_LEVEL,
      progressLabel: `Level ${Math.min(currentLevel, BATTLE_UNLOCK_LEVEL)}/${BATTLE_UNLOCK_LEVEL}`,
    },
  ];
}

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayKey(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayKey(yesterday);
}

export function daysBetween(fromDateKey: string, toDateKey: string) {
  const from = new Date(`${fromDateKey}T00:00:00`);
  const to = new Date(`${toDateKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function shouldResetStreak(profile: UserProfile, todayKey = getTodayKey()) {
  if (!profile.lastCompletedDate || profile.streak === 0) return false;
  return daysBetween(profile.lastCompletedDate, todayKey) > 1;
}

export function getNextStreak(profile: UserProfile, todayKey = getTodayKey()) {
  if (profile.lastCompletedDate === todayKey) return profile.streak;
  if (profile.lastCompletedDate === getYesterdayKey(new Date(`${todayKey}T00:00:00`))) {
    return profile.streak + 1;
  }
  return 1;
}
