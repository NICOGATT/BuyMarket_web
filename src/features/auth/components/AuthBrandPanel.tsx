type AuthBrandPanelProps = {
  mode: "login" | "register" | "recovery";
};

function AuthBrandPanel({ mode }: AuthBrandPanelProps) {
  return (
    <aside className="relative hidden min-h-0 overflow-hidden bg-[#eef8ff] lg:block">
      <img
        src="/auth/buymarket-auth-panel-light-v4.png"
        alt={
          mode === "login"
            ? "BuyMarket, comprá y vendé cerca tuyo en una plataforma simple"
            : mode === "register"
              ? "BuyMarket, marketplace local seguro y confiable"
              : "BuyMarket, recuperá el acceso a tu cuenta de forma segura"
        }
        className="absolute inset-0 h-full w-full object-fill"
      />

      <div
        className="absolute left-[5.7%] top-[4.1%] flex h-[11.2%] w-[45%] items-center gap-[4%] bg-[#edf7ff]"
        aria-hidden="true"
      >
        <img
          src="/buymarket-logo-compact.png"
          alt=""
          className="h-[78%] w-[25%] shrink-0 object-contain"
        />
        <span className="whitespace-nowrap text-[clamp(2rem,3.2vw,4.35rem)] font-black leading-none tracking-[-0.045em] text-[#07183c]">
          Buy<span className="text-[#087af2]">Market</span>
        </span>
      </div>
    </aside>
  );
}

export default AuthBrandPanel;
