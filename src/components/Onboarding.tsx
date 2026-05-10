"use client";

import { FormEvent, useState } from "react";
import type { OnboardingData } from "@/types/teancum";

type OnboardingProps = {
  error: string | null;
  saving: boolean;
  onStart: (data: OnboardingData) => Promise<void>;
};

export function Onboarding({ error, saving, onStart }: OnboardingProps) {
  const [nickname, setNickname] = useState("");
  const [prayerTarget, setPrayerTarget] = useState(2);
  const [scriptureTarget, setScriptureTarget] = useState(3);
  const [customTaskLabel, setCustomTaskLabel] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nickname.trim()) return;
    await onStart({
      nickname,
      prayerTarget,
      scriptureTarget,
      customTaskLabel,
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
            Defina metas simples, cumpra habitos espirituais e evolua seu proprio personagem.
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

          <div className="mb-4 grid grid-cols-2 gap-3">
            <GoalPicker
              label="Oracao"
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
              {["Servir alguem", "Escrever no diario", "Compartilhar uma escritura"].map((task) => (
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

          {error ? <p className="mt-4 text-sm font-semibold text-[#b94b4b]">{error}</p> : null}

          <button
            className="mt-5 h-14 w-full rounded-2xl bg-[#1f5fbf] px-5 text-base font-black text-white shadow-[0_7px_0_#123f86] transition active:translate-y-1 active:shadow-[0_3px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !nickname.trim()}
            type="submit"
          >
            {saving ? "Criando jornada..." : "Comecar Jornada"}
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
