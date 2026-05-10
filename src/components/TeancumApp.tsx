"use client";

import { Dashboard } from "@/components/Dashboard";
import { Onboarding } from "@/components/Onboarding";
import { useTeancum } from "@/hooks/useTeancum";

export function TeancumApp() {
  const teancum = useTeancum();

  if (teancum.loading) {
    return (
      <main className="min-h-dvh bg-[#eaf1ff] px-5 py-8">
        <div className="mx-auto flex min-h-[80dvh] max-w-md items-center justify-center">
          <div className="rounded-[28px] bg-white/90 px-8 py-7 text-center shadow-[0_18px_45px_rgba(17,49,96,0.14)]">
            <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-[#c8dcff]" />
            <p className="text-sm font-semibold text-[#1f5fbf]">Preparando sua jornada...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!teancum.configured) {
    return (
      <main className="min-h-dvh bg-[#eaf1ff] px-5 py-8">
        <div className="mx-auto flex min-h-[80dvh] max-w-md items-center justify-center">
          <div className="rounded-[28px] border border-[#cfdcf6] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(17,49,96,0.14)]">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#1f5fbf]">
              Projeto Teâncum
            </p>
            <h1 className="text-2xl font-black text-[#102b55]">Firebase ainda nao configurado</h1>
            <p className="mt-3 text-sm leading-6 text-[#4b638f]">
              Crie um arquivo <span className="font-semibold text-[#102b55]">.env.local</span> com as chaves
              publicas do Firebase para ativar login anonimo e Firestore.
            </p>
            {teancum.error ? (
              <p className="mt-4 rounded-2xl bg-[#fff7dc] px-4 py-3 text-sm font-bold text-[#7a6418]">
                {teancum.error}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  if (!teancum.profile) {
    return (
      <Onboarding
        error={teancum.error}
        saving={teancum.saving}
        onStart={teancum.startJourney}
      />
    );
  }

  return (
    <Dashboard
      error={teancum.error}
      actionMessage={teancum.actionMessage}
      introSaving={teancum.introSaving}
      levelCelebration={teancum.levelCelebration}
      onCompleteProjectTask={teancum.completeProjectTask}
      onCompleteTask={teancum.completeTask}
      onCreateProject={teancum.createProject}
      onFinishIntro={teancum.finishIntro}
      pendingProjectTaskId={teancum.pendingProjectTaskId}
      pendingTaskId={teancum.pendingTaskId}
      profile={teancum.profile}
      progress={teancum.progress}
      projectSaving={teancum.projectSaving}
      projects={teancum.projects}
      saving={teancum.saving}
      taskFeedbackId={teancum.taskFeedbackId}
    />
  );
}
