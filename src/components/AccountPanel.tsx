type AccountPanelProps = {
  accountEmail: string | null;
  accountLinked: boolean;
  accountSaving: boolean;
  onLinkGoogleAccount: () => Promise<void>;
  onSwitchAccount: () => Promise<void>;
};

export function AccountPanel({
  accountEmail,
  accountLinked,
  accountSaving,
  onLinkGoogleAccount,
  onSwitchAccount,
}: AccountPanelProps) {
  const switchLabel = accountLinked ? "Sair / trocar conta" : "Trocar conta";

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">Conta</p>
          <h2 className="text-lg font-black text-[#102b55]">
            {accountLinked ? "Progresso salvo" : "Progresso neste aparelho"}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-2 text-xs font-black ${
            accountLinked ? "bg-[#dff2cf] text-[#386d2f]" : "bg-[#fff2b8] text-[#7a6418]"
          }`}
        >
          {accountLinked ? "Google" : "Anônimo"}
        </span>
      </div>

      {accountLinked ? (
        <div className="rounded-2xl bg-[#eaf1ff] px-4 py-3">
          <p className="text-sm font-black text-[#102b55]">Vinculado ao Google</p>
          {accountEmail ? (
            <p className="mt-1 break-words text-sm font-semibold text-[#4b638f]">
              {accountEmail}
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="mb-3 rounded-2xl bg-[#fff8d7] px-4 py-3 text-xs font-bold leading-5 text-[#7a6418]">
            Esta jornada está salva só neste navegador. Entre com Google para usar em outro
            aparelho.
          </p>
          <button
            className="h-13 w-full rounded-2xl bg-[#102b55] px-4 text-sm font-black text-white shadow-[0_5px_0_#071a36] transition active:translate-y-1 active:shadow-[0_2px_0_#071a36] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={accountSaving}
            onClick={onLinkGoogleAccount}
            type="button"
          >
            {accountSaving ? "Conectando..." : "Salvar com Google"}
          </button>
        </div>
      )}

      <button
        className="mt-3 h-11 w-full rounded-2xl border-2 border-[#dbe6fb] bg-[#f8fbff] px-4 text-xs font-black text-[#1f5fbf] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
        disabled={accountSaving}
        onClick={onSwitchAccount}
        type="button"
      >
        {accountSaving ? "Saindo..." : switchLabel}
      </button>
    </section>
  );
}
