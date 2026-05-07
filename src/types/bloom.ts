export type TaskId = "water" | "sun" | "observe";

export type TaskMap = Record<TaskId, boolean>;

export type UserProfile = {
  uid: string;
  userName: string;
  plantName: string;
  xp: number;
  level: number;
  streak: number;
  completedDays: number;
  lastCompletedDate: string | null;
};

export type DailyProgress = {
  uid: string;
  dateKey: string;
  tasks: TaskMap;
  completedAll: boolean;
  xpEarned: number;
};

export type OnboardingData = {
  userName: string;
  plantName: string;
};
