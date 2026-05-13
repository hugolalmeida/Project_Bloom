import { PixelAvatar } from "@/components/PixelAvatar";
import { getCharacterTitle } from "@/lib/game";
import type { AvatarConfig, ShopItemId } from "@/types/teancum";

type CharacterProps = {
  avatar?: AvatarConfig;
  characterName: string;
  coins: number;
  equippedItemId?: ShopItemId | null;
  evolutionActive: boolean;
  level: number;
  xpForLevel: number;
  xpInLevel: number;
  xpProgress: number;
  xpToNextLevel: number;
};

export function Character({
  avatar,
  characterName,
  coins,
  equippedItemId,
  evolutionActive,
  level,
  xpForLevel,
  xpInLevel,
  xpProgress,
  xpToNextLevel,
}: CharacterProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-[#102b55] px-4 pb-5 pt-5 text-center shadow-[inset_0_-18px_0_rgba(143,181,255,0.18)] sm:px-5">
      <div className="absolute left-5 top-5 h-10 w-10 rounded-full bg-[#ffe783] shadow-[0_0_0_10px_rgba(255,231,131,0.18)]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-[50%] bg-[#244b85]" />
      <div className="absolute bottom-6 left-8 h-8 w-16 rounded-full bg-[#8fb5ff]/30" />
      <div className="absolute bottom-10 right-8 h-7 w-14 rounded-full bg-[#8fb5ff]/30" />
      <div
        className={`relative mx-auto flex h-32 w-32 items-center justify-center rounded-[32px] bg-white/15 text-7xl shadow-[inset_0_-10px_0_rgba(255,255,255,0.12)] sm:h-36 sm:w-36 ${
          evolutionActive ? "animate-character-evolve" : "animate-character-pop"
        }`}
        aria-label={`Personagem ${characterName} no level ${level}`}
      >
        <PixelAvatar avatar={avatar} className="scale-90" equippedItemId={equippedItemId} />
        {evolutionActive ? (
          <span className="absolute inset-0 rounded-[36px] border-4 border-[#ffe783] animate-hero-glow" />
        ) : null}
      </div>
      <div className="relative mt-2">
        <h2 className="break-words text-2xl font-black text-white">{characterName}</h2>
        <p className="mt-1 text-sm font-bold text-[#c8dcff]">{getCharacterTitle(level)}</p>
        <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-black text-white">
          <span>Level {level}</span>
          <span className="h-1 w-1 rounded-full bg-[#ffe783]" />
          <span>{xpInLevel}/{xpForLevel} XP</span>
        </div>
        <div className="mx-auto mt-2 flex w-fit items-center gap-2 rounded-full bg-[#ffe783] px-4 py-2 text-sm font-black text-[#102b55] shadow-[0_5px_0_rgba(129,85,20,0.28)]">
          <span aria-hidden="true">🪙</span>
          <span>{coins}</span>
        </div>
        <div className="mx-auto mt-3 max-w-[18rem]">
          <div className="h-4 overflow-hidden rounded-full bg-[#244b85] p-1">
            <div
              className="relative h-full min-w-2 overflow-hidden rounded-full bg-[#ffe783] transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            >
              <span className="animate-progress-shimmer absolute inset-y-0 w-10 bg-white/35" />
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-[#c8dcff]">
            {xpInLevel === 0 ? "Comece este level" : `${xpToNextLevel} XP para o próximo level`}
          </p>
        </div>
      </div>
    </div>
  );
}
