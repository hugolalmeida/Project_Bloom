"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  DAILY_TASK_COINS,
  DAILY_TASK_IDS,
  DEFAULT_DAILY_TASK_LABELS,
  DEFAULT_GOALS,
  PROJECT_TASK_COINS,
  getDailyTasks,
  getGoals,
  getProjectTaskXp,
  getTodayKey,
  normalizeTaskProgress,
  type DailyTask,
} from "@/lib/game";
import type { DailyProgress, PersonalProject, TaskId, UserGoals, UserProfile } from "@/types/teancum";

type TaskChecklistProps = {
  feedbackTaskId: TaskId | null;
  pendingProjectTaskId: string | null;
  pendingTaskId: TaskId | null;
  profile: UserProfile;
  progress: DailyProgress | null;
  projectSaving: boolean;
  projects: PersonalProject[];
  saving: boolean;
  onCompleteProjectTask: (projectId: string, taskId: string) => Promise<void>;
  onCompleteTask: (taskId: TaskId) => Promise<void>;
  onUpdateDailyGoals: (goals: UserGoals) => Promise<void>;
};

export function TaskChecklist({
  feedbackTaskId,
  pendingProjectTaskId,
  pendingTaskId,
  profile,
  progress,
  projectSaving,
  projects,
  saving,
  onCompleteProjectTask,
  onCompleteTask,
  onUpdateDailyGoals,
}: TaskChecklistProps) {
  const todayKey = getTodayKey();
  const dailyTasks = getDailyTasks(profile);
  const goals = getGoals(profile);
  const taskProgress = progress ? normalizeTaskProgress(progress, profile) : null;
  const [taskEditor, setTaskEditor] = useState<{
    mode: "add" | "edit";
    taskId: TaskId;
    label: string;
  } | null>(null);
  const activeProjects = projects.filter((project) => !project.completed && !project.archived);
  const projectTasks = activeProjects.flatMap((project) =>
    project.tasks.map((task, taskIndex) => {
      const customTaskIndex =
        task.source === "custom"
          ? project.tasks
              .slice(0, taskIndex + 1)
              .filter((projectTask) => projectTask.source === "custom").length - 1
          : 0;

      return {
        project,
        task,
        doneToday: task.completed || task.lastCompletedDate === todayKey,
        xp: task.xpReward ?? getProjectTaskXp(task.source, customTaskIndex),
      };
    }),
  );

  const completedDailyCount = taskProgress
    ? dailyTasks.filter((task) => taskProgress[task.id] >= task.target).length
    : 0;
  const completedProjectTaskCount = projectTasks.filter((item) => item.doneToday).length;
  const totalTaskCount = dailyTasks.length + projectTasks.length;
  const completedTaskCount = completedDailyCount + completedProjectTaskCount;
  const dayComplete = Boolean(progress?.completedAll);
  const activeDailyTaskIds = new Set(dailyTasks.map((task) => task.id));
  const canAddDailyTask = dailyTasks.length < DAILY_TASK_IDS.length;
  const canRemoveDailyTask = dailyTasks.length > 1;

  function getEditableGoals(): UserGoals {
    return {
      ...DEFAULT_GOALS,
      ...goals,
      disabledTaskIds: [...(goals.disabledTaskIds ?? [])],
      taskLabels: { ...(goals.taskLabels ?? {}) },
    };
  }

  function getNextTaskIdForAdd() {
    return (
      DAILY_TASK_IDS.find((taskId) => taskId === "custom" && !activeDailyTaskIds.has(taskId)) ??
      DAILY_TASK_IDS.find((taskId) => !activeDailyTaskIds.has(taskId)) ??
      null
    );
  }

  function openAddTaskEditor() {
    const taskId = getNextTaskIdForAdd();
    if (!taskId) return;

    setTaskEditor({
      mode: "add",
      taskId,
      label: taskId === "custom" ? "" : DEFAULT_DAILY_TASK_LABELS[taskId],
    });
  }

  function openEditTaskEditor(task: DailyTask) {
    setTaskEditor({ mode: "edit", taskId: task.id, label: task.label });
  }

  async function saveTaskEditor() {
    if (!taskEditor) return;

    const trimmedLabel = taskEditor.label.trim();
    if (trimmedLabel.length < 3) return;

    const nextGoals = getEditableGoals();
    nextGoals.taskLabels = {
      ...(nextGoals.taskLabels ?? {}),
      [taskEditor.taskId]: trimmedLabel,
    };
    nextGoals.disabledTaskIds = (nextGoals.disabledTaskIds ?? []).filter(
      (taskId) => taskId !== taskEditor.taskId,
    );

    if (taskEditor.taskId === "custom") {
      nextGoals.customTaskLabel = trimmedLabel;
    }

    await onUpdateDailyGoals(nextGoals);
    setTaskEditor(null);
  }

  async function removeDailyTask(taskId: TaskId) {
    if (!canRemoveDailyTask) return;

    const nextGoals = getEditableGoals();
    const nextTaskLabels = { ...(nextGoals.taskLabels ?? {}) };

    if (taskId === "custom") {
      delete nextTaskLabels.custom;
      delete nextGoals.customTaskLabel;
    }

    nextGoals.taskLabels = nextTaskLabels;
    nextGoals.disabledTaskIds = Array.from(new Set([...(nextGoals.disabledTaskIds ?? []), taskId]));

    await onUpdateDailyGoals(nextGoals);
  }

  if (!taskProgress) {
    return (
      <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
        <div className="mb-4 h-5 w-36 animate-pulse rounded-full bg-[#e8eddc]" />
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div className="h-16 animate-pulse rounded-2xl bg-[#f8fbff]" key={task.id} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#102b55]">Afazeres de hoje</h2>
          <p className="text-xs font-bold text-[#8ba0c4]">
            {completedTaskCount}/{totalTaskCount} missões completas
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            dayComplete ? "bg-[#eaf1ff] text-[#1f5fbf]" : "bg-[#fff2b8] text-[#7a6418]"
          }`}
        >
          {dayComplete ? "Dia completo" : "+20 bônus"}
        </span>
      </div>

      {taskEditor ? (
        <div className="mb-3 rounded-2xl border-2 border-[#dce7fb] bg-[#f8fbff] p-3">
          <p className="mb-2 text-sm font-black text-[#102b55]">
            {taskEditor.mode === "add" ? "Nova missão" : "Editar missão"}
          </p>
          <input
            className="h-11 w-full rounded-2xl border-2 border-[#dbe6fb] bg-white px-3 text-sm font-bold text-[#102b55] outline-none transition focus:border-[#1f5fbf]"
            maxLength={38}
            placeholder="Nome da missão"
            value={taskEditor.label}
            onChange={(event) =>
              setTaskEditor((currentEditor) =>
                currentEditor ? { ...currentEditor, label: event.target.value } : currentEditor,
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void saveTaskEditor();
              }
            }}
          />
          {taskEditor.label.trim().length > 0 && taskEditor.label.trim().length < 3 ? (
            <p className="mt-2 text-xs font-bold text-[#a04444]">Use pelo menos 3 caracteres.</p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="h-11 rounded-2xl bg-[#e8f0ff] text-sm font-black text-[#1f5fbf] transition active:scale-95"
              onClick={() => setTaskEditor(null)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="h-11 rounded-2xl bg-[#1f5fbf] text-sm font-black text-white shadow-[0_4px_0_#123f86] transition active:translate-y-1 active:shadow-[0_1px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-55"
              disabled={saving || taskEditor.label.trim().length < 3}
              onClick={saveTaskEditor}
              type="button"
            >
              Salvar
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {dailyTasks.map((task) => {
          const current = taskProgress[task.id];
          const completed = current >= task.target;
          const pending = pendingTaskId === task.id;
          const justCompleted = feedbackTaskId === task.id;

          return (
            <SwipeableDailyTask
              canRemove={canRemoveDailyTask}
              completed={completed}
              current={current}
              justCompleted={justCompleted}
              key={task.id}
              pending={pending}
              saving={saving}
              task={task}
              onComplete={() => onCompleteTask(task.id)}
              onEdit={() => openEditTaskEditor(task)}
              onRemove={() => removeDailyTask(task.id)}
            />
          );
        })}

        {canAddDailyTask ? (
          <button
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#b8cff8] bg-[#f8fbff] px-4 text-sm font-black text-[#1f5fbf] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={saving}
            onClick={openAddTaskEditor}
            type="button"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f0ff] text-lg leading-none">
              +
            </span>
            Adicionar missão
          </button>
        ) : null}

        {projectTasks.map(({ project, task, doneToday, xp }) => {
          const pending = pendingProjectTaskId === `${project.id}:${task.id}`;

          return (
            <button
              className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
                doneToday
                  ? "border-[#8fb5ff] bg-[#eaf1ff]"
                  : "border-[#dce7fb] bg-[#f8fbff] active:scale-[0.99]"
              } disabled:cursor-not-allowed disabled:opacity-80`}
              disabled={projectSaving || doneToday}
              key={`${project.id}-${task.id}`}
              onClick={() => onCompleteProjectTask(project.id, task.id)}
              type="button"
            >
              {pending ? <span className="animate-progress-shimmer absolute inset-0 bg-white/35" /> : null}
              <TaskIcon done={doneToday} pending={pending} />
              <span className="relative min-w-0 flex-1">
                <span className="block text-sm font-black text-[#1f5fbf]">{project.title}</span>
                <span className="block text-base font-black text-[#102b55]">{task.label}</span>
                <span className="block text-sm font-semibold text-[#66799e]">
                  {doneToday ? "Concluída hoje" : "Tarefa de projeto"}
                </span>
              </span>
              <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                {doneToday ? "Hoje" : `+${xp} XP · 🪙 ${PROJECT_TASK_COINS}`}
              </span>
            </button>
          );
        })}

        {totalTaskCount === 0 ? (
          <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-bold text-[#4b638f]">
            Suas missões aparecem aqui assim que a jornada carregar.
          </p>
        ) : null}
      </div>
    </section>
  );
}

type SwipeableDailyTaskProps = {
  canRemove: boolean;
  completed: boolean;
  current: number;
  justCompleted: boolean;
  pending: boolean;
  saving: boolean;
  task: DailyTask;
  onComplete: () => Promise<void>;
  onEdit: () => void;
  onRemove: () => Promise<void>;
};

function SwipeableDailyTask({
  canRemove,
  completed,
  current,
  justCompleted,
  pending,
  saving,
  task,
  onComplete,
  onEdit,
  onRemove,
}: SwipeableDailyTaskProps) {
  const [offset, setOffset] = useState(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const maxOffset = 104;
  const revealOffset = 88;

  function closeActions() {
    setOffset(0);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    startXRef.current = event.clientX;
    draggingRef.current = true;
    draggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!draggingRef.current) return;

    const nextOffset = Math.max(-maxOffset, Math.min(maxOffset, event.clientX - startXRef.current));
    if (Math.abs(nextOffset) > 6) {
      draggedRef.current = true;
    }
    setOffset(nextOffset);
  }

  function handlePointerEnd() {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setOffset((currentOffset) => {
      if (currentOffset > 48) return revealOffset;
      if (currentOffset < -48) return -revealOffset;
      return 0;
    });

    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  }

  async function handleComplete() {
    if (draggedRef.current || saving || completed) return;
    await onComplete();
  }

  function handleEdit() {
    closeActions();
    onEdit();
  }

  async function handleRemove() {
    if (!canRemove || saving) return;
    closeActions();
    await onRemove();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl touch-pan-y">
      <div className="absolute inset-0 flex items-stretch justify-between bg-[#e8f0ff]">
        <button
          aria-label={`Editar ${task.label}`}
          className="w-24 bg-[#dff2cf] text-xs font-black text-[#2f6a3d] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saving}
          onClick={handleEdit}
          type="button"
        >
          Editar
        </button>
        <button
          aria-label={`Remover ${task.label}`}
          className="w-24 bg-[#fff0f0] text-xs font-black text-[#a04444] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saving || !canRemove}
          onClick={handleRemove}
          type="button"
        >
          Remover
        </button>
      </div>
      <button
        aria-disabled={saving || completed}
        className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
          completed
            ? "border-[#8fb5ff] bg-[#eaf1ff]"
            : "border-[#dce7fb] bg-[#f8fbff] active:scale-[0.99]"
        } ${justCompleted ? "animate-task-complete" : ""} ${
          saving || completed ? "cursor-not-allowed opacity-80" : ""
        }`}
        onClick={handleComplete}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        style={{ transform: `translateX(${offset}px)` }}
        type="button"
      >
        {pending ? <span className="animate-progress-shimmer absolute inset-0 bg-white/35" /> : null}
        <TaskIcon done={completed} pending={pending} />
        <span className="relative min-w-0 flex-1">
          <span className="block text-sm font-black text-[#1f5fbf]">Diária</span>
          <span className="block text-base font-black text-[#102b55]">{task.label}</span>
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
            +{task.xpPerStep} XP · 🪙 {DAILY_TASK_COINS}
          </span>
        ) : (
          <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
            {completed ? "Feita" : `+${task.xpPerStep} XP · 🪙 ${DAILY_TASK_COINS}`}
          </span>
        )}
      </button>
    </div>
  );
}

type TaskIconProps = {
  done: boolean;
  pending: boolean;
};

function TaskIcon({ done, pending }: TaskIconProps) {
  return (
    <span
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
        done ? "bg-[#1f5fbf] text-white" : "bg-[#e8f0ff] text-[#1f5fbf]"
      }`}
    >
      {pending ? "..." : done ? "✓" : "+"}
    </span>
  );
}
