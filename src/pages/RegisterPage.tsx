import { useState } from "react";
import axios from "axios";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, User, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../features/auth/components/AuthBrandPanel";
import GoogleAuthButton from "../features/auth/components/GoogleAuthButton";
import { register } from "../shared/services/auth.service";

type RegisterFieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword";
type RegisterForm = Record<RegisterFieldName, string>;
type RegisterErrors = Partial<Record<RegisterFieldName, string>>;
type RegisterTouched = Partial<Record<RegisterFieldName, boolean>>;

type RegisterFieldProps = {
  icon: LucideIcon;
  label: string;
  name: RegisterFieldName;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  touched?: boolean;
  action?: React.ReactNode;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isGoogleAuthConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

function RegisterField({
  icon: Icon,
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  autoComplete,
  error,
  touched,
  action,
}: RegisterFieldProps) {
  const showError = Boolean(touched && error);
  const errorId = `${name}-error`;

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-[#0F172A]">{label}</span>
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
          autoComplete={autoComplete}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          className={`h-11 w-full rounded-[14px] border bg-white pl-11 pr-11 text-sm font-semibold text-[#0F172A] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#087af2] focus:shadow-[0_0_0_4px_rgba(8,122,242,0.11),0_12px_24px_rgba(8,86,178,0.08)] ${
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

function validateRegister(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim();

  if (!firstName) {
    errors.firstName = "Ingresá tu nombre.";
  }

  if (!lastName) {
    errors.lastName = "Ingresá tu apellido.";
  }

  if (!email) {
    errors.email = "Ingresá tu email.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Ingresá un email válido.";
  }

  if (!form.password) {
    errors.password = "Creá una contraseña.";
  } else if (form.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Repetí tu contraseña.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}

function getRegisterErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "No pudimos crear la cuenta. Intentá nuevamente.";
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return String(message[0]);
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.response?.status === 409) {
    return "Ya existe una cuenta con ese email.";
  }

  return "No pudimos crear la cuenta. Revisá los datos e intentá nuevamente.";
}

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<RegisterTouched>({});
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmiting, setIsSubmiting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target as HTMLInputElement & {
      name: RegisterFieldName;
    };

    setSubmitError("");
    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: value,
      };

      setErrors(validateRegister(nextForm));
      return nextForm;
    });
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { name } = event.target as HTMLInputElement & {
      name: RegisterFieldName;
    };

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors(validateRegister(form));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const registerPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    try {
      setIsSubmiting(true);

      const data = await register(registerPayload);
      const token = data.access_token ?? data.accessToken;

      if (!token) {
        setSubmitError("No pudimos iniciar la sesión después de crear la cuenta.");
        return;
      }

      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("auth-change"));

      navigate("/");
    } catch (error: unknown) {
      console.error("Register error:", axios.isAxiosError(error) ? error.response?.data || error.message : error);
      setSubmitError(getRegisterErrorMessage(error));
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <section className="min-h-svh w-full overflow-hidden bg-[#073a9d]">
      <div className="min-h-svh w-full bg-[#073a9d]">
        <div className="grid min-h-svh w-full items-stretch gap-0 overflow-hidden bg-[#073a9d] lg:grid-cols-[minmax(0,1.08fr)_minmax(500px,0.92fr)]">
          <AuthBrandPanel mode="register" />

          <div className="relative z-10 flex w-full animate-login-card-in flex-col justify-center border border-white bg-white px-5 py-4 shadow-[0_24px_75px_rgba(0,28,96,0.22)] sm:px-8 sm:py-5 lg:px-10">
            <div className="mb-3 text-center lg:text-left">
              <Link
                to="/"
                className="mx-auto inline-flex rounded-full border border-[var(--nav-blue-border)] bg-[var(--nav-blue-soft)] px-4 py-1.5 text-sm font-black text-[var(--nav-blue)] lg:hidden"
              >
                BuyMarket
              </Link>
              <div className="mt-3 flex items-center justify-center gap-3 lg:mt-0 lg:justify-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5f3ff] sm:h-14 sm:w-14">
                  <UserRound className="h-7 w-7 text-[#0754d8] sm:h-8 sm:w-8" aria-hidden="true" />
                </span>
                <h1 className="text-3xl font-black tracking-normal text-[#07183c] sm:text-4xl">
                  Crear cuenta
                </h1>
              </div>
              <p className="mt-1 text-sm font-medium text-[#64748B] sm:text-base">
                Publicá, comprá y conectá con personas cerca tuyo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {submitError && (
                <p
                  role="alert"
                  className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                >
                  {submitError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <RegisterField
                  icon={User}
                  label="Nombre"
                  name="firstName"
                  placeholder="Tu nombre"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="given-name"
                  error={errors.firstName}
                  touched={touched.firstName}
                />

                <RegisterField
                  icon={User}
                  label="Apellido"
                  name="lastName"
                  placeholder="Tu apellido"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="family-name"
                  error={errors.lastName}
                  touched={touched.lastName}
                />
              </div>

              <RegisterField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                error={errors.email}
                touched={touched.email}
              />

              <RegisterField
                icon={LockKeyhole}
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Creá una contraseña segura"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
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

              <RegisterField
                icon={LockKeyhole}
                label="Confirmar contraseña"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repetí tu contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                action={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-blue-50 hover:text-[#0754b8] focus:outline-none focus:ring-2 focus:ring-[#087af2]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={isSubmiting}
                className="flex h-11 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#087af2,#064bc8)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(8,86,190,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(8,86,190,0.34)] focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>{isSubmiting ? "Creando cuenta..." : "Crear cuenta"}</span>
                {!isSubmiting && <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />}
              </button>
            </form>

            {isGoogleAuthConfigured && (
              <>
                <div className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                  <span className="text-sm font-bold text-[#64748B]">o continuar con</span>
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <GoogleAuthButton />
              </>
            )}

            <p className="mt-3 text-center text-sm font-semibold text-[#64748B]">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="font-black text-[#0754b8] transition hover:text-[#087af2] hover:underline focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
