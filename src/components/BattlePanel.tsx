"use client";

import { useMemo, useState } from "react";
import { BATTLE_UNLOCK_LEVEL, getLevelFromXp } from "@/lib/game";
import type { BattleRoom, UserProfile } from "@/types/teancum";

type BattlePanelProps = {
  activeBattle: BattleRoom | null;
  battleSaving: boolean;
  profile: UserProfile;
  onCloseBattle: () => void;
  onCreateBattle: () => Promise<void>;
  onJoinBattle: (code: string) => Promise<void>;
};

export function BattlePanel({
  activeBattle,
  battleSaving,
  profile,
  onCloseBattle,
  onCreateBattle,
  onJoinBattle,
}: BattlePanelProps) {
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("battle")?.toUpperCase() ?? "";
  });
  const level = getLevelFromXp(profile.xp);
  const unlocked = level >= BATTLE_UNLOCK_LEVEL;
  const battleLink = useMemo(() => {
    if (!activeBattle || typeof window === "undefined") return "";
    return `${window.location.origin}?battle=${activeBattle.id}`;
  }, [activeBattle]);

  if (!unlocked) {
    return (
      <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
        <div className="rounded-[26px] bg-[#102b55] p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb5ff]">
            Combate
          </p>
          <h2 className="mt-2 text-2xl font-black">Treino bloqueado</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#c8dcff]">
            Chegue ao level {BATTLE_UNLOCK_LEVEL} para criar salas de confronto amigável com
            outros jovens.
          </p>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/15 p-1">
            <div
              className="h-full rounded-full bg-[#ffe783] transition-all"
              style={{ width: `${Math.min(100, (level / BATTLE_UNLOCK_LEVEL) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-black text-[#ffe783]">
            Level {level}/{BATTLE_UNLOCK_LEVEL}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1f5fbf]">
          Combate
        </p>
        <h2 className="mt-1 text-xl font-black text-[#102b55]">Sala de treino</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#66799e]">
          Crie um código ou entre no código de outro jovem. O sorteio do vencedor entra na próxima
          fase.
        </p>
      </div>

      {activeBattle ? (
        <div className="space-y-3">
          <div className="rounded-[26px] bg-[#102b55] p-4 text-white">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8fb5ff]">
              Código da sala
            </p>
            <p className="mt-2 text-4xl font-black tracking-[0.12em] text-[#ffe783]">
              {activeBattle.id}
            </p>
            {battleLink ? (
              <p className="mt-2 break-all rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-[#c8dcff]">
                {battleLink}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PlayerCard label="Criador" name={activeBattle.hostName} ready />
            <PlayerCard
              label="Convidado"
              name={activeBattle.guestName ?? "Aguardando..."}
              ready={Boolean(activeBattle.guestUid)}
            />
          </div>

          <div
            className={`rounded-2xl px-4 py-3 text-sm font-black ${
              activeBattle.status === "ready"
                ? "bg-[#e7f5dc] text-[#35733b]"
                : "bg-[#fff8d7] text-[#7a6418]"
            }`}
          >
            {activeBattle.status === "ready"
              ? "Sala pronta. Na próxima fase o botão de batalha resolve o vencedor."
              : "Compartilhe o código para alguém entrar."}
          </div>

          <button
            className="min-h-12 w-full rounded-2xl bg-[#eaf1ff] px-4 text-sm font-black text-[#1f5fbf]"
            onClick={onCloseBattle}
            type="button"
          >
            Fechar sala nesta tela
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            className="min-h-14 w-full rounded-2xl bg-[#1f5fbf] px-4 text-base font-black text-white shadow-[0_5px_0_#123f86] transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={battleSaving}
            onClick={onCreateBattle}
            type="button"
          >
            {battleSaving ? "Criando sala..." : "Criar sala de combate"}
          </button>

          <div className="rounded-[24px] border-2 border-[#dce7fb] bg-[#f8fbff] p-3">
            <label className="text-sm font-black text-[#102b55]" htmlFor="battle-code">
              Entrar por código
            </label>
            <div className="mt-2 flex gap-2">
              <input
                className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-[#d4e1fb] bg-white px-4 text-base font-black uppercase tracking-[0.12em] text-[#102b55] outline-none focus:border-[#1f5fbf]"
                id="battle-code"
                maxLength={8}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                value={joinCode}
              />
              <button
                className="min-h-12 rounded-2xl bg-[#ffe783] px-4 text-sm font-black text-[#102b55] shadow-[0_4px_0_rgba(129,85,20,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={battleSaving || joinCode.trim().length < 4}
                onClick={() => onJoinBattle(joinCode)}
                type="button"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PlayerCard({ label, name, ready }: { label: string; name: string; ready: boolean }) {
  return (
    <div className="rounded-[22px] bg-[#f8fbff] p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">{label}</p>
      <p className="mt-1 min-h-10 break-words text-base font-black text-[#102b55]">{name}</p>
      <p className={`mt-2 text-xs font-black ${ready ? "text-[#35733b]" : "text-[#9b6a17]"}`}>
        {ready ? "Pronto" : "Esperando"}
      </p>
    </div>
  );
}
