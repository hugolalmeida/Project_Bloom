import type { AvatarConfig, ShopItemId } from "@/types/teancum";

type PixelAvatarProps = {
  avatar?: AvatarConfig;
  className?: string;
  equippedItemId?: ShopItemId | null;
};

const defaultAvatar: AvatarConfig = {
  gender: "male",
  skinTone: "medium",
  hairColor: "brown",
  outfitColor: "blue",
};

const skinColors: Record<AvatarConfig["skinTone"], string> = {
  light: "#f4c9a8",
  medium: "#c9824a",
  dark: "#75452e",
};

const hairColors: Record<AvatarConfig["hairColor"], string> = {
  black: "#1c1b22",
  brown: "#5b3424",
  blonde: "#d9ad4f",
};

const outfitColors: Record<AvatarConfig["outfitColor"], string> = {
  blue: "#2563c7",
  green: "#4f9b58",
  yellow: "#e4ad35",
};

export function PixelAvatar({ avatar, className = "", equippedItemId }: PixelAvatarProps) {
  const config = avatar ?? defaultAvatar;
  const skin = skinColors[config.skinTone];
  const hair = hairColors[config.hairColor];
  const outfit = outfitColors[config.outfitColor];
  const isFemale = config.gender === "female";

  return (
    <div
      aria-label={`Avatar pixel ${isFemale ? "feminino" : "masculino"}`}
      className={`relative h-28 w-24 ${className}`}
      role="img"
      style={{ imageRendering: "pixelated" }}
    >
      {equippedItemId === "sky-aura" ? (
        <span className="absolute inset-2 rounded-full bg-[#8fb5ff]/35 blur-sm" />
      ) : null}
      {equippedItemId === "blue-cape" ? (
        <PixelBlock className="left-3 top-[4.65rem] h-12 w-[4.5rem]" color="#1f5fbf" />
      ) : null}
      <PixelBlock className="left-7 top-1 h-4 w-10" color={hair} />
      <PixelBlock className="left-5 top-5 h-7 w-14" color={hair} />
      {equippedItemId === "gold-headband" ? (
        <PixelBlock className="left-5 top-8 h-2 w-14" color="#ffe783" />
      ) : null}
      {isFemale ? (
        <>
          <PixelBlock className="left-2 top-8 h-16 w-5" color={hair} />
          <PixelBlock className="right-2 top-8 h-16 w-5" color={hair} />
        </>
      ) : (
        <>
          <PixelBlock className="left-4 top-8 h-6 w-4" color={hair} />
          <PixelBlock className="right-4 top-8 h-6 w-4" color={hair} />
        </>
      )}
      <PixelBlock className="left-6 top-10 h-10 w-12" color={skin} />
      <PixelBlock className="left-8 top-16 h-2 w-2" color="#102b55" />
      <PixelBlock className="right-8 top-16 h-2 w-2" color="#102b55" />
      <PixelBlock className="left-10 top-24 h-1.5 w-4" color="#7f3f35" />
      <PixelBlock className="left-8 top-[3.25rem] h-3 w-8" color={skin} />
      <PixelBlock className="left-5 top-[4.6rem] h-8 w-14" color={outfit} />
      {equippedItemId === "light-medal" ? (
        <PixelBlock className="left-[2.65rem] top-[5.2rem] h-4 w-4 rounded-full" color="#ffe783" />
      ) : null}
      <PixelBlock className="left-2 top-[5rem] h-8 w-5" color={outfit} />
      <PixelBlock className="right-2 top-[5rem] h-8 w-5" color={outfit} />
      {equippedItemId === "training-shield" ? (
        <>
          <PixelBlock className="right-0 top-[5.35rem] h-8 w-5" color="#d6e3ff" />
          <PixelBlock className="right-1 top-[5.7rem] h-5 w-3" color="#1f5fbf" />
        </>
      ) : null}
      <PixelBlock className="left-4 top-[6.2rem] h-7 w-4" color={skin} />
      <PixelBlock className="right-4 top-[6.2rem] h-7 w-4" color={skin} />
      <PixelBlock className="left-7 bottom-0 h-8 w-4" color="#25375f" />
      <PixelBlock className="right-7 bottom-0 h-8 w-4" color="#25375f" />
      <PixelBlock className="left-5 bottom-0 h-3 w-8" color="#17223d" />
      <PixelBlock className="right-5 bottom-0 h-3 w-8" color="#17223d" />
      <PixelBlock className="left-4 top-[4.2rem] h-3 w-16" color="rgba(255,255,255,0.18)" />
    </div>
  );
}

type PixelBlockProps = {
  className: string;
  color: string;
};

function PixelBlock({ className, color }: PixelBlockProps) {
  return <span className={`absolute rounded-[2px] ${className}`} style={{ background: color }} />;
}
