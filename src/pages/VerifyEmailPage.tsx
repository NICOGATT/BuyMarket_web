import { useState } from "react";
import { ArrowLeft, BadgeCheck, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { verifyEmail } from "../shared/services/auth.service";
import { getUserFromToken, markEmailVerifiedLocally } from "../shared/utils/auth";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Ingresá el código que recibiste por email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const currentUser = getUserFromToken();
      const response = await verifyEmail({ code: trimmedCode });
      const token = response.access_token || response.accessToken;

      if (token) {
        localStorage.setItem("token", token);
        window.dispatchEvent(new Event("auth-change"));
      }

      if (currentUser) {
        markEmailVerifiedLocally(currentUser);
      }

      navigate("/profile", {
        replace: true,
        state: { emailVerified: true },
      });
    } catch {
      setError("No pudimos validar el código. Revisalo e intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="-mx-4 -my-8 min-h-[calc(100svh-154px)] overflow-hidden bg-[#F8FAFC] sm:-mx-6 lg:-mx-8">
      <div className="relative flex min-h-[calc(100svh-154px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(45,0,107,0.10),transparent_34%),linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_50%,#F2ECFF_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#2D006B]/10 blur-3xl" />
          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/25 blur-3xl" />
          <div className="absolute left-[14%] top-[24%] hidden h-16 w-16 rotate-[-12deg] items-center justify-center rounded-[22px] border border-[#E2E8F0]/80 bg-white/50 text-[#2D006B]/20 shadow-sm backdrop-blur-sm sm:flex">
            <MailCheck className="h-7 w-7" />
          </div>
          <div className="absolute right-[16%] top-[30%] hidden h-16 w-16 rotate-[14deg] items-center justify-center rounded-[22px] border border-[#E2E8F0]/80 bg-white/50 text-[#2D006B]/20 shadow-sm backdrop-blur-sm sm:flex">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[456px] animate-login-card-in rounded-[24px] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12),0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] text-white shadow-[0_14px_32px_rgba(45,0,107,0.26)]">
              <BadgeCheck className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-black tracking-normal text-[#0F172A] sm:text-4xl">
              Verificá tu email
            </h1>
            <p className="mt-3 text-base font-medium text-[#64748B]">
              Ingresá el código que te enviamos a tu correo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#0F172A]">
                Código de verificación
              </span>
              <span className="group relative block">
                <KeyRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B] transition group-focus-within:text-[#2D006B]"
                />
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Ingresá tu código"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="h-[52px] w-full rounded-[14px] border border-[#E2E8F0] bg-white pl-12 pr-4 text-center text-[18px] font-black tracking-[0.18em] text-[#0F172A] outline-none transition duration-200 placeholder:text-left placeholder:text-[15px] placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2D006B] focus:shadow-[0_0_0_4px_rgba(45,0,107,0.10),0_12px_24px_rgba(45,0,107,0.08)]"
                />
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-gradient-to-b from-[var(--brand)] to-[var(--brand-hover)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(45,0,107,0.26)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(45,0,107,0.32)] focus:outline-none focus:ring-2 focus:ring-[#2D006B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Verificando..." : "Verificar email"}
            </button>
          </form>

          <Link
            to="/profile"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-black text-[#2D006B] transition hover:text-[#240055] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2D006B] focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a mi perfil
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmailPage;
