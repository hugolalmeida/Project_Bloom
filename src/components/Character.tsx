import { getCharacterEmoji, getCharacterTitle } from "@/lib/game";

type CharacterProps = {
  characterName: string;
  evolutionActive: boolean;
  level: number;
};

export function Character({ characterName, evolutionActive, level }: CharacterProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-[#102b55] px-4 pb-6 pt-5 text-center shadow-[inset_0_-18px_0_rgba(143,181,255,0.18)] sm:px-5">
      <div className="absolute left-5 top-5 h-10 w-10 rounded-full bg-[#ffe783] shadow-[0_0_0_10px_rgba(255,231,131,0.18)]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-[50%] bg-[#244b85]" />
      <div className="absolute bottom-6 left-8 h-8 w-16 rounded-full bg-[#8fb5ff]/30" />
      <div className="absolute bottom-10 right-8 h-7 w-14 rounded-full bg-[#8fb5ff]/30" />
      <div
        className={`relative mx-auto flex h-40 w-40 items-center justify-center rounded-[36px] bg-white/15 text-8xl shadow-[inset_0_-10px_0_rgba(255,255,255,0.12)] sm:h-44 sm:w-44 ${
          evolutionActive ? "animate-character-evolve" : "animate-character-pop"
        }`}
        aria-label={`Personagem ${characterName} no level ${level}`}
      >
        {getCharacterEmoji(level)}
      </div>
      <div className="relative mt-2">
        <h2 className="break-words text-2xl font-black text-white">{characterName}</h2>
        <p className="mt-1 text-sm font-bold text-[#c8dcff]">
          {getCharacterTitle(level)} · Level {level}
        </p>
      </div>
    </div>
  );
}
