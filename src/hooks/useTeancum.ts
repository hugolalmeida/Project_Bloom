"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase";
import {
  DAILY_BONUS_XP,
  DAILY_COMPLETE_COINS,
  DAILY_TASK_COINS,
  areAllTasksComplete,
  formatCoins,
  getDailyProgressId,
  getDailyTasks,
  getLevelFromXp,
  getNextStreak,
  getProjectCoinReward,
  getProjectDurationFromDays,
  getProjectReward,
  getProjectTaskXp,
  MAX_ACTIVE_PROJECTS,
  MAX_PROJECT_TASKS,
  getTodayKey,
  normalizeTaskProgress,
  shouldResetStreak,
  SHOP_ITEMS,
  EMPTY_TASK_PROGRESS,
  TUTORIAL_PROJECT_DAYS,
  TUTORIAL_PROJECT_COINS,
  TUTORIAL_PROJECT_XP,
  PROJECT_TASK_COINS,
  BATTLE_UNLOCK_LEVEL,
} from "@/lib/game";
import type {
  BattleRoom,
  CreateProjectData,
  DailyProgress,
  LeaderboardEntry,
  OnboardingData,
  PersonalProject,
  ShopItemId,
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

function getFirebaseErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

function getFirebaseConnectionMessage(error: unknown) {
  const code = getFirebaseErrorCode(error);

  if (code === "auth/unauthorized-domain") {
    return "Domínio não autorizado no Firebase Auth. Adicione projeto-teancum.vercel.app em Authentication > Settings > Authorized domains.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Este provedor de login não está habilitado no Firebase Auth. Ative Anonymous e Google em Authentication > Sign-in method.";
  }

  if (code === "auth/popup-closed-by-user") {
    return "A janela do Google foi fechada antes de concluir.";
  }

  if (
    code === "auth/credential-already-in-use" ||
    code === "auth/account-exists-with-different-credential"
  ) {
    return "Essa conta Google já está vinculada a outra jornada.";
  }

  if (code === "auth/api-key-not-valid" || code === "auth/invalid-api-key") {
    return "A chave pública do Firebase na Vercel parece inválida. Confira as variáveis NEXT_PUBLIC_FIREBASE_*.";
  }

  if (code === "permission-denied") {
    return "Conectei ao Firebase, mas o Firestore negou acesso. Publique as regras atualizadas em firestore.rules.";
  }

  return code
    ? `Não consegui conectar ao Firebase agora. Código: ${code}.`
    : "Não consegui conectar ao Firebase agora.";
}

function getLeaderboardEntry(profile: UserProfile): LeaderboardEntry {
  return {
    uid: profile.uid,
    nickname: profile.nickname ?? profile.characterName ?? profile.userName ?? "Jovem",
    accountProvider: profile.accountProvider ?? "anonymous",
    level: getLevelFromXp(profile.xp),
    xp: profile.xp,
    streak: profile.streak,
    completedDays: profile.completedDays,
  };
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    coins: profile.coins ?? 0,
    inventory: {
      ownedItemIds: profile.inventory?.ownedItemIds ?? [],
      equippedItemId: profile.inventory?.equippedItemId ?? null,
    },
  };
}

function getBattleCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function useTeancum() {
  const configured = useMemo(() => hasFirebaseConfig(), []);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeBattle, setActiveBattle] = useState<BattleRoom | null>(null);
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [loading, setLoading] = useState(configured);
  const [accountSaving, setAccountSaving] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);
  const [battleSaving, setBattleSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [introSaving, setIntroSaving] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<TaskId | null>(null);
  const [pendingProjectTaskId, setPendingProjectTaskId] = useState<string | null>(null);
  const [pendingShopItemId, setPendingShopItemId] = useState<ShopItemId | null>(null);
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

  useEffect(() => {
    if (!configured || !activeBattleId) {
      return;
    }

    const db = getFirebaseDb();
    const unsubscribe = onSnapshot(
      doc(db, "battles", activeBattleId),
      (battleSnap) => {
        setActiveBattle(
          battleSnap.exists()
            ? {
                id: battleSnap.id,
                ...(battleSnap.data() as Omit<BattleRoom, "id">),
              }
            : null,
        );
      },
      () => {
        setError("Não consegui acompanhar essa sala de combate agora.");
      },
    );

    return unsubscribe;
  }, [activeBattleId, configured]);

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

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);

    try {
      const db = getFirebaseDb();
      const leaderboardQuery = query(
        collection(db, "leaderboard"),
        orderBy("xp", "desc"),
        limit(30),
      );
      const leaderboardSnap = await getDocs(leaderboardQuery);

      setLeaderboard(
        leaderboardSnap.docs.map((entryDoc, index) => ({
          ...(entryDoc.data() as LeaderboardEntry),
          rank: index + 1,
        })),
      );
    } catch (caughtError) {
      console.error("Erro ao carregar ranking", caughtError);
      setLeaderboardError("Não consegui carregar o ranking agora.");
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const syncLeaderboard = useCallback(
    async (nextProfile: UserProfile) => {
      try {
        const db = getFirebaseDb();
        await setDoc(doc(db, "leaderboard", nextProfile.uid), {
          ...getLeaderboardEntry(nextProfile),
          updatedAt: serverTimestamp(),
        });
        await loadLeaderboard();
      } catch (caughtError) {
        console.warn("Erro ao atualizar ranking", caughtError);
        setLeaderboardError("Ranking aguardando regras do Firestore.");
      }
    },
    [loadLeaderboard],
  );

  const refreshLeaderboard = useCallback(async () => {
    if (profile) {
      await syncLeaderboard(profile);
      return;
    }

    await loadLeaderboard();
  }, [loadLeaderboard, profile, syncLeaderboard]);

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

    let loadedProfile = normalizeProfile(userSnap.data() as UserProfile);

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
    void syncLeaderboard(loadedProfile);
  }, [loadProjects, syncLeaderboard]);

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
      } catch (caughtError) {
        console.error("Erro ao conectar ao Firebase", caughtError);
        setError(getFirebaseConnectionMessage(caughtError));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [configured, loadUserData]);

  const startJourney = useCallback(
    async ({
      nickname,
      prayerTarget,
      scriptureTarget,
      customTaskLabel,
      avatar,
      tutorialArea,
      tutorialTasks,
    }: OnboardingData) => {
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
          accountProvider: user.isAnonymous ? "anonymous" : "google",
          email: user.email ?? null,
          nickname: nickname.trim(),
          characterName: nickname.trim(),
          avatar,
          introSeen: false,
          goals: {
            prayerTarget,
            scriptureTarget,
            ...(customTaskLabel?.trim() ? { customTaskLabel: customTaskLabel.trim() } : {}),
          },
          inventory: {
            ownedItemIds: [],
            equippedItemId: null,
          },
          tutorialProject: {
            area: tutorialArea,
            tasks: tutorialTasks.slice(0, MAX_PROJECT_TASKS),
            targetDays: TUTORIAL_PROJECT_DAYS,
            completed: false,
            completedDate: null,
            rewardClaimed: false,
          },
          xp: 0,
          coins: 0,
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
        void syncLeaderboard(newProfile);
      } catch (caughtError) {
        console.error("Erro ao começar a jornada", caughtError);
        setError(getFirebaseConnectionMessage(caughtError));
      } finally {
        setSaving(false);
      }
    },
    [authUser, configured, syncLeaderboard],
  );

  const linkGoogleAccount = useCallback(async () => {
    if (!configured || !profile) return;

    setAccountSaving(true);
    setActionMessage(null);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const currentUser = auth.currentUser ?? authUser;

      if (!currentUser) {
        throw new Error("missing-auth-user");
      }

      if (!currentUser.isAnonymous) {
        setActionMessage("Seu progresso já está salvo com uma conta.");
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credential = await linkWithPopup(currentUser, provider);

      await updateDoc(doc(db, "users", credential.user.uid), {
        accountProvider: "google",
        email: credential.user.email ?? null,
        updatedAt: serverTimestamp(),
      });

      setAuthUser(credential.user);
      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              accountProvider: "google",
              email: credential.user.email ?? null,
            }
          : currentProfile,
      );
      setActionMessage("Progresso salvo com Google.");
    } catch (caughtError) {
      console.error("Erro ao vincular conta Google", caughtError);
      setError(getFirebaseConnectionMessage(caughtError));
    } finally {
      setAccountSaving(false);
    }
  }, [authUser, configured, profile]);

  const signInGoogleAccount = useCallback(async () => {
    if (!configured) return;

    setAccountSaving(true);
    setActionMessage(null);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credential = await signInWithPopup(auth, provider);
      setAuthUser(credential.user);
      await loadUserData(credential.user);

      setActionMessage("Conta Google carregada.");
    } catch (caughtError) {
      console.error("Erro ao entrar com Google", caughtError);
      setError(getFirebaseConnectionMessage(caughtError));
    } finally {
      setAccountSaving(false);
    }
  }, [configured, loadUserData]);

  const buyShopItem = useCallback(
    async (itemId: ShopItemId) => {
      if (!profile) return;

      const item = SHOP_ITEMS.find((shopItem) => shopItem.id === itemId);

      if (!item) return;

      setShopSaving(true);
      setPendingShopItemId(itemId);
      setActionMessage(null);
      setError(null);

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, "users", profile.uid);

        const result = await runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userRef);

          if (!userSnap.exists()) {
            throw new Error("missing-profile");
          }

          const freshProfile = normalizeProfile(userSnap.data() as UserProfile);
          const ownedItemIds = freshProfile.inventory?.ownedItemIds ?? [];
          const levelLocked = getLevelFromXp(freshProfile.xp) < item.minLevel;

          if (levelLocked) {
            return {
              bought: false,
              equipped: false,
              insufficientCoins: false,
              levelLocked: true,
              nextProfile: freshProfile,
            };
          }

          if (ownedItemIds.includes(itemId)) {
            const nextProfile = {
              ...freshProfile,
              inventory: {
                ownedItemIds,
                equippedItemId: itemId,
              },
            };

            transaction.update(userRef, {
              inventory: nextProfile.inventory,
              updatedAt: serverTimestamp(),
            });

            return {
              bought: false,
              equipped: true,
              insufficientCoins: false,
              levelLocked: false,
              nextProfile,
            };
          }

          if ((freshProfile.coins ?? 0) < item.price) {
            return {
              bought: false,
              equipped: false,
              insufficientCoins: true,
              levelLocked: false,
              nextProfile: freshProfile,
            };
          }

          const nextProfile = {
            ...freshProfile,
            coins: freshProfile.coins - item.price,
            inventory: {
              ownedItemIds: [...ownedItemIds, itemId],
              equippedItemId: itemId,
            },
          };

          transaction.update(userRef, {
            coins: nextProfile.coins,
            inventory: nextProfile.inventory,
            updatedAt: serverTimestamp(),
          });

          return {
            bought: true,
            equipped: true,
            insufficientCoins: false,
            levelLocked: false,
            nextProfile,
          };
        });

        setProfile(result.nextProfile);

        if (result.insufficientCoins) {
          setActionMessage("Você ainda não tem moedas suficientes para esse item.");
          return;
        }

        if (result.levelLocked) {
          setActionMessage(`Esse item libera no level ${item.minLevel}.`);
          return;
        }

        setActionMessage(
          result.bought
            ? `${item.name} comprado e equipado.`
            : `${item.name} equipado no personagem.`,
        );
      } catch {
        setError("Não consegui atualizar a loja agora. Tente novamente.");
      } finally {
        setPendingShopItemId(null);
        setShopSaving(false);
      }
    },
    [profile],
  );

  const equipShopItem = useCallback(
    async (itemId: ShopItemId) => {
      if (!profile) return;

      const item = SHOP_ITEMS.find((shopItem) => shopItem.id === itemId);
      const ownedItemIds = profile.inventory?.ownedItemIds ?? [];

      if (!item || !ownedItemIds.includes(itemId)) return;

      setShopSaving(true);
      setPendingShopItemId(itemId);
      setActionMessage(null);
      setError(null);

      try {
        const db = getFirebaseDb();
        const nextInventory = {
          ownedItemIds,
          equippedItemId: itemId,
        };

        await updateDoc(doc(db, "users", profile.uid), {
          inventory: nextInventory,
          updatedAt: serverTimestamp(),
        });

        setProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                inventory: nextInventory,
              }
            : currentProfile,
        );
        setActionMessage(`${item.name} equipado no personagem.`);
      } catch {
        setError("Não consegui equipar esse item agora.");
      } finally {
        setPendingShopItemId(null);
        setShopSaving(false);
      }
    },
    [profile],
  );

  const createBattle = useCallback(async () => {
    if (!profile) return;

    if (getLevelFromXp(profile.xp) < BATTLE_UNLOCK_LEVEL) {
      setActionMessage(`Combate libera no level ${BATTLE_UNLOCK_LEVEL}.`);
      return;
    }

    setBattleSaving(true);
    setActionMessage(null);
    setError(null);

    try {
      const db = getFirebaseDb();
      const hostName = profile.nickname ?? profile.characterName ?? profile.userName ?? "Jovem";

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = getBattleCode();
        const battleRef = doc(db, "battles", code);
        const battleSnap = await getDoc(battleRef);

        if (battleSnap.exists()) continue;

        await setDoc(battleRef, {
          hostUid: profile.uid,
          hostName,
          guestUid: null,
          guestName: null,
          status: "waiting",
          winnerUid: null,
          createdDateKey: getTodayKey(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setActiveBattleId(code);
        setActionMessage("Sala de combate criada. Compartilhe o código com outro jovem.");
        return;
      }

      throw new Error("battle-code-collision");
    } catch {
      setError("Não consegui criar a sala de combate agora.");
    } finally {
      setBattleSaving(false);
    }
  }, [profile]);

  const joinBattle = useCallback(
    async (rawCode: string) => {
      if (!profile) return;

      if (getLevelFromXp(profile.xp) < BATTLE_UNLOCK_LEVEL) {
        setActionMessage(`Combate libera no level ${BATTLE_UNLOCK_LEVEL}.`);
        return;
      }

      const code = rawCode.trim().toUpperCase();

      if (code.length < 4) {
        setActionMessage("Digite um código de combate válido.");
        return;
      }

      setBattleSaving(true);
      setActionMessage(null);
      setError(null);

      try {
        const db = getFirebaseDb();
        const battleRef = doc(db, "battles", code);
        const guestName = profile.nickname ?? profile.characterName ?? profile.userName ?? "Jovem";

        const result = await runTransaction(db, async (transaction) => {
          const battleSnap = await transaction.get(battleRef);

          if (!battleSnap.exists()) {
            return { joined: false, reason: "missing" as const };
          }

          const battle = battleSnap.data() as Omit<BattleRoom, "id">;

          if (battle.status === "finished") {
            return { joined: false, reason: "finished" as const };
          }

          if (battle.hostUid === profile.uid || battle.guestUid === profile.uid) {
            return { joined: true, reason: "already-in" as const };
          }

          if (battle.guestUid) {
            return { joined: false, reason: "full" as const };
          }

          transaction.update(battleRef, {
            guestUid: profile.uid,
            guestName,
            status: "ready",
            updatedAt: serverTimestamp(),
          });

          return { joined: true, reason: "joined" as const };
        });

        if (!result.joined) {
          setActionMessage(
            result.reason === "missing"
              ? "Não encontrei essa sala de combate."
              : result.reason === "finished"
                ? "Essa batalha já foi encerrada."
                : "Essa sala já está cheia.",
          );
          return;
        }

        setActiveBattleId(code);
        setActionMessage(
          result.reason === "already-in"
            ? "Você voltou para essa sala de combate."
            : "Você entrou na sala. O treino está pronto.",
        );
      } catch {
        setError("Não consegui entrar nessa sala de combate agora.");
      } finally {
        setBattleSaving(false);
      }
    },
    [profile],
  );

  const closeBattle = useCallback(() => {
    setActiveBattleId(null);
    setActiveBattle(null);
  }, []);

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
      setActionMessage("Aventura iniciada. Sua primeira missão já está liberada.");
    } catch {
      setError("Não consegui salvar o início da aventura. Tente novamente.");
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
        let customTaskCount = 0;
        const projectTasks = normalizedTasks
          .slice(0, MAX_PROJECT_TASKS)
          .map((task, index) => {
            const customTaskIndex = task.source === "custom" ? customTaskCount++ : 0;

            return {
              id: `${Date.now()}-${index}`,
              label: task.label,
              source: task.source,
              xpReward: getProjectTaskXp(task.source, customTaskIndex),
              completedCount: 0,
              lastCompletedDate: null,
              completed: false,
            };
          });
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
        setActionMessage("Projeto criado. Agora e só concluir as tarefas.");
      } catch {
        setError("Não consegui criar o projeto. Tente novamente.");
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
              earnedCoins: 0,
              nextProfile: freshProfile,
              nextProject: freshProject,
            };
          }

          const targetTaskIndex = freshProject.tasks.findIndex((task) => task.id === taskId);
          const targetTask = targetTaskIndex >= 0 ? freshProject.tasks[targetTaskIndex] : null;

          const taskAlreadyDoneToday = targetTask?.lastCompletedDate === dateKey;

          if (!targetTask || targetTask.completed || taskAlreadyDoneToday) {
            return {
              didCompleteTask: false,
              didCompleteProjectDay: false,
              didCompleteProject: false,
              didLevelUp: false,
              earnedXp: 0,
              earnedCoins: 0,
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
          const customTaskIndex =
            targetTask.source === "custom"
              ? freshProject.tasks
                  .slice(0, targetTaskIndex + 1)
                  .filter((task) => task.source === "custom").length - 1
              : 0;
          const taskXp =
            targetTask.xpReward ?? getProjectTaskXp(targetTask.source, customTaskIndex);
          const earnedXp = taskXp + (didCompleteProject ? freshProject.xpReward : 0);
          const earnedCoins =
            PROJECT_TASK_COINS +
            (didCompleteProject ? getProjectCoinReward(freshProject.duration) : 0);
          const nextXp = freshProfile.xp + earnedXp;
          const nextCoins = (freshProfile.coins ?? 0) + earnedCoins;
          const nextLevel = getLevelFromXp(nextXp);
          const nextProfile = {
            ...freshProfile,
            xp: nextXp,
            coins: nextCoins,
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
            coins: nextProfile.coins,
            level: nextProfile.level,
            updatedAt: serverTimestamp(),
          });

          return {
            didCompleteTask: true,
            didCompleteProjectDay: completedProjectDay,
            didCompleteProject,
            didLevelUp: nextLevel > freshProfile.level,
            earnedXp,
            earnedCoins,
            nextProfile,
            nextProject,
          };
        });

        setProfile(result.nextProfile);
        void syncLeaderboard(result.nextProfile);
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === projectId ? result.nextProject : project,
          ),
        );

        if (!result.didCompleteTask) {
          setActionMessage("Essa tarefa de projeto já foi concluída.");
          return;
        }

        setActionMessage(
          result.didCompleteProject
            ? `Projeto concluído! +${result.earnedXp} XP e +${formatCoins(result.earnedCoins)}.`
            : result.didCompleteProjectDay
            ? `Dia do projeto completo! +${result.earnedXp} XP e +${formatCoins(result.earnedCoins)}.`
            : `Tarefa do projeto concluída! +${result.earnedXp} XP e +${formatCoins(result.earnedCoins)}.`,
        );

        if (result.didLevelUp) {
          setLevelCelebration(true);
          if (levelTimerRef.current) {
            window.clearTimeout(levelTimerRef.current);
          }
          levelTimerRef.current = window.setTimeout(() => setLevelCelebration(false), 1700);
        }
      } catch {
        setError("Não consegui salvar o projeto. Tente novamente.");
      } finally {
        setPendingProjectTaskId(null);
        setProjectSaving(false);
      }
    },
    [profile, syncLeaderboard],
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
        setActionMessage("Essa tarefa já rendeu XP hoje.");
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
              targetDays: TUTORIAL_PROJECT_DAYS,
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
              earnedCoins: 0,
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
          const earnedCoins =
            DAILY_TASK_COINS +
            (completedAllFirstTime ? DAILY_COMPLETE_COINS : 0) +
            (didCompleteTutorialProject ? TUTORIAL_PROJECT_COINS : 0);
          const nextXp = profileForToday.xp + earnedXp;
          const nextCoins = (profileForToday.coins ?? 0) + earnedCoins;
          const nextLevel = getLevelFromXp(nextXp);

          const nextProfile: UserProfile = {
            ...profileForToday,
            xp: nextXp,
            coins: nextCoins,
            level: nextLevel,
            streak: completedAllFirstTime
              ? getNextStreak(profileForToday, dateKey)
              : profileForToday.streak,
            completedDays: nextCompletedDays,
            lastCompletedDate: completedAllFirstTime ? dateKey : profileForToday.lastCompletedDate,
            tutorialProject: didCompleteTutorialProject
                ? {
                  ...profileForToday.tutorialProject,
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
            coins: nextProfile.coins,
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
            earnedCoins,
            nextProfile,
            nextProgress,
          };
        });

        setProfile(result.nextProfile);
        void syncLeaderboard(result.nextProfile);
        setProgress(result.nextProgress);

        if (!result.didCompleteTask) {
          setActionMessage("Essa tarefa já rendeu XP hoje.");
          return;
        }

        setTaskFeedbackId(taskId);
        if (taskFeedbackTimerRef.current) {
          window.clearTimeout(taskFeedbackTimerRef.current);
        }
        taskFeedbackTimerRef.current = window.setTimeout(() => setTaskFeedbackId(null), 900);

        setActionMessage(
          result.didCompleteTutorialProject
            ? `Projeto tutorial concluído! +${result.earnedXp} XP e +${formatCoins(result.earnedCoins)}.`
            : result.didCompleteDay
            ? `Dia completo! +${result.earnedXp} XP e +${formatCoins(result.earnedCoins)}.`
            : `Boa! +${result.earnedXp} XP e +${formatCoins(result.earnedCoins)} para seu personagem.`,
        );

        if (result.didLevelUp) {
          setLevelCelebration(true);
          if (levelTimerRef.current) {
            window.clearTimeout(levelTimerRef.current);
          }
          levelTimerRef.current = window.setTimeout(() => setLevelCelebration(false), 1700);
        }
      } catch {
        setError("Não consegui salvar essa tarefa. Tente de novo.");
      } finally {
        setPendingTaskId(null);
        setSaving(false);
      }
    },
    [profile, progress, syncLeaderboard],
  );

  return {
    configured,
    loading,
    accountEmail: authUser?.email ?? profile?.email ?? null,
    accountLinked: Boolean(authUser && !authUser.isAnonymous),
    accountSaving,
    shopSaving,
    battleSaving,
    saving,
    introSaving,
    projectSaving,
    pendingTaskId,
    pendingProjectTaskId,
    pendingShopItemId,
    taskFeedbackId,
    actionMessage,
    error,
    profile,
    progress,
    projects,
    activeBattle,
    leaderboard,
    leaderboardLoading,
    leaderboardError,
    levelCelebration,
    startJourney,
    signInGoogleAccount,
    linkGoogleAccount,
    buyShopItem,
    equipShopItem,
    createBattle,
    joinBattle,
    closeBattle,
    finishIntro,
    completeTask,
    createProject,
    completeProjectTask,
    refreshLeaderboard,
  };
}
