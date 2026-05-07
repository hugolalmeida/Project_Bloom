"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase";
import {
  DAILY_BONUS_XP,
  EMPTY_TASKS,
  TASK_XP,
  areAllTasksComplete,
  getLevelFromXp,
  getNextStreak,
  getTodayKey,
  shouldResetStreak,
} from "@/lib/game";
import type { DailyProgress, OnboardingData, TaskId, UserProfile } from "@/types/bloom";

function createEmptyProgress(uid: string, dateKey = getTodayKey()): DailyProgress {
  return {
    uid,
    dateKey,
    tasks: { ...EMPTY_TASKS },
    completedAll: false,
    xpEarned: 0,
  };
}

export function useBloom() {
  const configured = useMemo(() => hasFirebaseConfig(), []);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(configured);
  const [saving, setSaving] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<TaskId | null>(null);
  const [taskFeedbackId, setTaskFeedbackId] = useState<TaskId | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    configured ? null : "Configure o Firebase em .env.local para jogar o Bloom.",
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

  const loadUserData = useCallback(async (user: User) => {
    const dateKey = getTodayKey();
    const db = getFirebaseDb();
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      setProfile(null);
      setProgress(createEmptyProgress(user.uid, dateKey));
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

    const progressRef = doc(db, "dailyProgress", `${user.uid}_${dateKey}`);
    const progressSnap = await getDoc(progressRef);

    setProfile(loadedProfile);
    setProgress(
      progressSnap.exists()
        ? (progressSnap.data() as DailyProgress)
        : createEmptyProgress(user.uid, dateKey),
    );
  }, []);

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
    async ({ userName, plantName }: OnboardingData) => {
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
          userName: userName.trim(),
          plantName: plantName.trim(),
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
      } catch {
        setError("Nao foi possivel comecar a jornada. Tente novamente.");
      } finally {
        setSaving(false);
      }
    },
    [authUser, configured],
  );

  const completeTask = useCallback(
    async (taskId: TaskId) => {
      if (!profile || !progress) return;

      const dateKey = getTodayKey();
      const activeProgress =
        progress.dateKey === dateKey ? progress : createEmptyProgress(profile.uid, dateKey);

      if (activeProgress.tasks[taskId]) {
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
        const progressRef = doc(db, "dailyProgress", `${profile.uid}_${dateKey}`);

        const result = await runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userRef);
          const progressSnap = await transaction.get(progressRef);

          if (!userSnap.exists()) {
            throw new Error("missing-profile");
          }

          const freshProfile = userSnap.data() as UserProfile;
          const profileForToday = shouldResetStreak(freshProfile, dateKey)
            ? { ...freshProfile, streak: 0 }
            : freshProfile;

          const freshProgress = progressSnap.exists()
            ? (progressSnap.data() as DailyProgress)
            : createEmptyProgress(profile.uid, dateKey);

          if (freshProgress.tasks[taskId]) {
            return {
              didCompleteTask: false,
              didCompleteDay: false,
              didLevelUp: false,
              earnedXp: 0,
              nextProfile: profileForToday,
              nextProgress: freshProgress,
            };
          }

          const nextTasks = { ...freshProgress.tasks, [taskId]: true };
          const completedAllNow = areAllTasksComplete(nextTasks);
          const completedAllFirstTime = completedAllNow && !freshProgress.completedAll;
          const earnedXp = TASK_XP + (completedAllFirstTime ? DAILY_BONUS_XP : 0);
          const nextXp = profileForToday.xp + earnedXp;
          const nextLevel = getLevelFromXp(nextXp);

          const nextProfile: UserProfile = {
            ...profileForToday,
            xp: nextXp,
            level: nextLevel,
            streak: completedAllFirstTime
              ? getNextStreak(profileForToday, dateKey)
              : profileForToday.streak,
            completedDays: completedAllFirstTime
              ? profileForToday.completedDays + 1
              : profileForToday.completedDays,
            lastCompletedDate: completedAllFirstTime ? dateKey : profileForToday.lastCompletedDate,
          };

          const nextProgress: DailyProgress = {
            ...freshProgress,
            dateKey,
            tasks: nextTasks,
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
            updatedAt: serverTimestamp(),
          });

          return {
            didCompleteTask: true,
            didCompleteDay: completedAllFirstTime,
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
          result.didCompleteDay
            ? `Dia completo! +${result.earnedXp} XP com bonus.`
            : `Boa! +${result.earnedXp} XP para sua planta.`,
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
    pendingTaskId,
    taskFeedbackId,
    actionMessage,
    error,
    profile,
    progress,
    levelCelebration,
    startJourney,
    completeTask,
  };
}
