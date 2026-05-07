"use client";

import { FormEvent, useState } from "react";
import type { OnboardingData } from "@/types/bloom";

type OnboardingProps = {
  error: string | null;
  saving: boolean;
  onStart: (data: OnboardingData) => Promise<void>;
};

export function Onboarding({ error, saving, onStart }: OnboardingProps) {
  const [userName, setUserName] = useState("");
  const [plantName, setPlantName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userName.trim() || !plantName.trim()) return;
    await onStart({ userName, plantName });
  }

  return (
    <main className="min-h-dvh bg-[#fff8e8] px-5 py-7">
      <section className="mx-auto flex min-h-[86dvh] max-w-md flex-col justify-center">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#dff2cf] text-6xl shadow-[0_14px_0_#b9dfa7]">
            🌱
          </div>
          <h1 className="text-5xl font-black text-[#254033]">Bloom</h1>
          <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-[#667260]">
            Cuide da sua planta diariamente e veja ela florescer.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] border border-[#f1e1b8] bg-white p-5 shadow-[0_18px_45px_rgba(70,98,74,0.14)]"
        >
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-[#345546]">Seu nome</span>
            <input
              className="h-14 w-full rounded-2xl border-2 border-[#e6efd9] bg-[#fbfff5] px-4 text-base font-semibold text-[#254033] outline-none transition focus:border-[#6aaa64]"
              maxLength={28}
              placeholder="Ex: Ana"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#345546]">Nome da sua planta</span>
            <input
              className="h-14 w-full rounded-2xl border-2 border-[#e6efd9] bg-[#fbfff5] px-4 text-base font-semibold text-[#254033] outline-none transition focus:border-[#6aaa64]"
              maxLength={28}
              placeholder="Ex: Broto"
              value={plantName}
              onChange={(event) => setPlantName(event.target.value)}
            />
          </label>

          {error ? <p className="mt-4 text-sm font-semibold text-[#b94b4b]">{error}</p> : null}

          <button
            className="mt-5 h-14 w-full rounded-2xl bg-[#6aaa64] px-5 text-base font-black text-white shadow-[0_7px_0_#4f8f49] transition active:translate-y-1 active:shadow-[0_3px_0_#4f8f49] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !userName.trim() || !plantName.trim()}
            type="submit"
          >
            {saving ? "Plantando..." : "Começar Jornada"}
          </button>
        </form>
      </section>
    </main>
  );
}
