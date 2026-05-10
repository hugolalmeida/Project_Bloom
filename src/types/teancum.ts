export type TaskId = "prayer" | "scripture" | "reflect" | "custom";

export type TaskProgress = Record<TaskId, number>;

export type UserGoals = {
  prayerTarget: number;
  scriptureTarget: number;
  customTaskLabel?: string;
};

export type TutorialProject = {
  completed: boolean;
  completedDate: string | null;
  rewardClaimed: boolean;
};

export type UserProfile = {
  uid: string;
  userName: string;
  nickname?: string;
  characterName?: string;
  plantName?: string;
  introSeen?: boolean;
  goals?: UserGoals;
  tutorialProject?: TutorialProject;
  xp: number;
  level: number;
  streak: number;
  completedDays: number;
  lastCompletedDate: string | null;
};

export type DailyProgress = {
  uid: string;
  dateKey: string;
  taskProgress: TaskProgress;
  tasks?: Partial<Record<TaskId, boolean | number>>;
  completedAll: boolean;
  xpEarned: number;
};

export type OnboardingData = {
  nickname: string;
  prayerTarget: number;
  scriptureTarget: number;
  customTaskLabel?: string;
};

export type ProjectArea = "spiritual" | "physical" | "intellectual" | "social";

export type ProjectDuration = "short" | "long";

export type ProjectTaskSource = "preset" | "custom";

export type ProjectTask = {
  id: string;
  label: string;
  source?: ProjectTaskSource;
  xpReward?: number;
  completedCount?: number;
  lastCompletedDate?: string | null;
  completed: boolean;
};

export type PersonalProject = {
  id: string;
  uid: string;
  title: string;
  area: ProjectArea;
  duration: ProjectDuration;
  targetDays?: number;
  completedDays?: number;
  lastCompletedDayDate?: string | null;
  tasks: ProjectTask[];
  xpReward: number;
  completed: boolean;
  completedAt: string | null;
};

export type CreateProjectData = {
  title: string;
  area: ProjectArea;
  targetDays: number;
  tasks: {
    label: string;
    source: ProjectTaskSource;
  }[];
};
