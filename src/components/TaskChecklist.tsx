import { getDailyTasks } from "@/lib/game";
import type { DailyProgress, TaskId, UserProfile } from "@/types/teancum";

type TaskChecklistProps = {
  feedbackTaskId: TaskId | null;
  pendingTaskId: TaskId | null;
  profile: UserProfile;
  progress: DailyProgress | null;
  saving: boolean;
  onCompleteTask: (taskId: TaskId) => Promise<void>;
};

export function TaskChecklist({
  feedbackTaskId,
  pendingTaskId,
  profile,
  progress,
  saving,
  onCompleteTask,
}: TaskChecklistProps) {
  const dailyTasks = getDailyTasks(profile);

  if (!progress) {
    return (
      <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(70,98,74,0.12)]">
        <div className="mb-4 h-5 w-36 animate-pulse rounded-full bg-[#e8eddc]" />
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div className="h-16 animate-pulse rounded-2xl bg-[#f8fbff]" key={task.id} />
          ))}
        </div>
      </section>
    );
  }

  const completedCount = dailyTasks.filter(
    (task) => progress.taskProgress[task.id] >= task.target,
  ).length;
  const dayComplete = progress.completedAll;

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#102b55]">Metas de hoje</h2>
          <p className="text-xs font-bold text-[#8ba0c4]">
            {completedCount}/{dailyTasks.length} metas completas
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            dayComplete ? "bg-[#eaf1ff] text-[#1f5fbf]" : "bg-[#fff2b8] text-[#7a6418]"
          }`}
        >
          {dayComplete ? "Completo" : "+20 bonus"}
        </span>
      </div>

      <div className="space-y-3">
        {dailyTasks.map((task) => {
          const current = progress.taskProgress[task.id];
          const completed = current >= task.target;
          const pending = pendingTaskId === task.id;
          const justCompleted = feedbackTaskId === task.id;

          return (
            <button
              className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
                completed
                  ? "border-[#8fb5ff] bg-[#eaf1ff]"
                  : "border-[#dce7fb] bg-[#f8fbff] active:scale-[0.99]"
              } ${justCompleted ? "animate-task-complete" : ""} disabled:cursor-not-allowed disabled:opacity-80`}
              disabled={saving || completed}
              key={task.id}
              onClick={() => onCompleteTask(task.id)}
              type="button"
            >
              {pending ? <span className="absolute inset-0 animate-progress-shimmer bg-white/35" /> : null}
              <span
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                  completed ? "bg-[#1f5fbf] text-white" : "bg-[#e8f0ff] text-[#1f5fbf]"
                }`}
              >
                {pending ? "..." : completed ? "✓" : "+"}
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-base font-black text-[#254033]">{task.label}</span>
                <span className="block text-sm font-semibold text-[#66799e]">
                  {pending
                    ? "Salvando..."
                    : completed
                      ? "Meta feita por hoje"
                      : `${current}/${task.target} ${task.unit} · +${task.xpPerStep} XP`}
                </span>
              </span>
              {justCompleted ? (
                <span className="relative animate-xp-float rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                  +{task.xpPerStep} XP
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
