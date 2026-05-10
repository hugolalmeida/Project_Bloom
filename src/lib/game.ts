import type {
  DailyProgress,
  ProjectArea,
  ProjectDuration,
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
export const XP_PER_LEVEL = 100;
export const DAILY_PROGRESS_MODE = "teancum";
export const TUTORIAL_PROJECT_DAYS = 3;
export const TUTORIAL_PROJECT_XP = 50;
export const MAX_PROJECT_TASKS = 3;
export const MAX_ACTIVE_PROJECTS = 2;
export const MIN_PROJECT_DAYS = 3;
export const LONG_PROJECT_MIN_DAYS = 14;
export const MAX_PROJECT_DAYS = 60;
export const PRESET_PROJECT_TASK_XP = 10;
export const CUSTOM_PROJECT_TASK_XP = 5;

export const PROJECT_AREA_LABELS: Record<ProjectArea, string> = {
  spiritual: "Espiritual",
  physical: "Fisica",
  intellectual: "Intelectual",
  social: "Social",
};

export const PROJECT_DURATION_LABELS: Record<ProjectDuration, string> = {
  short: "Curto",
  long: "Longo",
};

export const PROJECT_TASK_LIBRARY: Record<ProjectArea, string[]> = {
  spiritual: [
    "Orar por alguem por 3 dias",
    "Ler um capitulo",
    "Memorizar uma escritura",
    "Preparar uma mensagem curta",
    "Escrever no diario espiritual",
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
    "Preparar um lanche saudavel",
    "Evitar tela antes de dormir",
  ],
  intellectual: [
    "Estudar por 20 minutos",
    "Ler 5 paginas de um livro",
    "Fazer um resumo",
    "Aprender uma palavra nova",
    "Assistir uma aula curta",
    "Praticar um idioma",
    "Resolver exercicios",
    "Pesquisar um tema importante",
  ],
  social: [
    "Mandar mensagem para alguem",
    "Servir alguem em casa",
    "Conversar com um familiar",
    "Agradecer uma pessoa",
    "Convidar alguem para uma atividade",
    "Fazer um elogio sincero",
    "Ajudar em uma tarefa",
    "Conhecer alguem novo",
  ],
};

export function getDailyProgressId(uid: string, dateKey = getTodayKey()) {
  return `${uid}_${DAILY_PROGRESS_MODE}_${dateKey}`;
}

export function getProjectReward(duration: ProjectDuration) {
  return duration === "long" ? 90 : 40;
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
      label: "Oracao",
      target: goals.prayerTarget,
      unit: goals.prayerTarget === 1 ? "vez" : "vezes",
      xpPerStep: 8,
    },
    {
      id: "scripture",
      label: "Ler escrituras",
      target: goals.scriptureTarget,
      unit: goals.scriptureTarget === 1 ? "pagina" : "paginas",
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

export function getLevelFromXp(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpInCurrentLevel(xp: number) {
  return xp % XP_PER_LEVEL;
}

export function getLevelProgress(xp: number) {
  return Math.min(100, Math.round((getXpInCurrentLevel(xp) / XP_PER_LEVEL) * 100));
}

export function getPlantEmoji(level: number) {
  if (level >= 10) return "🌸";
  if (level >= 8) return "🌳";
  if (level >= 5) return "🌿";
  if (level >= 3) return "🪴";
  return "🌱";
}

export function getCharacterEmoji(level: number) {
  if (level >= 10) return "🛡️";
  if (level >= 8) return "⚔️";
  if (level >= 5) return "🏹";
  if (level >= 3) return "📖";
  return "🧭";
}

export function getCharacterTitle(level: number) {
  if (level >= 10) return "Guardiao firme";
  if (level >= 8) return "Defensor";
  if (level >= 5) return "Aprendiz valente";
  if (level >= 3) return "Estudante fiel";
  return "Viajante";
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
