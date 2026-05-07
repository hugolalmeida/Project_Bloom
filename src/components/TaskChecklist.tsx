import { DAILY_TASKS } from "@/lib/game";
import type { DailyProgress, TaskId } from "@/types/bloom";

type TaskChecklistProps = {
  feedbackTaskId: TaskId | null;
  pendingTaskId: TaskId | null;
  progress: DailyProgress | null;
  saving: boolean;
  onCompleteTask: (taskId: TaskId) => Promise<void>;
};

export function TaskChecklist({
  feedbackTaskId,
  pendingTaskId,
  progress,
  saving,
  onCompleteTask,
}: TaskChecklistProps) {
  if (!progress) {
    return (
      <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(70,98,74,0.12)]">
        <div className="mb-4 h-5 w-36 animate-pulse rounded-full bg-[#e8eddc]" />
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div className="h-16 animate-pulse rounded-2xl bg-[#fbfff5]" key={item} />
          ))}
        </div>
      </section>
    );
  }

  const completedCount = DAILY_TASKS.filter((task) => progress.tasks[task.id]).length;
  const dayComplete = progress.completedAll;

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(70,98,74,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#254033]">Tarefas de hoje</h2>
          <p className="text-xs font-bold text-[#72806c]">{completedCount}/3 cuidados feitos</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            dayComplete ? "bg-[#eef9e8] text-[#4d705c]" : "bg-[#fff2b8] text-[#7a6418]"
          }`}
        >
          {dayComplete ? "Completo" : "+20 bonus"}
        </span>
      </div>

      <div className="space-y-3">
        {DAILY_TASKS.map((task) => {
          const completed = Boolean(progress.tasks[task.id]);
          const pending = pendingTaskId === task.id;
          const justCompleted = feedbackTaskId === task.id;

          return (
            <button
              className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
                completed
                  ? "border-[#cfe8c5] bg-[#eef9e8]"
                  : "border-[#edf1dc] bg-[#fbfff5] active:scale-[0.99]"
              } ${justCompleted ? "animate-task-complete" : ""} disabled:cursor-not-allowed disabled:opacity-80`}
              disabled={saving || completed}
              key={task.id}
              onClick={() => onCompleteTask(task.id)}
              type="button"
            >
              {pending ? <span className="absolute inset-0 animate-progress-shimmer bg-white/35" /> : null}
              <span
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                  completed ? "bg-[#6aaa64] text-white" : "bg-[#e8f6d8] text-[#6aaa64]"
                }`}
              >
                {pending ? "..." : completed ? "✓" : "+"}
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-base font-black text-[#254033]">{task.label}</span>
                <span className="block text-sm font-semibold text-[#72806c]">
                  {pending ? "Salvando..." : completed ? "Feito por hoje" : task.helper}
                </span>
              </span>
              {justCompleted ? (
                <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#6aaa64]">
                  +XP
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
