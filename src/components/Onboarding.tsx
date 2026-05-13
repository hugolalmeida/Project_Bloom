"use client";

import { FormEvent, useState } from "react";
import {
  MAX_PROJECT_TASKS,
  PROJECT_AREA_LABELS,
  PROJECT_TASK_LIBRARY,
  TUTORIAL_PROJECT_DAYS,
} from "@/lib/game";
import { PixelAvatar } from "@/components/PixelAvatar";
import type {
  AvatarConfig,
  AvatarGender,
  AvatarHairColor,
  AvatarOutfitColor,
  AvatarSkinTone,
  OnboardingData,
  ProjectArea,
} from "@/types/teancum";

type OnboardingProps = {
  accountSaving: boolean;
  error: string | null;
  saving: boolean;
  onSignInGoogle: () => Promise<void>;
  onStart: (data: OnboardingData) => Promise<void>;
};

export function Onboarding({ accountSaving, error, saving, onSignInGoogle, onStart }: OnboardingProps) {
  const [nickname, setNickname] = useState("");
  const [prayerTarget, setPrayerTarget] = useState(2);
  const [scriptureTarget, setScriptureTarget] = useState(3);
  const [customTaskLabel, setCustomTaskLabel] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>({
    gender: "male",
    skinTone: "medium",
    hairColor: "brown",
    outfitColor: "blue",
  });
  const [tutorialArea, setTutorialArea] = useState<ProjectArea>("spiritual");
  const [tutorialTasks, setTutorialTasks] = useState<string[]>([
    PROJECT_TASK_LIBRARY.spiritual[0],
    PROJECT_TASK_LIBRARY.spiritual[1],
  ]);
  const suggestedTutorialTasks = PROJECT_TASK_LIBRARY[tutorialArea];
  const projectAreas = Object.keys(PROJECT_AREA_LABELS) as ProjectArea[];
  const canStart = nickname.trim() && tutorialTasks.length > 0 && !saving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) return;
    await onStart({
      nickname,
      prayerTarget,
      scriptureTarget,
      customTaskLabel,
      avatar,
      tutorialArea,
      tutorialTasks: tutorialTasks.map((label) => ({ label, source: "preset" })),
    });
  }

  function changeTutorialArea(nextArea: ProjectArea) {
    setTutorialArea(nextArea);
    setTutorialTasks(PROJECT_TASK_LIBRARY[nextArea].slice(0, 2));
  }

  function toggleTutorialTask(task: string) {
    setTutorialTasks((currentTasks) => {
      if (currentTasks.includes(task)) {
        return currentTasks.filter((currentTask) => currentTask !== task);
      }

      if (currentTasks.length >= MAX_PROJECT_TASKS) {
        return currentTasks;
      }

      return [...currentTasks, task];
    });
  }

  return (
    <main className="min-h-dvh bg-[#eaf1ff] px-5 py-7">
      <section className="mx-auto flex min-h-[86dvh] max-w-md flex-col justify-center">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#c8dcff] text-6xl shadow-[0_14px_0_#8fb5ff]">
            🛡️
          </div>
          <h1 className="text-5xl font-black text-[#102b55]">Teâncum</h1>
          <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-[#4b638f]">
            Defina metas simples, cumpra hábitos espirituais e evolua seu próprio personagem.
          </p>
        </div>

        <div className="mb-4 rounded-[26px] border border-[#cfdcf6] bg-white p-4 text-center shadow-[0_12px_30px_rgba(17,49,96,0.12)]">
          <p className="text-sm font-bold text-[#4b638f]">Já tem personagem salvo?</p>
          <button
            className="mt-2 min-h-13 w-full rounded-2xl bg-[#1f5fbf] px-4 text-base font-black text-white shadow-[0_5px_0_#123f86] transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || accountSaving}
            onClick={onSignInGoogle}
            type="button"
          >
            {accountSaving ? "Entrando..." : "Entrar com Google"}
          </button>
          <p className="mt-2 text-xs font-semibold text-[#66799e]">
            Use para continuar sua jornada em outro aparelho.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] border border-[#cfdcf6] bg-white p-5 shadow-[0_18px_45px_rgba(17,49,96,0.16)]"
        >
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-[#183b70]">Nickname</span>
            <input
              className="h-14 w-full rounded-2xl border-2 border-[#dbe6fb] bg-[#f8fbff] px-4 text-base font-semibold text-[#102b55] outline-none transition focus:border-[#2f6fd1]"
              maxLength={28}
              placeholder="Ex: Teo"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>

          <div className="mb-4 rounded-[24px] border border-[#dbe6fb] bg-[#f8fbff] p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[26px] bg-[#102b55] shadow-[inset_0_-10px_0_rgba(143,181,255,0.18)]">
                <PixelAvatar avatar={avatar} className="scale-75" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#183b70]">Personagem</p>
                <p className="mt-1 text-xs font-bold leading-5 text-[#66799e]">
                  Escolha o estilo inicial. Depois poderemos liberar roupas e equipamentos.
                </p>
              </div>
            </div>

            <AvatarPicker
              label="Estilo"
              options={[
                { label: "Menino", value: "male" },
                { label: "Menina", value: "female" },
              ]}
              value={avatar.gender}
              onChange={(gender) => setAvatar((current) => ({ ...current, gender }))}
            />
            <AvatarPicker
              label="Pele"
              options={[
                { label: "Clara", value: "light" },
                { label: "Média", value: "medium" },
                { label: "Escura", value: "dark" },
              ]}
              value={avatar.skinTone}
              onChange={(skinTone) => setAvatar((current) => ({ ...current, skinTone }))}
            />
            <AvatarPicker
              label="Cabelo"
              options={[
                { label: "Preto", value: "black" },
                { label: "Castanho", value: "brown" },
                { label: "Loiro", value: "blonde" },
              ]}
              value={avatar.hairColor}
              onChange={(hairColor) => setAvatar((current) => ({ ...current, hairColor }))}
            />
            <AvatarPicker
              label="Roupa"
              options={[
                { label: "Azul", value: "blue" },
                { label: "Verde", value: "green" },
                { label: "Amarela", value: "yellow" },
              ]}
              value={avatar.outfitColor}
              onChange={(outfitColor) => setAvatar((current) => ({ ...current, outfitColor }))}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <GoalPicker
              label="Oração"
              options={[1, 2, 3]}
              suffix="x"
              value={prayerTarget}
              onChange={setPrayerTarget}
            />
            <GoalPicker
              label="Escrituras"
              options={[2, 3, 5]}
              suffix="pag."
              value={scriptureTarget}
              onChange={setScriptureTarget}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#183b70]">
              Tarefa extra opcional
            </span>
            <div className="mb-2 flex flex-wrap gap-2">
              {["Servir alguém", "Escrever no diário", "Compartilhar uma escritura"].map((task) => (
                <button
                  className="rounded-full bg-[#e8f0ff] px-3 py-2 text-xs font-black text-[#1f5fbf] transition active:scale-95"
                  key={task}
                  onClick={() => setCustomTaskLabel(task)}
                  type="button"
                >
                  {task}
                </button>
              ))}
            </div>
            <input
              className="h-14 w-full rounded-2xl border-2 border-[#dbe6fb] bg-[#f8fbff] px-4 text-base font-semibold text-[#102b55] outline-none transition focus:border-[#2f6fd1]"
              maxLength={40}
              placeholder="Ou escreva a sua (+5 XP)"
              value={customTaskLabel}
              onChange={(event) => setCustomTaskLabel(event.target.value)}
            />
          </label>

          <div className="mt-5 rounded-[24px] border border-[#dbe6fb] bg-[#f8fbff] p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#183b70]">Projeto tutorial</p>
                <p className="mt-1 text-xs font-bold leading-5 text-[#66799e]">
                  Escolha uma área e até {MAX_PROJECT_TASKS} tarefas para começar.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#fff2b8] px-3 py-1 text-xs font-black text-[#7a6418]">
                {TUTORIAL_PROJECT_DAYS} dias
              </span>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              {projectAreas.map((area) => (
                <button
                  className={`min-h-10 rounded-2xl px-3 text-xs font-black transition ${
                    tutorialArea === area
                      ? "bg-[#1f5fbf] text-white shadow-[0_4px_0_#123f86]"
                      : "bg-white text-[#1f5fbf]"
                  }`}
                  key={area}
                  onClick={() => changeTutorialArea(area)}
                  type="button"
                >
                  {PROJECT_AREA_LABELS[area]}
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs font-black text-[#66799e]">
              Tarefas escolhidas {tutorialTasks.length}/{MAX_PROJECT_TASKS}
            </p>
            <div className="space-y-2">
              {suggestedTutorialTasks.map((task) => {
                const selected = tutorialTasks.includes(task);

                return (
                  <button
                    className={`flex min-h-11 w-full items-center gap-2 rounded-2xl border-2 px-3 text-left text-sm font-black transition ${
                      selected
                        ? "border-[#1f5fbf] bg-[#eaf1ff] text-[#102b55]"
                        : "border-[#dbe6fb] bg-white text-[#4b638f]"
                    }`}
                    key={task}
                    onClick={() => toggleTutorialTask(task)}
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
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="mt-4 text-sm font-semibold text-[#b94b4b]">{error}</p> : null}

          <button
            className="mt-5 h-14 w-full rounded-2xl bg-[#1f5fbf] px-5 text-base font-black text-white shadow-[0_7px_0_#123f86] transition active:translate-y-1 active:shadow-[0_3px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canStart}
            type="submit"
          >
            {saving ? "Criando jornada..." : "Começar Jornada"}
          </button>

        </form>
      </section>
    </main>
  );
}

type GoalPickerProps = {
  label: string;
  options: number[];
  suffix: string;
  value: number;
  onChange: (value: number) => void;
};

function GoalPicker({ label, options, suffix, value, onChange }: GoalPickerProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#183b70]">{label}</p>
      <div className="rounded-2xl bg-[#f3f7ff] p-1">
        {options.map((option) => (
          <button
            className={`h-10 w-1/3 rounded-xl text-sm font-black transition ${
              value === option ? "bg-[#1f5fbf] text-white shadow-sm" : "text-[#4b638f]"
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
            {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

type AvatarOption<T extends string> = {
  label: string;
  value: T;
};

type AvatarPickerProps<T extends AvatarGender | AvatarSkinTone | AvatarHairColor | AvatarOutfitColor> = {
  label: string;
  options: AvatarOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

function AvatarPicker<T extends AvatarGender | AvatarSkinTone | AvatarHairColor | AvatarOutfitColor>({
  label,
  options,
  value,
  onChange,
}: AvatarPickerProps<T>) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-2 text-xs font-black text-[#66799e]">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            className={`min-h-10 rounded-2xl px-2 text-xs font-black transition ${
              value === option.value
                ? "bg-[#1f5fbf] text-white shadow-[0_3px_0_#123f86]"
                : "bg-white text-[#1f5fbf]"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
