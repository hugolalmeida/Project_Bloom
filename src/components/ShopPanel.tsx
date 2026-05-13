import { PixelAvatar } from "@/components/PixelAvatar";
import { SHOP_ITEMS, getLevelFromXp } from "@/lib/game";
import type { ShopItemId, UserProfile } from "@/types/teancum";

type ShopPanelProps = {
  pendingShopItemId: ShopItemId | null;
  profile: UserProfile;
  shopSaving: boolean;
  onBuyItem: (itemId: ShopItemId) => Promise<void>;
  onEquipItem: (itemId: ShopItemId) => Promise<void>;
};

export function ShopPanel({
  pendingShopItemId,
  profile,
  shopSaving,
  onBuyItem,
  onEquipItem,
}: ShopPanelProps) {
  const coins = profile.coins ?? 0;
  const level = getLevelFromXp(profile.xp);
  const ownedItems = profile.inventory?.ownedItemIds ?? [];
  const equippedItemId = profile.inventory?.equippedItemId ?? null;

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1f5fbf]">
            Loja
          </p>
          <h2 className="mt-1 text-xl font-black text-[#102b55]">Itens visuais</h2>
          <p className="mt-1 text-sm font-semibold text-[#66799e]">
            Compre equipamentos para personalizar seu personagem.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-[#fff1b8] px-3 py-2 text-right shadow-[0_6px_0_rgba(129,85,20,0.18)]">
          <p className="text-xs font-black text-[#9b6a17]">Moedas</p>
          <p className="text-xl font-black text-[#102b55]">🪙 {coins}</p>
        </div>
      </div>

      <div className="space-y-3">
        {SHOP_ITEMS.map((item) => {
          const owned = ownedItems.includes(item.id);
          const equipped = equippedItemId === item.id;
          const locked = level < item.minLevel;
          const affordable = coins >= item.price;
          const pending = pendingShopItemId === item.id;

          return (
            <article
              className={`rounded-[24px] border-2 p-3 transition ${
                equipped ? "border-[#ffe783] bg-[#fff8d7]" : "border-[#dce7fb] bg-[#f8fbff]"
              }`}
              key={item.id}
            >
              <div className="flex gap-3">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-[#102b55] shadow-[inset_0_-10px_0_rgba(143,181,255,0.18)]">
                  <div className="absolute bottom-0 h-10 w-full rounded-t-[50%] bg-[#244b85]" />
                  <PixelAvatar
                    avatar={profile.avatar}
                    className="scale-[0.66]"
                    equippedItemId={item.id}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-black text-[#102b55]">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold leading-5 text-[#66799e]">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-black text-[#9b6a17]">
                      🪙 {item.price}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#66799e]">
                      {locked ? `Libera no level ${item.minLevel}` : owned ? "No inventário" : "Disponível"}
                    </span>
                    <button
                      className={`min-h-10 shrink-0 rounded-2xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        equipped
                          ? "bg-[#102b55] text-white"
                          : owned
                            ? "bg-[#1f5fbf] text-white shadow-[0_4px_0_#123f86]"
                            : "bg-[#ffe783] text-[#102b55] shadow-[0_4px_0_rgba(129,85,20,0.28)]"
                      }`}
                      disabled={shopSaving || locked || equipped || (!owned && !affordable)}
                      onClick={() => (owned ? onEquipItem(item.id) : onBuyItem(item.id))}
                      type="button"
                    >
                      {pending
                        ? "Salvando..."
                        : equipped
                          ? "Equipado"
                          : owned
                            ? "Usar"
                            : affordable
                              ? "Comprar"
                              : "Faltam moedas"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
