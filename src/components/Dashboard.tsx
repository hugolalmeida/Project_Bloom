"use client";

import { useState } from "react";
import { AdventureIntro } from "@/components/AdventureIntro";
import { Character } from "@/components/Character";
import { HomeDashboard } from "@/components/HomeDashboard";
import { ProjectsPanel } from "@/components/ProjectsPanel";
import { TaskChecklist } from "@/components/TaskChecklist";
import {
  TUTORIAL_PROJECT_DAYS,
  TUTORIAL_PROJECT_XP,
  getLevelProgress,
  getXpInCurrentLevel,
} from "@/lib/game";
import type { DailyProgress, TaskId, UserProfile } from "@/types/teancum";
import type { CreateProjectData, PersonalProject } from "@/types/teancum";

type DashboardTab = "home" | "today" | "projects" | "profile";

type DashboardProps = {
  actionMessage: string | null;
  error: string | null;
  levelCelebration: boolean;
  introSaving: boolean;
  pendingTaskId: TaskId | null;
  pendingProjectTaskId: string | null;
  profile: UserProfile;
  progress: DailyProgress | null;
  projectSaving: boolean;
  projects: PersonalProject[];
  saving: boolean;
  taskFeedbackId: TaskId | null;
  onFinishIntro: () => Promise<void>;
  onCompleteTask: (taskId: TaskId) => Promise<void>;
  onCompleteProjectTask: (projectId: string, taskId: string) => Promise<void>;
  onCreateProject: (data: CreateProjectData) => Promise<void>;
};

export function Dashboard({
  actionMessage,
  error,
  introSaving,
  levelCelebration,
  onFinishIntro,
  onCompleteTask,
  onCompleteProjectTask,
  onCreateProject,
  pendingTaskId,
  pendingProjectTaskId,
  profile,
  progress,
  projectSaving,
  projects,
  saving,
  taskFeedbackId,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  const xpProgress = getLevelProgress(profile.xp);
  const xpInLevel = getXpInCurrentLevel(profile.xp);
  const dayComplete = Boolean(progress?.completedAll);
  const characterName = profile.nickname ?? profile.characterName ?? profile.plantName ?? "Teancum";
  const tutorialTarget = TUTORIAL_PROJECT_DAYS;
  const tutorialProgress = Math.min(
    100,
    Math.round((Math.min(profile.completedDays, tutorialTarget) / tutorialTarget) * 100),
  );
  const tutorialComplete = Boolean(profile.tutorialProject?.rewardClaimed);
  const tutorialReady = !tutorialComplete && profile.completedDays >= tutorialTarget;
  const sequenceLabel = profile.streak === 1 ? "dia seguido" : "dias seguidos";
  const activeProjectCount = projects.filter((project) => !project.completed).length;
  const showAdventureIntro = !profile.introSeen;

  return (
    <main className="min-h-dvh bg-[#eaf1ff] px-3 py-4 sm:px-4 sm:py-5">
      <section className="mx-auto max-w-md pb-8">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1f5fbf]">
              Projeto Teâncum
            </p>
            <h1 className="mt-1 break-words text-3xl font-black leading-tight text-[#102b55]">
              Oi, {characterName}!
            </h1>
          </div>
          <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-center shadow-[0_10px_24px_rgba(17,49,96,0.1)]">
            <p className="text-xs font-bold text-[#66799e]">Sequencia</p>
            <p className="text-xl font-black text-[#f0a83a]">{profile.streak}</p>
            <p className="text-[10px] font-bold text-[#66799e]">{sequenceLabel}</p>
          </div>
        </header>

        <div className="space-y-4">
          {showAdventureIntro ? (
            <AdventureIntro
              characterName={characterName}
              saving={introSaving}
              onStart={onFinishIntro}
            />
          ) : null}

          <Character
            characterName={characterName}
            evolutionActive={levelCelebration}
            level={profile.level}
          />

          {levelCelebration ? <Confetti /> : null}

          <nav className="grid grid-cols-4 gap-2 rounded-[24px] bg-white p-2 shadow-[0_12px_26px_rgba(17,49,96,0.1)]">
            <TabButton
              active={activeTab === "home"}
              label="Inicio"
              onClick={() => setActiveTab("home")}
            />
            <TabButton
              active={activeTab === "today"}
              label="Hoje"
              onClick={() => setActiveTab("today")}
            />
            <TabButton
              active={activeTab === "projects"}
              label={`Projetos ${activeProjectCount}`}
              onClick={() => setActiveTab("projects")}
            />
            <TabButton
              active={activeTab === "profile"}
              label="Perfil"
              onClick={() => setActiveTab("profile")}
            />
          </nav>

          {activeTab === "home" ? (
            <HomeDashboard
              pendingProjectTaskId={pendingProjectTaskId}
              pendingTaskId={pendingTaskId}
              profile={profile}
              progress={progress}
              projectSaving={projectSaving}
              projects={projects}
              saving={saving}
              onCompleteProjectTask={onCompleteProjectTask}
              onCompleteTask={onCompleteTask}
            />
          ) : null}

          {activeTab === "today" && dayComplete ? (
            <section className="rounded-[26px] border-2 border-[#8fb5ff] bg-[#eaf1ff] px-4 py-3 shadow-[0_12px_24px_rgba(17,49,96,0.1)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1f5fbf] text-xl font-black text-white">
                  ✓
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-[#102b55]">Dia completo</h2>
                  <p className="text-sm font-semibold text-[#4b638f]">
                    Seu personagem concluiu os habitos espirituais de hoje.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "profile" ? (
          <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#66799e]">Level atual</p>
                <p className="text-2xl font-black text-[#102b55]">{profile.level}</p>
              </div>
              <div className="rounded-2xl bg-[#eaf1ff] px-3 py-2 text-right">
                <p className="text-xs font-bold text-[#4b638f]">XP</p>
                <p className="text-base font-black text-[#1f5fbf]">{xpInLevel}/100</p>
              </div>
            </div>
            <div className="h-5 overflow-hidden rounded-full border border-[#dbe6fb] bg-[#edf3ff] p-1">
              <div
                className="h-full min-w-2 rounded-full bg-[#1f5fbf] transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#66799e]">
              <span>{xpProgress}% para o proximo level</span>
              <span>{100 - xpInLevel} XP faltando</span>
            </div>
          </section>
          ) : null}

          {activeTab === "profile" ? (
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-[#dce8ff] p-4 shadow-[0_10px_22px_rgba(17,49,96,0.1)]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
                Dias completos
              </p>
              <p className="mt-1 text-3xl font-black text-[#102b55]">{profile.completedDays}</p>
            </div>
            <div className="rounded-[24px] bg-[#c8dcff] p-4 shadow-[0_10px_22px_rgba(17,49,96,0.1)]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
                XP total
              </p>
              <p className="mt-1 text-3xl font-black text-[#102b55]">{profile.xp}</p>
            </div>
          </section>
          ) : null}

          {activeTab === "today" ? (
          <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#102b55]">
                  {tutorialComplete ? "Projeto tutorial concluido" : "Projeto tutorial"}
                </h2>
                <p className="text-xs font-bold text-[#66799e]">
                  {tutorialComplete
                    ? "Voce aprendeu o ciclo basico. Novos projetos virao aqui."
                    : tutorialReady
                      ? "Complete um dia para resgatar a recompensa."
                      : "Complete 3 dias para aprender o ciclo do jogo."}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-sm font-black text-[#1f5fbf]">
                  {tutorialComplete
                    ? "Feito"
                    : `${Math.min(profile.completedDays, tutorialTarget)}/${tutorialTarget}`}
                </span>
                <span className="block text-xs font-black text-[#f0a83a]">
                  +{TUTORIAL_PROJECT_XP} XP
                </span>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#edf3ff]">
              <div
                className="h-full rounded-full bg-[#1f5fbf] transition-all duration-500"
                style={{ width: `${tutorialComplete ? 100 : tutorialProgress}%` }}
              />
            </div>
          </section>
          ) : null}

          {activeTab === "today" ? (
          <TaskChecklist
            feedbackTaskId={taskFeedbackId}
            pendingTaskId={pendingTaskId}
            profile={profile}
            progress={progress}
            saving={saving}
            onCompleteTask={onCompleteTask}
          />
          ) : null}

          {activeTab === "projects" ? (
          <ProjectsPanel
            pendingProjectTaskId={pendingProjectTaskId}
            projectSaving={projectSaving}
            projects={projects}
            onCompleteProjectTask={onCompleteProjectTask}
            onCreateProject={onCreateProject}
          />
          ) : null}

          {activeTab === "projects" ? (
          <section className="rounded-[28px] border border-[#d7e3fb] bg-white/80 p-4 shadow-[0_14px_32px_rgba(17,49,96,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dff2cf] text-2xl">
                🌱
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
                  Evento futuro
                </p>
                <h2 className="text-base font-black text-[#102b55]">Bloom</h2>
                <p className="mt-1 text-sm font-semibold text-[#66799e]">
                  Uma temporada especial de 7 semanas para ganhar muito XP.
                </p>
              </div>
            </div>
          </section>
          ) : null}

          {actionMessage ? (
            <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-black text-[#1f5fbf] shadow-[0_10px_22px_rgba(17,49,96,0.08)]">
              {actionMessage}
            </p>
          ) : null}

          {error ? (
            <div className="rounded-2xl bg-[#fff0f0] px-4 py-3 shadow-[0_10px_22px_rgba(110,52,52,0.08)]">
              <p className="text-sm font-black text-[#9c3f3f]">Algo nao salvou</p>
              <p className="mt-1 text-sm font-semibold text-[#b94b4b]">{error}</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

type TabButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function TabButton({ active, label, onClick }: TabButtonProps) {
  return (
    <button
      className={`h-11 rounded-2xl text-xs font-black transition ${
        active ? "bg-[#1f5fbf] text-white shadow-[0_4px_0_#123f86]" : "bg-[#eaf1ff] text-[#1f5fbf]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Confetti() {
  const pieces = ["#6aaa64", "#ffe783", "#8cc8ff", "#f29c8f", "#b9dfa7"];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 z-10 mx-auto h-32 max-w-md overflow-hidden">
      {pieces.map((color, index) => (
        <span
          className="absolute top-0 h-3 w-3 rounded-sm"
          key={color}
          style={{
            animation: "confetti-drop 1300ms ease-out forwards",
            background: color,
            left: `${18 + index * 16}%`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
      <div className="absolute inset-x-8 top-7 rounded-2xl bg-white/90 px-4 py-3 text-center text-sm font-black text-[#254033] shadow-[0_12px_28px_rgba(70,98,74,0.16)]">
        Level up!
      </div>
    </div>
  );
}
