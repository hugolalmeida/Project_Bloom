"use client";

import { Dashboard } from "@/components/Dashboard";
import { Onboarding } from "@/components/Onboarding";
import { useBloom } from "@/hooks/useBloom";

export function BloomApp() {
  const bloom = useBloom();

  if (bloom.loading) {
    return (
      <main className="min-h-dvh bg-[#fff8e8] px-5 py-8">
        <div className="mx-auto flex min-h-[80dvh] max-w-md items-center justify-center">
          <div className="rounded-[28px] bg-white/85 px-8 py-7 text-center shadow-[0_18px_45px_rgba(70,98,74,0.14)]">
            <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-[#dff2cf]" />
            <p className="text-sm font-semibold text-[#4d705c]">Preparando seu jardim...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!bloom.configured) {
    return (
      <main className="min-h-dvh bg-[#fff8e8] px-5 py-8">
        <div className="mx-auto flex min-h-[80dvh] max-w-md items-center justify-center">
          <div className="rounded-[28px] border border-[#f2dfab] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(70,98,74,0.14)]">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#6aaa64]">Bloom</p>
            <h1 className="text-2xl font-black text-[#254033]">Firebase ainda nao configurado</h1>
            <p className="mt-3 text-sm leading-6 text-[#6a7567]">
              Crie um arquivo <span className="font-semibold text-[#254033]">.env.local</span> com as chaves
              publicas do Firebase para ativar login anonimo e Firestore.
            </p>
            {bloom.error ? (
              <p className="mt-4 rounded-2xl bg-[#fff7dc] px-4 py-3 text-sm font-bold text-[#7a6418]">
                {bloom.error}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  if (!bloom.profile) {
    return <Onboarding error={bloom.error} saving={bloom.saving} onStart={bloom.startJourney} />;
  }

  return (
    <Dashboard
      error={bloom.error}
      actionMessage={bloom.actionMessage}
      levelCelebration={bloom.levelCelebration}
      onCompleteTask={bloom.completeTask}
      pendingTaskId={bloom.pendingTaskId}
      profile={bloom.profile}
      progress={bloom.progress}
      saving={bloom.saving}
      taskFeedbackId={bloom.taskFeedbackId}
    />
  );
}
