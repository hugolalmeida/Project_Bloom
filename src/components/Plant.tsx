import { getPlantEmoji } from "@/lib/game";

type PlantProps = {
  evolutionActive: boolean;
  level: number;
  plantName: string;
};

export function Plant({ evolutionActive, level, plantName }: PlantProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-[#cceeff] px-4 pb-6 pt-5 text-center shadow-[inset_0_-18px_0_rgba(98,160,104,0.18)] sm:px-5">
      <div className="absolute left-5 top-5 h-10 w-10 rounded-full bg-[#ffe783] shadow-[0_0_0_10px_rgba(255,231,131,0.25)]" />
      <div className="absolute bottom-0 left-0 right-0 h-20 rounded-t-[50%] bg-[#b9dfa7]" />
      <div
        className={`relative mx-auto flex h-40 w-40 items-center justify-center text-8xl sm:h-44 sm:w-44 ${
          evolutionActive ? "animate-plant-evolve" : "animate-bloom-pop"
        }`}
        aria-label={`Planta ${plantName} no level ${level}`}
      >
        {getPlantEmoji(level)}
      </div>
      <div className="relative">
        <h2 className="break-words text-2xl font-black text-[#254033]">{plantName}</h2>
        <p className="mt-1 text-sm font-bold text-[#4d705c]">Level {level}</p>
      </div>
    </div>
  );
}
