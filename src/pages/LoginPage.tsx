import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../features/auth/components/AuthBrandPanel";
import GoogleAuthButton from "../features/auth/components/GoogleAuthButton";
import { login } from "../shared/services/auth.service";

type LoginFieldName = "email" | "password";
type LoginForm = Record<LoginFieldName, string>;
type LoginErrors = Partial<Record<LoginFieldName, string>>;
type LoginTouched = Partial<Record<LoginFieldName, boolean>>;

type LoginFieldProps = {
  icon: LucideIcon;
  label: string;
  name: LoginFieldName;
  placeholder: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  action?: React.ReactNode;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isGoogleAuthConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

function LoginField({
  icon: Icon,
  label,
  name,
  placeholder,
  type,
  value,
  onChange,
  onBlur,
  error,
  touched,
  action,
}: LoginFieldProps) {
  const showError = Boolean(touched && error);
  const errorId = `${name}-error`;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#0F172A]">{label}</span>
      <span className="group relative block">
        <Icon
          aria-hidden="true"
          className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition group-focus-within:text-[#087af2] ${
            showError ? "text-red-500" : "text-[#64748B]"
          }`}
        />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={name === "email" ? "email" : "current-password"}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          className={`h-12 w-full rounded-[14px] border bg-white pl-12 pr-12 text-[15px] font-semibold text-[#0F172A] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#087af2] focus:shadow-[0_0_0_4px_rgba(8,122,242,0.11),0_12px_24px_rgba(8,86,178,0.08)] ${
            showError
              ? "border-red-300 bg-red-50/40 hover:border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
              : "border-[#E2E8F0] hover:border-slate-300"
          }`}
        />
        {action}
      </span>
      {showError && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-bold text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}

function validateLogin(form: LoginForm): LoginErrors {
  const errors: LoginErrors = {};
  const email = form.email.trim();

  if (!email) {
    errors.email = "Ingresá tu email.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Ingresá un email válido.";
  }

  if (!form.password) {
    errors.password = "Ingresá tu contraseña.";
  }

  return errors;
}

function LoginPage() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<LoginTouched>({});
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [showResetSuccess, setShowResetSuccess] = useState(
    Boolean((location.state as { passwordReset?: boolean } | null)?.passwordReset)
  );
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target as HTMLInputElement & {
      name: LoginFieldName;
    };

    setSubmitError("");
    setShowResetSuccess(false);
    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: value,
      };

      setErrors(validateLogin(nextForm));
      return nextForm;
    });
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { name } = event.target as HTMLInputElement & { name: LoginFieldName };

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors(validateLogin(form));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmiting(true);
      const data = await login({
        email: form.email.trim(),
        password: form.password,
      });
      const token = data.access_token;

      if (!token) {
        setSubmitError("No pudimos iniciar sesión. Intentá nuevamente.");
        return;
      }

      localStorage.setItem("token", token);

      window.dispatchEvent(new Event("auth-change"));
      console.log("LOGIN OK");
      navigate("/");
    } catch (error) {
      console.log("Login Error", error);
      setSubmitError("El email o la contraseña no son correctos.");
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <section className="min-h-svh w-full overflow-hidden bg-[#073a9d]">
      <div className="min-h-svh w-full bg-[#073a9d]">
        <div className="grid min-h-svh w-full items-stretch gap-0 overflow-hidden bg-[#073a9d] lg:grid-cols-[minmax(0,1.08fr)_minmax(500px,0.92fr)]">
          <AuthBrandPanel mode="login" />

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
                  <UserRound className="h-7 w-7 text-[#0754d8] sm:h-8 sm:w-8" aria-hidden="true" />
                </span>
                <h1 className="text-3xl font-black tracking-normal text-[#07183c] sm:text-4xl">
                  Iniciar sesión
                </h1>
              </div>
              <p className="mt-3 text-base font-medium text-[#64748B]">
                Entrá para comprar y vender cerca tuyo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {showResetSuccess && (
                <p
                  role="status"
                  className="rounded-[14px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
                >
                  Tu contraseña se actualizó. Iniciá sesión con la nueva.
                </p>
              )}

              {submitError && (
                <p
                  role="alert"
                  className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                >
                  {submitError}
                </p>
              )}

              <LoginField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
              />

              <LoginField
                icon={LockKeyhole}
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresá tu contraseña"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                action={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-blue-50 hover:text-[#0754b8] focus:outline-none focus:ring-2 focus:ring-[#087af2]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-[#0754b8] transition hover:text-[#087af2] hover:underline focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmiting}
                className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#087af2,#064bc8)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(8,86,190,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(8,86,190,0.34)] focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>{isSubmiting ? "Ingresando..." : "Entrar"}</span>
                {!isSubmiting && <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />}
              </button>
            </form>

            {isGoogleAuthConfigured && (
              <>
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                  <span className="text-sm font-bold text-[#64748B]">o continuar con</span>
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <GoogleAuthButton />
              </>
            )}

            <p className="mt-5 text-center text-sm font-semibold text-[#64748B]">
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="font-black text-[#0754b8] transition hover:text-[#087af2] hover:underline focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
              >
                Crear una cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
