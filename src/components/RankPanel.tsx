import type { LeaderboardEntry, UserProfile } from "@/types/teancum";

type RankPanelProps = {
  entries: LeaderboardEntry[];
  error: string | null;
  loading: boolean;
  profile: UserProfile;
  onRefresh: () => Promise<void>;
};

export function RankPanel({ entries, error, loading, profile, onRefresh }: RankPanelProps) {
  const currentEntry = entries.find((entry) => entry.uid === profile.uid);
  const topThree = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
            Ranking
          </p>
          <h2 className="text-lg font-black text-[#102b55]">Rank dos jovens</h2>
          <p className="mt-1 text-xs font-bold text-[#66799e]">
            Entram aqui depois de criar personagem. Só nickname fica público.
          </p>
        </div>
        <button
          className="h-10 shrink-0 rounded-2xl bg-[#eaf1ff] px-3 text-xs font-black text-[#1f5fbf] disabled:opacity-50"
          disabled={loading}
          onClick={onRefresh}
          type="button"
        >
          {loading ? "..." : "Atualizar"}
        </button>
      </div>

      {currentEntry ? (
        <div className="mb-4 rounded-[24px] bg-[#102b55] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8fb5ff]">
            Sua posição
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-3xl font-black">#{currentEntry.rank}</p>
              <p className="break-words text-sm font-bold text-[#dce8ff]">
                {currentEntry.nickname}
              </p>
              <ProviderBadge provider={currentEntry.accountProvider} />
            </div>
            <div className="text-right">
              <p className="text-xl font-black">{currentEntry.xp} XP</p>
              <p className="text-xs font-bold text-[#c8dcff]">Level {currentEntry.level}</p>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm font-bold text-[#9c3f3f]">
          {error}
        </p>
      ) : null}

      {entries.length === 0 && !loading ? (
        <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-bold text-[#4b638f]">
          O ranking aparece quando os primeiros jogadores criarem personagem e salvarem progresso.
        </p>
      ) : null}

      {topThree.length > 0 ? (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {topThree.map((entry) => (
            <article
              className={`rounded-[22px] p-3 text-center ${
                entry.rank === 1
                  ? "bg-[#fff2b8] text-[#7a6418]"
                  : entry.uid === profile.uid
                    ? "bg-[#dce8ff] text-[#102b55]"
                    : "bg-[#f8fbff] text-[#4b638f]"
              }`}
              key={entry.uid}
            >
              <p className="text-2xl font-black">{entry.rank === 1 ? "🏆" : `#${entry.rank}`}</p>
              <p className="mt-1 truncate text-xs font-black">{entry.nickname}</p>
              <p className="mt-1 text-[10px] font-black">
                {entry.accountProvider === "google" ? "Google" : "Anônimo"}
              </p>
              <p className="mt-1 text-[11px] font-bold">{entry.xp} XP</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        {remainingEntries.map((entry) => (
          <article
            className={`flex min-h-14 items-center gap-3 rounded-2xl px-3 ${
              entry.uid === profile.uid ? "bg-[#dce8ff]" : "bg-[#f8fbff]"
            }`}
            key={entry.uid}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#1f5fbf]">
              #{entry.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[#102b55]">{entry.nickname}</p>
              <p className="text-xs font-bold text-[#66799e]">
                Level {entry.level} · sequência {entry.streak}
              </p>
            </div>
            <ProviderBadge provider={entry.accountProvider} compact />
            <p className="shrink-0 text-sm font-black text-[#1f5fbf]">{entry.xp}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProviderBadge({
  compact = false,
  provider,
}: {
  compact?: boolean;
  provider?: LeaderboardEntry["accountProvider"];
}) {
  const google = provider === "google";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-black ${
        compact ? "px-2 py-1 text-[10px]" : "mt-2 px-3 py-1 text-[11px]"
      } ${google ? "bg-white text-[#1f5fbf]" : "bg-[#eaf1ff] text-[#4b638f]"}`}
    >
      {google ? "Google" : "Anônimo"}
    </span>
  );
}
