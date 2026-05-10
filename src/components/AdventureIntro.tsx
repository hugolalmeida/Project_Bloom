"use client";

type AdventureIntroProps = {
  characterName: string;
  saving: boolean;
  onStart: () => Promise<void>;
};

export function AdventureIntro({ characterName, saving, onStart }: AdventureIntroProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#071833]/80 px-4 py-6 backdrop-blur-sm">
      <section className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-[#8fb5ff] bg-[#f8fbff] p-5 text-center shadow-[0_24px_70px_rgba(7,24,51,0.36)]">
        <div className="absolute inset-x-0 top-0 h-2 bg-[#f0a83a]" />
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <span className="absolute left-8 top-10 h-3 w-3 animate-adventure-spark rounded-full bg-[#f0a83a]" />
          <span className="absolute right-10 top-20 h-2 w-2 animate-adventure-spark rounded-full bg-[#8fb5ff] [animation-delay:160ms]" />
          <span className="absolute bottom-24 left-12 h-2 w-2 animate-adventure-spark rounded-full bg-[#5cbf7a] [animation-delay:300ms]" />
        </div>

        <div className="relative">
          <div className="mx-auto mb-4 flex h-24 w-24 animate-adventure-pop items-center justify-center rounded-[28px] bg-[#dce8ff] text-5xl shadow-[inset_0_-8px_0_rgba(31,95,191,0.12)]">
            🧭
          </div>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1f5fbf]">
            Capitulo 1
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-[#102b55]">
            Sua aventura comeca agora, {characterName}!
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-[#4b638f]">
            Pequenas missoes diarias vao fortalecer seu personagem. Ore, estude, sirva e avance um
            dia por vez.
          </p>

          <div className="my-5 rounded-[24px] bg-white p-4 text-left shadow-[0_12px_26px_rgba(17,49,96,0.1)]">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66799e]">
              Primeira missao
            </p>
            <p className="mt-1 text-base font-black text-[#102b55]">
              Complete as metas de hoje para ganhar XP e iniciar sua sequencia.
            </p>
          </div>

          <button
            className="h-14 w-full rounded-2xl bg-[#1f5fbf] text-base font-black text-white shadow-[0_6px_0_#123f86] transition active:translate-y-1 active:shadow-[0_2px_0_#123f86] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            onClick={onStart}
            type="button"
          >
            {saving ? "Abrindo caminho..." : "Comecar aventura"}
          </button>
        </div>
      </section>
    </div>
  );
}
