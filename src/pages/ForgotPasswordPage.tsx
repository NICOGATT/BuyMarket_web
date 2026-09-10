import { useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, KeyRound, Mail, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AuthBrandPanel from "../features/auth/components/AuthBrandPanel";
import { forgotPassword } from "../shared/services/auth.service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getForgotPasswordErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response) {
    return "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  if (error.response.status === 429) {
    return "Ya solicitaste un enlace hace poco. Esperá unos minutos e intentá de nuevo.";
  }

  return "No pudimos enviar el email. Intentá nuevamente en unos minutos.";
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Ingresá tu email.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Ingresá un email válido.");
      return;
    }

    setError("");

    try {
      setIsSubmitting(true);
      await forgotPassword({ email: trimmedEmail });
      setIsSent(true);
    } catch (submitError: unknown) {
      console.error(
        "Forgot password error:",
        axios.isAxiosError(submitError)
          ? submitError.response?.data || submitError.message
          : submitError
      );
      setError(getForgotPasswordErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-svh w-full overflow-hidden bg-[#073a9d]">
      <div className="min-h-svh w-full bg-[#073a9d]">
        <div className="grid min-h-svh w-full items-stretch gap-0 overflow-hidden bg-[#073a9d] lg:grid-cols-[minmax(0,1.08fr)_minmax(500px,0.92fr)]">
          <AuthBrandPanel mode="recovery" />

          <div className="relative z-10 flex w-full animate-login-card-in flex-col justify-center border border-white bg-white p-5 shadow-[0_24px_75px_rgba(0,28,96,0.22)] sm:p-8 lg:p-10">
            <div className="mb-5 text-center sm:mb-6 lg:text-left">
              <Link
                to="/"
                className="mx-auto inline-flex rounded-full border border-[var(--nav-blue-border)] bg-[var(--nav-blue-soft)] px-4 py-1.5 text-sm font-black text-[var(--nav-blue)] lg:hidden"
              >
                BuyMarket
              </Link>
              <div className="mt-3 flex items-center justify-center gap-3 sm:mt-4 lg:mt-0 lg:justify-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5f3ff] sm:h-14 sm:w-14">
                  {isSent ? (
                    <MailCheck
                      className="h-7 w-7 text-[#0754d8] sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                  ) : (
                    <KeyRound
                      className="h-7 w-7 text-[#0754d8] sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <h1 className="text-3xl font-black tracking-normal text-[#07183c] sm:text-4xl">
                  {isSent ? "Revisá tu email" : "Recuperar contraseña"}
                </h1>
              </div>
              <p className="mt-3 text-base font-medium text-[#64748B]">
                {isSent
                  ? "Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña."
                  : "Ingresá tu email y te enviamos un enlace para restablecerla."}
              </p>
            </div>

            {isSent ? (
              <div className="space-y-5">
                <p className="truncate rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-center text-sm font-bold text-[#0F172A]">
                  {email.trim()}
                </p>

                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="flex h-12 w-full items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-white px-6 text-base font-black text-[#0754b8] transition duration-200 hover:border-[#087af2] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
                >
                  Usar otro email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <p
                    role="alert"
                    className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                  >
                    {error}
                  </p>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#0F172A]">
                    Email
                  </span>
                  <span className="group relative block">
                    <Mail
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition group-focus-within:text-[#087af2] ${
                        error ? "text-red-500" : "text-[#64748B]"
                      }`}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                      aria-invalid={Boolean(error)}
                      className={`h-12 w-full rounded-[14px] border bg-white pl-12 pr-4 text-[15px] font-semibold text-[#0F172A] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#087af2] focus:shadow-[0_0_0_4px_rgba(8,122,242,0.11),0_12px_24px_rgba(8,86,178,0.08)] ${
                        error
                          ? "border-red-300 bg-red-50/40 hover:border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                          : "border-[#E2E8F0] hover:border-slate-300"
                      }`}
                    />
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#087af2,#064bc8)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(8,86,190,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(8,86,190,0.34)] focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span>{isSubmitting ? "Enviando..." : "Enviar enlace"}</span>
                  {!isSubmitting && (
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </form>
            )}

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-[#0754b8] transition hover:text-[#087af2] hover:underline focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
