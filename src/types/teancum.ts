export type TaskId = "prayer" | "scripture" | "reflect" | "custom";

export type TaskProgress = Record<TaskId, number>;

export type UserGoals = {
  prayerTarget: number;
  scriptureTarget: number;
  customTaskLabel?: string;
  disabledTaskIds?: TaskId[];
  taskLabels?: Partial<Record<TaskId, string>>;
};

export type AvatarGender = "male" | "female";
export type AvatarSkinTone = "light" | "medium" | "dark";
export type AvatarHairColor = "black" | "brown" | "blonde";
export type AvatarOutfitColor = "blue" | "green" | "yellow";

export type AvatarConfig = {
  gender: AvatarGender;
  skinTone: AvatarSkinTone;
  hairColor: AvatarHairColor;
  outfitColor: AvatarOutfitColor;
};

export type ShopItemId =
  | "blue-cape"
  | "gold-headband"
  | "light-medal"
  | "sky-aura"
  | "training-shield";

export type UserInventory = {
  ownedItemIds: ShopItemId[];
  equippedItemId?: ShopItemId | null;
};

export type TutorialProject = {
  area?: ProjectArea;
  tasks?: {
    label: string;
    source: ProjectTaskSource;
  }[];
  targetDays?: number;
  completed: boolean;
  completedDate: string | null;
  rewardClaimed: boolean;
};

export type UserProfile = {
  uid: string;
  userName: string;
  accountProvider?: "anonymous" | "google";
  email?: string | null;
  nickname?: string;
  characterName?: string;
  avatar?: AvatarConfig;
  plantName?: string;
  introSeen?: boolean;
  goals?: UserGoals;
  inventory?: UserInventory;
  tutorialProject?: TutorialProject;
  xp: number;
  coins: number;
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

export type LeaderboardEntry = {
  uid: string;
  nickname: string;
  accountProvider?: "anonymous" | "google";
  level: number;
  xp: number;
  streak: number;
  completedDays: number;
  rank?: number;
};

export type BattleStatus = "waiting" | "ready" | "finished";

export type BattleRoom = {
  id: string;
  hostUid: string;
  hostName: string;
  guestUid: string | null;
  guestName: string | null;
  status: BattleStatus;
  winnerUid?: string | null;
  createdDateKey: string;
};

export type OnboardingData = {
  nickname: string;
  prayerTarget: number;
  scriptureTarget: number;
  customTaskLabel?: string;
  avatar: AvatarConfig;
  tutorialArea: ProjectArea;
  tutorialTasks: {
    label: string;
    source: ProjectTaskSource;
  }[];
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
  archived?: boolean;
  archivedAt?: string | null;
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
