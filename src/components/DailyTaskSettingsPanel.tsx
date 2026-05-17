"use client";

import { useState } from "react";
import { DEFAULT_GOALS } from "@/lib/game";
import type { UserGoals, UserProfile } from "@/types/teancum";

type DailyTaskSettingsPanelProps = {
  profile: UserProfile;
  saving: boolean;
  onUpdateDailyGoals: (goals: UserGoals) => Promise<void>;
};

export function DailyTaskSettingsPanel({
  profile,
  saving,
  onUpdateDailyGoals,
}: DailyTaskSettingsPanelProps) {
  const currentGoals = {
    ...DEFAULT_GOALS,
    ...profile.goals,
  };
  const currentCustomLabel = currentGoals.taskLabels?.custom ?? currentGoals.customTaskLabel ?? "";
  const [prayerTarget, setPrayerTarget] = useState(currentGoals.prayerTarget);
  const [scriptureTarget, setScriptureTarget] = useState(currentGoals.scriptureTarget);
  const [customTaskLabel, setCustomTaskLabel] = useState(currentCustomLabel);

  const trimmedCustomTask = customTaskLabel.trim();
  const changed =
    prayerTarget !== currentGoals.prayerTarget ||
    scriptureTarget !== currentGoals.scriptureTarget ||
    trimmedCustomTask !== currentCustomLabel;
  const customTaskIsValid = trimmedCustomTask.length === 0 || trimmedCustomTask.length >= 3;
  const canSave = !saving && changed && customTaskIsValid;

  async function handleSave() {
    if (!canSave) return;

    await onUpdateDailyGoals({
      prayerTarget,
      scriptureTarget,
      ...(trimmedCustomTask ? { customTaskLabel: trimmedCustomTask } : {}),
    });
  }

  function clearCustomTask() {
    setCustomTaskLabel("");
  }

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
          Metas diárias
        </p>
        <h2 className="text-lg font-black text-[#102b55]">Missões do dia</h2>
        <p className="mt-1 text-xs font-bold text-[#66799e]">
          Troque as metas escolhidas no começo da jornada.
        </p>
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
          suffix="pág."
          value={scriptureTarget}
          onChange={setScriptureTarget}
        />
      </div>

      <div className="rounded-[22px] border-2 border-dashed border-[#b8cff8] bg-[#f8fbff] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-black text-[#66799e]">Tarefa personalizada</p>
          {trimmedCustomTask ? (
            <button
              className="rounded-full bg-[#fff6f6] px-3 py-1 text-[11px] font-black text-[#a04444]"
              onClick={clearCustomTask}
              type="button"
            >
              Remover
            </button>
          ) : null}
        </div>
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
          className="h-11 w-full rounded-2xl border-2 border-[#dbe6fb] bg-white px-3 text-sm font-bold text-[#102b55] outline-none transition focus:border-[#1f5fbf]"
          maxLength={38}
          placeholder="Ou escreva outra tarefa"
          value={customTaskLabel}
          onChange={(event) => setCustomTaskLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSave();
            }
          }}
        />
        {!customTaskIsValid ? (
          <p className="mt-2 text-xs font-bold text-[#a04444]">
            Use pelo menos 3 caracteres ou deixe vazio para remover.
          </p>
        ) : null}
      </div>

      <button
        className="mt-4 h-12 w-full rounded-2xl bg-[#1f5fbf] text-sm font-black text-white shadow-[0_5px_0_#123f86] transition active:translate-y-1 active:shadow-[0_2px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-55"
        disabled={!canSave}
        onClick={handleSave}
        type="button"
      >
        {saving ? "Salvando..." : "Salvar metas diárias"}
      </button>
    </section>
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
