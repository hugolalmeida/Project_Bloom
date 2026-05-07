import { Plant } from "@/components/Plant";
import { TaskChecklist } from "@/components/TaskChecklist";
import { JOURNEY_DAYS, getCurrentWeek, getLevelProgress, getXpInCurrentLevel } from "@/lib/game";
import type { DailyProgress, TaskId, UserProfile } from "@/types/bloom";

type DashboardProps = {
  actionMessage: string | null;
  error: string | null;
  levelCelebration: boolean;
  pendingTaskId: TaskId | null;
  profile: UserProfile;
  progress: DailyProgress | null;
  saving: boolean;
  taskFeedbackId: TaskId | null;
  onCompleteTask: (taskId: TaskId) => Promise<void>;
};

export function Dashboard({
  actionMessage,
  error,
  levelCelebration,
  onCompleteTask,
  pendingTaskId,
  profile,
  progress,
  saving,
  taskFeedbackId,
}: DashboardProps) {
  const xpProgress = getLevelProgress(profile.xp);
  const xpInLevel = getXpInCurrentLevel(profile.xp);
  const week = getCurrentWeek(profile.completedDays);
  const journeyProgress = Math.min(100, Math.round((profile.completedDays / JOURNEY_DAYS) * 100));
  const dayComplete = Boolean(progress?.completedAll);

  return (
    <main className="min-h-dvh bg-[#fff8e8] px-3 py-4 sm:px-4 sm:py-5">
      <section className="mx-auto max-w-md pb-8">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#6aaa64]">Bloom</p>
            <h1 className="mt-1 break-words text-3xl font-black leading-tight text-[#254033]">
              Oi, {profile.userName}!
            </h1>
          </div>
          <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-center shadow-[0_10px_24px_rgba(70,98,74,0.1)]">
            <p className="text-xs font-bold text-[#72806c]">Streak</p>
            <p className="text-xl font-black text-[#ef9f35]">{profile.streak}</p>
          </div>
        </header>

        <div className="space-y-4">
          <Plant evolutionActive={levelCelebration} level={profile.level} plantName={profile.plantName} />

          {levelCelebration ? <Confetti /> : null}

          {dayComplete ? (
            <section className="rounded-[26px] border-2 border-[#cbe8b9] bg-[#eef9e8] px-4 py-3 shadow-[0_12px_24px_rgba(70,98,74,0.1)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6aaa64] text-xl font-black text-white">
                  ✓
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-[#254033]">Dia completo</h2>
                  <p className="text-sm font-semibold text-[#5e7357]">
                    Sua planta recebeu todos os cuidados de hoje.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(70,98,74,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#72806c]">Level atual</p>
                <p className="text-2xl font-black text-[#254033]">{profile.level}</p>
              </div>
              <div className="rounded-2xl bg-[#eef9e8] px-3 py-2 text-right">
                <p className="text-xs font-bold text-[#5e7357]">XP</p>
                <p className="text-base font-black text-[#6aaa64]">{xpInLevel}/100</p>
              </div>
            </div>
            <div className="h-5 overflow-hidden rounded-full border border-[#dce8cf] bg-[#e8eddc] p-1">
              <div
                className="h-full min-w-2 rounded-full bg-[#6aaa64] transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#72806c]">
              <span>{xpProgress}% para o proximo level</span>
              <span>{100 - xpInLevel} XP faltando</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-[#fff2b8] p-4 shadow-[0_10px_22px_rgba(126,105,40,0.1)]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7a6418]">Semana</p>
              <p className="mt-1 text-3xl font-black text-[#254033]">{week}/7</p>
            </div>
            <div className="rounded-[24px] bg-[#dff2cf] p-4 shadow-[0_10px_22px_rgba(70,98,74,0.1)]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#4d705c]">Dias</p>
              <p className="mt-1 text-3xl font-black text-[#254033]">
                {profile.completedDays}/{JOURNEY_DAYS}
              </p>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(70,98,74,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#254033]">Jornada</h2>
              <span className="text-sm font-black text-[#6aaa64]">{journeyProgress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e8eddc]">
              <div
                className="h-full rounded-full bg-[#8cc8ff] transition-all duration-500"
                style={{ width: `${journeyProgress}%` }}
              />
            </div>
          </section>

          <TaskChecklist
            feedbackTaskId={taskFeedbackId}
            pendingTaskId={pendingTaskId}
            progress={progress}
            saving={saving}
            onCompleteTask={onCompleteTask}
          />

          {actionMessage ? (
            <p className="rounded-2xl bg-[#eef9e8] px-4 py-3 text-sm font-black text-[#4d705c] shadow-[0_10px_22px_rgba(70,98,74,0.08)]">
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
