import type { TaskId, TaskMap, UserProfile } from "@/types/bloom";

export const DAILY_TASKS: Array<{ id: TaskId; label: string; helper: string }> = [
  { id: "water", label: "Regar planta", helper: "+10 XP" },
  { id: "sun", label: "Colocar no sol", helper: "+10 XP" },
  { id: "observe", label: "Observar crescimento", helper: "+10 XP" },
];

export const EMPTY_TASKS: TaskMap = {
  water: false,
  sun: false,
  observe: false,
};

export const TASK_XP = 10;
export const DAILY_BONUS_XP = 20;
export const XP_PER_LEVEL = 100;
export const JOURNEY_DAYS = 49;

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

export function getCurrentWeek(completedDays: number) {
  return Math.min(7, Math.floor(Math.max(0, completedDays) / 7) + 1);
}

export function areAllTasksComplete(tasks: TaskMap) {
  return Object.values(tasks).every(Boolean);
}
