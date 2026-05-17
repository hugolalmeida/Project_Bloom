"use client";

import { useMemo, useState } from "react";
import {
  LONG_PROJECT_MIN_DAYS,
  MAX_PROJECT_DAYS,
  PROJECT_AREA_LABELS,
  PROJECT_DURATION_LABELS,
  PROJECT_TASK_LIBRARY,
  PROJECT_TASK_COINS,
  CUSTOM_PROJECT_TASK_XP,
  EXTRA_CUSTOM_PROJECT_TASK_XP,
  MAX_ACTIVE_PROJECTS,
  MAX_PROJECT_TASKS,
  MIN_PROJECT_DAYS,
  PRESET_PROJECT_TASK_XP,
  clampProjectDays,
  getProjectCoinReward,
  getProjectDurationFromDays,
  getProjectRewardFromDays,
  getProjectTaskXp,
  getTodayKey,
} from "@/lib/game";
import type {
  CreateProjectData,
  PersonalProject,
  ProjectArea,
  ProjectTaskSource,
} from "@/types/teancum";

type ProjectsPanelProps = {
  pendingProjectTaskId: string | null;
  projectSaving: boolean;
  projects: PersonalProject[];
  onAddProjectTask: (projectId: string, label: string) => Promise<void>;
  onCompleteProjectTask: (projectId: string, taskId: string) => Promise<void>;
  onCreateProject: (data: CreateProjectData) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onRemoveProjectTask: (projectId: string, taskId: string) => Promise<void>;
};

const projectAreas = Object.keys(PROJECT_AREA_LABELS) as ProjectArea[];

type SelectedProjectTask = {
  label: string;
  source: ProjectTaskSource;
};

export function ProjectsPanel({
  pendingProjectTaskId,
  projectSaving,
  projects,
  onAddProjectTask,
  onCompleteProjectTask,
  onCreateProject,
  onDeleteProject,
  onRemoveProjectTask,
}: ProjectsPanelProps) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<ProjectArea>("spiritual");
  const [targetDays, setTargetDays] = useState(MIN_PROJECT_DAYS);
  const [selectedTasks, setSelectedTasks] = useState<SelectedProjectTask[]>([]);
  const [customTaskLabel, setCustomTaskLabel] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const suggestedTasks = PROJECT_TASK_LIBRARY[area];
  const duration = getProjectDurationFromDays(targetDays);
  const reward = getProjectRewardFromDays(targetDays);
  const coinReward = getProjectCoinReward(duration);
  const activeProjects = projects.filter((project) => !project.completed && !project.archived);
  const completedProjects = projects.filter((project) => project.completed && !project.archived);
  const reachedActiveLimit = activeProjects.length >= MAX_ACTIVE_PROJECTS;
  const customTaskCount = selectedTasks.filter((task) => task.source === "custom").length;
  const customTaskLimitReached = selectedTasks.length >= MAX_PROJECT_TASKS;
  const nextCustomTaskXp = getProjectTaskXp("custom", customTaskCount);

  const canCreate = selectedTasks.length > 0 && !projectSaving && !reachedActiveLimit;
  const customTaskText = customTaskLabel.trim();
  const canAddCustomTask =
    customTaskText.length >= 3 &&
    !customTaskLimitReached &&
    !hasSelectedTask(customTaskText);

  const defaultTitle = useMemo(() => {
    return `Projeto ${PROJECT_AREA_LABELS[area].toLowerCase()}`;
  }, [area]);

  function hasSelectedTask(label: string) {
    const normalizedLabel = label.trim().toLowerCase();
    return selectedTasks.some((task) => task.label.trim().toLowerCase() === normalizedLabel);
  }

  function togglePresetTask(label: string) {
    setSelectedTasks((currentTasks) => {
      if (currentTasks.some((task) => task.label === label)) {
        return currentTasks.filter((task) => task.label !== label);
      }

      if (currentTasks.length >= MAX_PROJECT_TASKS) {
        return currentTasks;
      }

      return [...currentTasks, { label, source: "preset" }];
    });
  }

  function addCustomTask() {
    const label = customTaskLabel.trim();
    if (!label || selectedTasks.length >= MAX_PROJECT_TASKS || hasSelectedTask(label)) return;

    setSelectedTasks((currentTasks) => [...currentTasks, { label, source: "custom" }]);
    setCustomTaskLabel("");
  }

  function removeTask(label: string) {
    setSelectedTasks((currentTasks) => currentTasks.filter((task) => task.label !== label));
  }

  function getSelectedTaskXp(task: SelectedProjectTask, taskIndex: number) {
    const customTaskIndex =
      task.source === "custom"
        ? selectedTasks.slice(0, taskIndex + 1).filter((item) => item.source === "custom").length -
          1
        : 0;

    return getProjectTaskXp(task.source, customTaskIndex);
  }

  async function handleCreateProject() {
    if (!canCreate) return;

    await onCreateProject({
      title: title.trim() || defaultTitle,
      area,
      targetDays: clampProjectDays(targetDays),
      tasks: selectedTasks,
    });

    setTitle("");
    setSelectedTasks([]);
    setCustomTaskLabel("");
    setShowCreateForm(false);
  }

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
            Projetos
          </p>
          <h2 className="text-lg font-black text-[#102b55]">Projetos pessoais</h2>
          <p className="mt-1 text-xs font-bold text-[#66799e]">
            {activeProjects.length}/{MAX_ACTIVE_PROJECTS} projetos ativos
          </p>
        </div>
        <button
          className="h-11 shrink-0 rounded-2xl bg-[#1f5fbf] px-4 text-xs font-black text-white shadow-[0_4px_0_#123f86] transition active:translate-y-1 active:shadow-[0_2px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={reachedActiveLimit && !showCreateForm}
          onClick={() => setShowCreateForm((currentValue) => !currentValue)}
          type="button"
        >
          {showCreateForm ? "Fechar" : "Novo projeto"}
        </button>
      </div>

      <div className="mb-4 space-y-3">
        {activeProjects.length === 0 && completedProjects.length === 0 ? (
          <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-bold text-[#4b638f]">
            Crie seu primeiro projeto para ganhar XP extra fora das metas diárias.
          </p>
        ) : null}

        {activeProjects.map((project) => (
          <ProjectCard
            key={project.id}
            pendingProjectTaskId={pendingProjectTaskId}
            project={project}
            projectSaving={projectSaving}
            onAddProjectTask={onAddProjectTask}
            onCompleteProjectTask={onCompleteProjectTask}
            onDeleteProject={onDeleteProject}
            onRemoveProjectTask={onRemoveProjectTask}
          />
        ))}

        {completedProjects.slice(0, 2).map((project) => (
          <ProjectCard
            key={project.id}
            pendingProjectTaskId={pendingProjectTaskId}
            project={project}
            projectSaving={projectSaving}
            onAddProjectTask={onAddProjectTask}
            onCompleteProjectTask={onCompleteProjectTask}
            onDeleteProject={onDeleteProject}
            onRemoveProjectTask={onRemoveProjectTask}
          />
        ))}
      </div>

      {showCreateForm ? (
      <div className="rounded-[24px] border border-[#d7e3fb] bg-[#f8fbff] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#102b55]">Novo projeto</h3>
            <p className="text-xs font-bold text-[#66799e]">Escolha área, dias e tarefas.</p>
          </div>
          <span className="rounded-full bg-[#fff2b8] px-3 py-1 text-xs font-black text-[#7a6418]">
            Bônus +{reward} XP · 🪙 {coinReward}
          </span>
        </div>
        {reachedActiveLimit ? (
          <p className="mb-3 rounded-2xl bg-[#fff2b8] px-3 py-2 text-xs font-black text-[#7a6418]">
            Limite atingido. Conclua um projeto ativo antes de criar outro.
          </p>
        ) : null}

        <input
          className="mb-3 h-12 w-full rounded-2xl border-2 border-[#dbe6fb] bg-white px-4 text-sm font-bold text-[#102b55] outline-none transition focus:border-[#1f5fbf]"
          maxLength={36}
          placeholder={defaultTitle}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 text-xs font-black text-[#66799e]">Área</p>
            <select
              className="h-11 w-full rounded-2xl border-2 border-[#dbe6fb] bg-white px-3 text-sm font-black text-[#102b55] outline-none"
              value={area}
              onChange={(event) => {
                setArea(event.target.value as ProjectArea);
                setSelectedTasks([]);
                setCustomTaskLabel("");
              }}
            >
              {projectAreas.map((projectArea) => (
                <option key={projectArea} value={projectArea}>
                  {PROJECT_AREA_LABELS[projectArea]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs font-black text-[#66799e]">Dias</p>
            <input
              className="h-11 w-full rounded-2xl border-2 border-[#dbe6fb] bg-white px-3 text-sm font-black text-[#102b55] outline-none"
              max={MAX_PROJECT_DAYS}
              min={MIN_PROJECT_DAYS}
              type="number"
              value={targetDays}
              onBlur={() => setTargetDays((days) => clampProjectDays(days))}
              onChange={(event) => setTargetDays(Number(event.target.value))}
            />
          </div>
        </div>

        <p className="mb-3 rounded-2xl bg-[#eaf1ff] px-3 py-2 text-xs font-black text-[#1f5fbf]">
          {clampProjectDays(targetDays)} dias · {PROJECT_DURATION_LABELS[duration]} (
          {LONG_PROJECT_MIN_DAYS}+ dias vira longo)
        </p>

        <p className="mb-2 text-xs font-black text-[#66799e]">
          Escolha 1 a {MAX_PROJECT_TASKS} tarefas ({selectedTasks.length}/{MAX_PROJECT_TASKS})
        </p>
        <div className="mb-3 space-y-2">
          {suggestedTasks.map((task) => {
            const selected = selectedTasks.some((selectedTask) => selectedTask.label === task);

            return (
              <button
                className={`flex min-h-11 w-full items-center gap-2 rounded-2xl border-2 px-3 text-left text-sm font-black transition ${
                  selected
                    ? "border-[#1f5fbf] bg-[#eaf1ff] text-[#102b55]"
                    : "border-[#dbe6fb] bg-white text-[#4b638f]"
                }`}
                key={task}
                onClick={() => togglePresetTask(task)}
                type="button"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    selected ? "bg-[#1f5fbf] text-white" : "bg-[#eaf1ff] text-[#1f5fbf]"
                  }`}
                >
                  {selected ? "✓" : "+"}
                </span>
                <span className="min-w-0 flex-1">{task}</span>
                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#1f5fbf]">
                  +{PRESET_PROJECT_TASK_XP} XP
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-3 rounded-2xl border-2 border-dashed border-[#b8cff8] bg-white p-3">
          <p className="mb-2 text-xs font-black text-[#66799e]">
            Tarefa própria: 3 primeiras +{CUSTOM_PROJECT_TASK_XP} XP, 4ª +
            {EXTRA_CUSTOM_PROJECT_TASK_XP} XP
          </p>
          <div className="mb-2 grid grid-cols-2 gap-2 text-[11px] font-black">
            <span className="rounded-2xl bg-[#eaf1ff] px-3 py-2 text-[#1f5fbf]">
              Próprias {customTaskCount}/{MAX_PROJECT_TASKS}
            </span>
            <span
              className={`rounded-2xl px-3 py-2 ${
                nextCustomTaskXp === EXTRA_CUSTOM_PROJECT_TASK_XP
                  ? "bg-[#fff2b8] text-[#7a6418]"
                  : "bg-[#eaf1ff] text-[#1f5fbf]"
              }`}
            >
              Próxima +{nextCustomTaskXp} XP
            </span>
          </div>
          <div className="flex gap-2">
            <input
              className="h-11 min-w-0 flex-1 rounded-2xl border-2 border-[#dbe6fb] bg-white px-3 text-sm font-bold text-[#102b55] outline-none transition focus:border-[#1f5fbf]"
              maxLength={38}
              placeholder="Ex: visitar alguém"
              value={customTaskLabel}
              onChange={(event) => setCustomTaskLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomTask();
                }
              }}
            />
            <button
              className="h-11 shrink-0 rounded-2xl bg-[#102b55] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canAddCustomTask}
              onClick={addCustomTask}
              type="button"
            >
              +
            </button>
          </div>
          {customTaskCount >= 3 && !customTaskLimitReached ? (
            <p className="mt-2 rounded-2xl bg-[#fff8d7] px-3 py-2 text-[11px] font-black text-[#7a6418]">
              A 4ª tarefa própria entra como extra e vale menos XP.
            </p>
          ) : null}
          {customTaskLimitReached ? (
            <p className="mt-2 rounded-2xl bg-[#eaf1ff] px-3 py-2 text-[11px] font-black text-[#1f5fbf]">
              Limite de {MAX_PROJECT_TASKS} tarefas atingido para este projeto.
            </p>
          ) : null}
        </div>

        {selectedTasks.length > 0 ? (
          <div className="mb-3 space-y-2">
            <p className="text-xs font-black text-[#66799e]">Selecionadas</p>
            {selectedTasks.map((task, taskIndex) => {
              const selectedTaskXp = getSelectedTaskXp(task, taskIndex);
              const isReducedCustomTask =
                task.source === "custom" && selectedTaskXp === EXTRA_CUSTOM_PROJECT_TASK_XP;

              return (
                <div
                  className="flex min-h-10 items-center gap-2 rounded-2xl bg-[#eaf1ff] px-3 text-sm font-black text-[#102b55]"
                  key={`${task.source}-${task.label}`}
                >
                  <span className="min-w-0 flex-1">{task.label}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      isReducedCustomTask
                        ? "bg-[#fff2b8] text-[#7a6418]"
                        : "bg-white text-[#1f5fbf]"
                    }`}
                  >
                    {isReducedCustomTask ? "Extra " : ""}+{selectedTaskXp} XP
                  </span>
                  <button
                    aria-label={`Remover ${task.label}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#1f5fbf]"
                    onClick={() => removeTask(task.label)}
                    type="button"
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}

        <button
          className="h-12 w-full rounded-2xl bg-[#1f5fbf] text-sm font-black text-white shadow-[0_5px_0_#123f86] transition active:translate-y-1 active:shadow-[0_2px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!canCreate}
          onClick={handleCreateProject}
          type="button"
        >
          {projectSaving ? "Salvando..." : "Criar projeto"}
        </button>
      </div>
      ) : null}

      {false ? (
      <div className="mt-4 space-y-3">
        {activeProjects.length === 0 && completedProjects.length === 0 ? (
          <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-bold text-[#4b638f]">
            Crie seu primeiro projeto para ganhar XP extra fora das metas diárias.
          </p>
        ) : null}

        {activeProjects.map((project) => (
          <ProjectCard
            key={project.id}
            pendingProjectTaskId={pendingProjectTaskId}
            project={project}
            projectSaving={projectSaving}
            onAddProjectTask={onAddProjectTask}
            onCompleteProjectTask={onCompleteProjectTask}
            onDeleteProject={onDeleteProject}
            onRemoveProjectTask={onRemoveProjectTask}
          />
        ))}

        {completedProjects.slice(0, 2).map((project) => (
          <ProjectCard
            key={project.id}
            pendingProjectTaskId={pendingProjectTaskId}
            project={project}
            projectSaving={projectSaving}
            onAddProjectTask={onAddProjectTask}
            onCompleteProjectTask={onCompleteProjectTask}
            onDeleteProject={onDeleteProject}
            onRemoveProjectTask={onRemoveProjectTask}
          />
        ))}
      </div>
      ) : null}
    </section>
  );
}

type ProjectCardProps = {
  pendingProjectTaskId: string | null;
  project: PersonalProject;
  projectSaving: boolean;
  onAddProjectTask: (projectId: string, label: string) => Promise<void>;
  onCompleteProjectTask: (projectId: string, taskId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onRemoveProjectTask: (projectId: string, taskId: string) => Promise<void>;
};

function ProjectCard({
  pendingProjectTaskId,
  project,
  projectSaving,
  onAddProjectTask,
  onCompleteProjectTask,
  onDeleteProject,
  onRemoveProjectTask,
}: ProjectCardProps) {
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const todayKey = getTodayKey();
  const targetDays = Math.max(1, project.targetDays ?? 1);
  const completedDays = Math.min(project.completedDays ?? 0, targetDays);
  const dayProgress = Math.round((completedDays / targetDays) * 100);
  const completedTasksToday = project.tasks.filter(
    (task) => task.completed || task.lastCompletedDate === todayKey,
  ).length;
  const projectCoinReward = getProjectCoinReward(project.duration);
  const newTaskText = newTaskLabel.trim();
  const pendingAdd = pendingProjectTaskId === `${project.id}:new`;
  const duplicateNewTask = project.tasks.some(
    (task) => task.label.trim().toLowerCase() === newTaskText.toLowerCase(),
  );
  const canAddTask =
    !projectSaving &&
    !project.completed &&
    project.tasks.length < MAX_PROJECT_TASKS &&
    newTaskText.length >= 3 &&
    !duplicateNewTask;

  async function handleAddTask() {
    if (!canAddTask) return;
    await onAddProjectTask(project.id, newTaskText);
    setNewTaskLabel("");
  }

  return (
    <div
      className={`rounded-[24px] border p-3 ${
        project.completed ? "border-[#b8cff8] bg-[#eaf1ff]" : "border-[#d7e3fb] bg-white"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#1f5fbf]">
            {PROJECT_AREA_LABELS[project.area]} · {PROJECT_DURATION_LABELS[project.duration]}
            {project.targetDays ? ` · ${project.targetDays} dias` : ""}
          </p>
          <h3 className="break-words text-base font-black text-[#102b55]">{project.title}</h3>
          <p className="mt-1 text-xs font-bold text-[#66799e]">
            Dia {completedDays}/{targetDays} · Hoje {completedTasksToday}/{project.tasks.length}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-full bg-[#fff2b8] px-3 py-1 text-xs font-black text-[#7a6418]">
          Bônus +{project.xpReward} XP · 🪙 {projectCoinReward}
          </span>
          <button
            className="rounded-full border border-[#ffd0d0] bg-[#fff6f6] px-3 py-1 text-[11px] font-black text-[#a04444] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={projectSaving}
            onClick={() => {
              const actionLabel = project.completed ? "Arquivar" : "Remover";
              if (window.confirm(`${actionLabel} o projeto "${project.title}"?`)) {
                void onDeleteProject(project.id);
              }
            }}
            type="button"
          >
            {project.completed ? "Arquivar" : "Remover"}
          </button>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#edf3ff]">
        <div
          className="h-full rounded-full bg-[#1f5fbf] transition-all"
          style={{ width: `${dayProgress}%` }}
        />
      </div>

      <div className="space-y-2">
        {project.tasks.map((task) => {
          const taskIndex = project.tasks.findIndex((projectTask) => projectTask.id === task.id);
          const customTaskIndex =
            task.source === "custom"
              ? project.tasks
                  .slice(0, taskIndex + 1)
                  .filter((projectTask) => projectTask.source === "custom").length - 1
              : 0;
          const pending = pendingProjectTaskId === `${project.id}:${task.id}`;
          const taskXp = task.xpReward ?? getProjectTaskXp(task.source, customTaskIndex);
          const doneToday = task.completed || task.lastCompletedDate === todayKey;

          return (
            <button
              className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold transition ${
                doneToday ? "bg-[#dce8ff] text-[#102b55]" : "bg-[#f8fbff] text-[#4b638f]"
              } disabled:cursor-not-allowed disabled:opacity-70`}
              disabled={projectSaving || project.completed || doneToday}
              key={task.id}
              onClick={() => onCompleteProjectTask(project.id, task.id)}
              type="button"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  doneToday ? "bg-[#1f5fbf] text-white" : "bg-[#eaf1ff] text-[#1f5fbf]"
                }`}
              >
                {pending ? "..." : doneToday ? "✓" : "+"}
              </span>
              <span className="min-w-0 flex-1">{task.label}</span>
              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#1f5fbf]">
                {doneToday ? "Hoje" : `+${taskXp} XP · 🪙 ${PROJECT_TASK_COINS}`}
              </span>
            </button>
          );
        })}
      </div>

      {!project.completed ? (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-[#b8cff8] bg-[#f8fbff] p-3">
          <p className="mb-2 text-xs font-black text-[#66799e]">
            Editar atividades ({project.tasks.length}/{MAX_PROJECT_TASKS})
          </p>
          <div className="mb-3 space-y-2">
            {project.tasks.map((task) => (
              <div
                className="flex min-h-9 items-center gap-2 rounded-2xl bg-white px-3 text-xs font-black text-[#102b55]"
                key={`edit-${task.id}`}
              >
                <span className="min-w-0 flex-1">{task.label}</span>
                <button
                  aria-label={`Remover ${task.label}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff6f6] text-[#a04444] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={projectSaving || project.tasks.length <= 1}
                  onClick={() => onRemoveProjectTask(project.id, task.id)}
                  type="button"
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="h-10 min-w-0 flex-1 rounded-2xl border-2 border-[#dbe6fb] bg-white px-3 text-sm font-bold text-[#102b55] outline-none transition focus:border-[#1f5fbf]"
              disabled={project.tasks.length >= MAX_PROJECT_TASKS}
              maxLength={38}
              placeholder="Nova atividade"
              value={newTaskLabel}
              onChange={(event) => setNewTaskLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddTask();
                }
              }}
            />
            <button
              className="h-10 shrink-0 rounded-2xl bg-[#102b55] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canAddTask}
              onClick={handleAddTask}
              type="button"
            >
              {pendingAdd ? "..." : "+"}
            </button>
          </div>
        </div>
      ) : null}

      {project.completed ? (
        <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-black text-[#1f5fbf]">
          Projeto concluído
        </p>
      ) : null}
    </div>
  );
}
