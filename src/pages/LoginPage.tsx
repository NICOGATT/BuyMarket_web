import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
          className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition group-focus-within:text-[#2D006B] ${
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
          className={`h-[52px] w-full rounded-[14px] border bg-white pl-12 pr-12 text-[15px] font-semibold text-[#0F172A] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#2D006B] focus:shadow-[0_0_0_4px_rgba(45,0,107,0.10),0_12px_24px_rgba(45,0,107,0.08)] ${
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
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target as HTMLInputElement & {
      name: LoginFieldName;
    };

    setSubmitError("");
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
    <section className="-mx-4 -my-8 min-h-[calc(100svh-154px)] overflow-hidden bg-[#F8FAFC] sm:-mx-6 lg:-mx-8">
      <div className="relative min-h-[calc(100svh-154px)] bg-[radial-gradient(circle_at_top_left,rgba(18,60,105,0.12),transparent_32%),linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_48%,#EAF4FF_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100svh-218px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)]">
          <AuthBrandPanel mode="login" />

          <div className="relative z-10 w-full animate-login-card-in rounded-[24px] border border-white/80 bg-white/94 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12),0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-10">
            <div className="mb-8 text-center">
              <Link
                to="/"
                className="mx-auto inline-flex rounded-full border border-[var(--nav-blue-border)] bg-[var(--nav-blue-soft)] px-4 py-1.5 text-sm font-black text-[var(--nav-blue)] lg:hidden"
              >
                BuyMarket
              </Link>
              <h1 className="mt-5 text-3xl font-black tracking-normal text-[#0F172A] sm:text-4xl">
                Iniciar sesión
              </h1>
              <p className="mt-3 text-base font-medium text-[#64748B]">
                Entrá para comprar y vender cerca tuyo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-slate-100 hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2D006B]"
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
                  className="text-sm font-bold text-[#2D006B] transition hover:text-[#240055] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2D006B] focus:ring-offset-2"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmiting}
                className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-gradient-to-b from-[var(--brand)] to-[var(--brand-hover)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(45,0,107,0.26)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(45,0,107,0.32)] focus:outline-none focus:ring-2 focus:ring-[#2D006B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmiting ? "Ingresando..." : "Entrar"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-sm font-bold text-[#64748B]">o continuar con</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <GoogleAuthButton />

            <p className="mt-7 text-center text-sm font-semibold text-[#64748B]">
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="font-black text-[#2D006B] transition hover:text-[#240055] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2D006B] focus:ring-offset-2"
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
