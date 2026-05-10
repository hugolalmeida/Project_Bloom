"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase";
import {
  DAILY_BONUS_XP,
  CUSTOM_PROJECT_TASK_XP,
  areAllTasksComplete,
  getDailyProgressId,
  getDailyTasks,
  getLevelFromXp,
  getNextStreak,
  getProjectDurationFromDays,
  getProjectReward,
  MAX_ACTIVE_PROJECTS,
  MAX_PROJECT_TASKS,
  PRESET_PROJECT_TASK_XP,
  getTodayKey,
  normalizeTaskProgress,
  shouldResetStreak,
  EMPTY_TASK_PROGRESS,
  TUTORIAL_PROJECT_DAYS,
  TUTORIAL_PROJECT_XP,
} from "@/lib/game";
import type {
  CreateProjectData,
  DailyProgress,
  OnboardingData,
  PersonalProject,
  TaskId,
  UserProfile,
} from "@/types/teancum";

function createEmptyProgress(uid: string, dateKey = getTodayKey()): DailyProgress {
  return {
    uid,
    dateKey,
    taskProgress: { ...EMPTY_TASK_PROGRESS },
    completedAll: false,
    xpEarned: 0,
  };
}

export function useTeancum() {
  const configured = useMemo(() => hasFirebaseConfig(), []);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [loading, setLoading] = useState(configured);
  const [saving, setSaving] = useState(false);
  const [introSaving, setIntroSaving] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<TaskId | null>(null);
  const [pendingProjectTaskId, setPendingProjectTaskId] = useState<string | null>(null);
  const [taskFeedbackId, setTaskFeedbackId] = useState<TaskId | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    configured ? null : "Configure o Firebase em .env.local para jogar o Projeto Teâncum.",
  );
  const [levelCelebration, setLevelCelebration] = useState(false);
  const taskFeedbackTimerRef = useRef<number | null>(null);
  const levelTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (taskFeedbackTimerRef.current) {
        window.clearTimeout(taskFeedbackTimerRef.current);
      }

      if (levelTimerRef.current) {
        window.clearTimeout(levelTimerRef.current);
      }
    };
  }, []);

  const loadProjects = useCallback(async (uid: string) => {
    const db = getFirebaseDb();
    const projectsSnap = await getDocs(collection(db, "users", uid, "projects"));
    const loadedProjects = projectsSnap.docs.map((projectDoc) => ({
      id: projectDoc.id,
      ...(projectDoc.data() as Omit<PersonalProject, "id">),
    }));

    setProjects(
      loadedProjects.sort((a, b) => Number(a.completed) - Number(b.completed)),
    );
  }, []);

  const loadUserData = useCallback(async (user: User) => {
    const dateKey = getTodayKey();
    const db = getFirebaseDb();
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      setProfile(null);
      setProgress(createEmptyProgress(user.uid, dateKey));
      setProjects([]);
      return;
    }

    let loadedProfile = userSnap.data() as UserProfile;

    if (shouldResetStreak(loadedProfile, dateKey)) {
      loadedProfile = { ...loadedProfile, streak: 0 };
      await updateDoc(userRef, {
        streak: 0,
        updatedAt: serverTimestamp(),
      });
    }

    const progressRef = doc(db, "dailyProgress", getDailyProgressId(user.uid, dateKey));
    const progressSnap = await getDoc(progressRef);

    setProfile(loadedProfile);
    setProgress(
      progressSnap.exists()
        ? {
            ...(progressSnap.data() as DailyProgress),
            taskProgress: normalizeTaskProgress(progressSnap.data() as DailyProgress, loadedProfile),
          }
        : createEmptyProgress(user.uid, dateKey),
    );
    await loadProjects(user.uid);
  }, [loadProjects]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = user ?? (await signInAnonymously(auth)).user;
        setAuthUser(currentUser);
        await loadUserData(currentUser);
      } catch {
        setError("Nao consegui conectar ao Firebase agora.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [configured, loadUserData]);

  const startJourney = useCallback(
    async ({ nickname, prayerTarget, scriptureTarget, customTaskLabel }: OnboardingData) => {
      if (!configured) return;

      setSaving(true);
      setActionMessage(null);
      setError(null);

      try {
        const auth = getFirebaseAuth();
        const db = getFirebaseDb();
        const user = authUser ?? auth.currentUser ?? (await signInAnonymously(auth)).user;

        const newProfile: UserProfile = {
          uid: user.uid,
          userName: nickname.trim(),
          nickname: nickname.trim(),
          characterName: nickname.trim(),
          introSeen: false,
          goals: {
            prayerTarget,
            scriptureTarget,
            ...(customTaskLabel?.trim() ? { customTaskLabel: customTaskLabel.trim() } : {}),
          },
          tutorialProject: {
            completed: false,
            completedDate: null,
            rewardClaimed: false,
          },
          xp: 0,
          level: 1,
          streak: 0,
          completedDays: 0,
          lastCompletedDate: null,
        };

        await setDoc(doc(db, "users", user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setAuthUser(user);
        setProfile(newProfile);
        setProgress(createEmptyProgress(user.uid));
        setProjects([]);
      } catch {
        setError("Nao foi possivel comecar a jornada. Tente novamente.");
      } finally {
        setSaving(false);
      }
    },
    [authUser, configured],
  );

  const finishIntro = useCallback(async () => {
    if (!profile) return;

    setIntroSaving(true);
    setError(null);

    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "users", profile.uid), {
        introSeen: true,
        updatedAt: serverTimestamp(),
      });

      setProfile((currentProfile) =>
        currentProfile ? { ...currentProfile, introSeen: true } : currentProfile,
      );
      setActionMessage("Aventura iniciada. Sua primeira missao ja esta liberada.");
    } catch {
      setError("Nao consegui salvar o inicio da aventura. Tente novamente.");
    } finally {
      setIntroSaving(false);
    }
  }, [profile]);

  const createProject = useCallback(
    async ({ title, area, targetDays, tasks }: CreateProjectData) => {
      const normalizedTasks = tasks
        .map((task) => ({
          label: task.label.trim(),
          source: task.source,
        }))
        .filter((task) => task.label.length > 0);

      if (!profile || normalizedTasks.length === 0) return;

      const activeProjectCount = projects.filter((project) => !project.completed).length;

      if (activeProjectCount >= MAX_ACTIVE_PROJECTS) {
        setActionMessage(
          `Conclua um projeto antes de criar outro. Limite atual: ${MAX_ACTIVE_PROJECTS}.`,
        );
        return;
      }

      setProjectSaving(true);
      setActionMessage(null);
      setError(null);

      try {
        const db = getFirebaseDb();
        const trimmedTitle = title.trim() || "Novo projeto";
        const duration = getProjectDurationFromDays(targetDays);
        const projectTasks = normalizedTasks
          .slice(0, MAX_PROJECT_TASKS)
          .map((task, index) => ({
            id: `${Date.now()}-${index}`,
            label: task.label,
            source: task.source,
            xpReward:
              task.source === "custom" ? CUSTOM_PROJECT_TASK_XP : PRESET_PROJECT_TASK_XP,
            completedCount: 0,
            lastCompletedDate: null,
            completed: false,
          }));
        const projectData: Omit<PersonalProject, "id"> = {
          uid: profile.uid,
          title: trimmedTitle,
          area,
          duration,
          targetDays,
          completedDays: 0,
          lastCompletedDayDate: null,
          tasks: projectTasks,
          xpReward: getProjectReward(duration),
          completed: false,
          completedAt: null,
        };

        const projectRef = await addDoc(collection(db, "users", profile.uid, "projects"), {
          ...projectData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setProjects((currentProjects) => [
          { id: projectRef.id, ...projectData },
          ...currentProjects,
        ]);
        setActionMessage("Projeto criado. Agora e so concluir as tarefas.");
      } catch {
        setError("Nao consegui criar o projeto. Tente novamente.");
      } finally {
        setProjectSaving(false);
      }
    },
    [profile, projects],
  );

  const completeProjectTask = useCallback(
    async (projectId: string, taskId: string) => {
      if (!profile) return;

      const dateKey = getTodayKey();
      setProjectSaving(true);
      setPendingProjectTaskId(`${projectId}:${taskId}`);
      setActionMessage(null);
      setError(null);

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, "users", profile.uid);
        const projectRef = doc(db, "users", profile.uid, "projects", projectId);

        const result = await runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userRef);
          const projectSnap = await transaction.get(projectRef);

          if (!userSnap.exists() || !projectSnap.exists()) {
            throw new Error("missing-project");
          }

          const freshProfile = userSnap.data() as UserProfile;
          const freshProject = {
            id: projectSnap.id,
            ...(projectSnap.data() as Omit<PersonalProject, "id">),
          };

          const targetDays = Math.max(1, freshProject.targetDays ?? 1);
          const currentCompletedDays = freshProject.completedDays ?? 0;

          if (freshProject.completed || currentCompletedDays >= targetDays) {
            return {
              didCompleteTask: false,
              didCompleteProjectDay: false,
              didCompleteProject: false,
              didLevelUp: false,
              earnedXp: 0,
              nextProfile: freshProfile,
              nextProject: freshProject,
            };
          }

          const targetTask = freshProject.tasks.find((task) => task.id === taskId);

          const taskAlreadyDoneToday = targetTask?.lastCompletedDate === dateKey;

          if (!targetTask || targetTask.completed || taskAlreadyDoneToday) {
            return {
              didCompleteTask: false,
              didCompleteProjectDay: false,
              didCompleteProject: false,
              didLevelUp: false,
              earnedXp: 0,
              nextProfile: freshProfile,
              nextProject: freshProject,
            };
          }

          const nextTasks = freshProject.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completedCount: (task.completedCount ?? 0) + 1,
                  lastCompletedDate: dateKey,
                }
              : task,
          );
          const completedProjectDay =
            nextTasks.every((task) => task.completed || task.lastCompletedDate === dateKey) &&
            freshProject.lastCompletedDayDate !== dateKey;
          const nextCompletedDays = completedProjectDay
            ? currentCompletedDays + 1
            : currentCompletedDays;
          const didCompleteProject = nextCompletedDays >= targetDays;
          const taskXp =
            targetTask.xpReward ??
            (targetTask.source === "custom" ? CUSTOM_PROJECT_TASK_XP : PRESET_PROJECT_TASK_XP);
          const earnedXp = taskXp + (didCompleteProject ? freshProject.xpReward : 0);
          const nextXp = freshProfile.xp + earnedXp;
          const nextLevel = getLevelFromXp(nextXp);
          const nextProfile = {
            ...freshProfile,
            xp: nextXp,
            level: nextLevel,
          };
          const completedDate = didCompleteProject ? getTodayKey() : null;
          const nextProject: PersonalProject = {
            ...freshProject,
            tasks: didCompleteProject
              ? nextTasks.map((task) => ({ ...task, completed: true }))
              : nextTasks,
            completedDays: nextCompletedDays,
            lastCompletedDayDate: completedProjectDay ? dateKey : freshProject.lastCompletedDayDate,
            completed: didCompleteProject,
            completedAt: completedDate,
          };

          transaction.update(projectRef, {
            tasks: nextProject.tasks,
            completedDays: nextProject.completedDays,
            lastCompletedDayDate: nextProject.lastCompletedDayDate,
            completed: nextProject.completed,
            completedAt: nextProject.completedAt,
            updatedAt: serverTimestamp(),
          });

          transaction.update(userRef, {
            xp: nextProfile.xp,
            level: nextProfile.level,
            updatedAt: serverTimestamp(),
          });

          return {
            didCompleteTask: true,
            didCompleteProjectDay: completedProjectDay,
            didCompleteProject,
            didLevelUp: nextLevel > freshProfile.level,
            earnedXp,
            nextProfile,
            nextProject,
          };
        });

        setProfile(result.nextProfile);
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === projectId ? result.nextProject : project,
          ),
        );

        if (!result.didCompleteTask) {
          setActionMessage("Essa tarefa de projeto ja foi concluida.");
          return;
        }

        setActionMessage(
          result.didCompleteProject
            ? `Projeto concluido! +${result.earnedXp} XP no total.`
            : result.didCompleteProjectDay
            ? `Dia do projeto completo! +${result.earnedXp} XP.`
            : `Tarefa do projeto concluida! +${result.earnedXp} XP.`,
        );

        if (result.didLevelUp) {
          setLevelCelebration(true);
          if (levelTimerRef.current) {
            window.clearTimeout(levelTimerRef.current);
          }
          levelTimerRef.current = window.setTimeout(() => setLevelCelebration(false), 1700);
        }
      } catch {
        setError("Nao consegui salvar o projeto. Tente novamente.");
      } finally {
        setPendingProjectTaskId(null);
        setProjectSaving(false);
      }
    },
    [profile],
  );

  const completeTask = useCallback(
    async (taskId: TaskId) => {
      if (!profile || !progress) return;

      const dateKey = getTodayKey();
      const activeProgress =
        progress.dateKey === dateKey ? progress : createEmptyProgress(profile.uid, dateKey);
      const activeTaskProgress = normalizeTaskProgress(activeProgress, profile);
      const activeTask = getDailyTasks(profile).find((task) => task.id === taskId);

      if (!activeTask || activeTaskProgress[taskId] >= activeTask.target) {
        setActionMessage("Essa tarefa ja rendeu XP hoje.");
        return;
      }

      setSaving(true);
      setPendingTaskId(taskId);
      setActionMessage(null);
      setError(null);

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, "users", profile.uid);
        const progressRef = doc(db, "dailyProgress", getDailyProgressId(profile.uid, dateKey));

        const result = await runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userRef);
          const progressSnap = await transaction.get(progressRef);

          if (!userSnap.exists()) {
            throw new Error("missing-profile");
          }

          const freshProfile = userSnap.data() as UserProfile;
          const streakAdjustedProfile = shouldResetStreak(freshProfile, dateKey)
            ? { ...freshProfile, streak: 0 }
            : freshProfile;
          const profileForToday: UserProfile = {
            ...streakAdjustedProfile,
            tutorialProject: streakAdjustedProfile.tutorialProject ?? {
              completed: false,
              completedDate: null,
              rewardClaimed: false,
            },
          };

          const freshProgress = progressSnap.exists()
            ? {
                ...(progressSnap.data() as DailyProgress),
                taskProgress: normalizeTaskProgress(
                  progressSnap.data() as DailyProgress,
                  profileForToday,
                ),
              }
            : createEmptyProgress(profile.uid, dateKey);

          const task = getDailyTasks(profileForToday).find((dailyTask) => dailyTask.id === taskId);

          if (!task || freshProgress.taskProgress[taskId] >= task.target) {
            return {
              didCompleteTask: false,
              didCompleteDay: false,
              didCompleteTutorialProject: false,
              didLevelUp: false,
              earnedXp: 0,
              nextProfile: profileForToday,
              nextProgress: freshProgress,
            };
          }

          const nextTaskProgress = {
            ...freshProgress.taskProgress,
            [taskId]: Math.min(task.target, freshProgress.taskProgress[taskId] + 1),
          };
          const completedAllNow = areAllTasksComplete(nextTaskProgress, profileForToday);
          const completedAllFirstTime = completedAllNow && !freshProgress.completedAll;
          const nextCompletedDays = completedAllFirstTime
            ? profileForToday.completedDays + 1
            : profileForToday.completedDays;
          const tutorialRewardClaimed = Boolean(profileForToday.tutorialProject?.rewardClaimed);
          const didCompleteTutorialProject =
            completedAllFirstTime &&
            !tutorialRewardClaimed &&
            nextCompletedDays >= TUTORIAL_PROJECT_DAYS;
          const earnedXp =
            task.xpPerStep +
            (completedAllFirstTime ? DAILY_BONUS_XP : 0) +
            (didCompleteTutorialProject ? TUTORIAL_PROJECT_XP : 0);
          const nextXp = profileForToday.xp + earnedXp;
          const nextLevel = getLevelFromXp(nextXp);

          const nextProfile: UserProfile = {
            ...profileForToday,
            xp: nextXp,
            level: nextLevel,
            streak: completedAllFirstTime
              ? getNextStreak(profileForToday, dateKey)
              : profileForToday.streak,
            completedDays: nextCompletedDays,
            lastCompletedDate: completedAllFirstTime ? dateKey : profileForToday.lastCompletedDate,
            tutorialProject: didCompleteTutorialProject
              ? {
                  completed: true,
                  completedDate: dateKey,
                  rewardClaimed: true,
                }
              : profileForToday.tutorialProject,
          };

          const nextProgress: DailyProgress = {
            ...freshProgress,
            dateKey,
            taskProgress: nextTaskProgress,
            completedAll: completedAllNow,
            xpEarned: freshProgress.xpEarned + earnedXp,
          };

          transaction.set(
            progressRef,
            {
              ...nextProgress,
              ...(progressSnap.exists() ? {} : { createdAt: serverTimestamp() }),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );

          transaction.update(userRef, {
            xp: nextProfile.xp,
            level: nextProfile.level,
            streak: nextProfile.streak,
            completedDays: nextProfile.completedDays,
            lastCompletedDate: nextProfile.lastCompletedDate,
            tutorialProject: nextProfile.tutorialProject,
            updatedAt: serverTimestamp(),
          });

          return {
            didCompleteTask: true,
            didCompleteDay: completedAllFirstTime,
            didCompleteTutorialProject,
            didLevelUp: nextLevel > profileForToday.level,
            earnedXp,
            nextProfile,
            nextProgress,
          };
        });

        setProfile(result.nextProfile);
        setProgress(result.nextProgress);

        if (!result.didCompleteTask) {
          setActionMessage("Essa tarefa ja rendeu XP hoje.");
          return;
        }

        setTaskFeedbackId(taskId);
        if (taskFeedbackTimerRef.current) {
          window.clearTimeout(taskFeedbackTimerRef.current);
        }
        taskFeedbackTimerRef.current = window.setTimeout(() => setTaskFeedbackId(null), 900);

        setActionMessage(
          result.didCompleteTutorialProject
            ? `Projeto tutorial concluido! +${result.earnedXp} XP no total.`
            : result.didCompleteDay
            ? `Dia completo! +${result.earnedXp} XP com bonus.`
            : `Boa! +${result.earnedXp} XP para seu personagem.`,
        );

        if (result.didLevelUp) {
          setLevelCelebration(true);
          if (levelTimerRef.current) {
            window.clearTimeout(levelTimerRef.current);
          }
          levelTimerRef.current = window.setTimeout(() => setLevelCelebration(false), 1700);
        }
      } catch {
        setError("Nao consegui salvar essa tarefa. Tente de novo.");
      } finally {
        setPendingTaskId(null);
        setSaving(false);
      }
    },
    [profile, progress],
  );

  return {
    configured,
    loading,
    saving,
    introSaving,
    projectSaving,
    pendingTaskId,
    pendingProjectTaskId,
    taskFeedbackId,
    actionMessage,
    error,
    profile,
    progress,
    projects,
    levelCelebration,
    startJourney,
    finishIntro,
    completeTask,
    createProject,
    completeProjectTask,
  };
}
