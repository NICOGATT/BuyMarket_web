import { useState } from "react";
import axios from "axios";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthBrandPanel from "../features/auth/components/AuthBrandPanel";
import { resetPassword } from "../shared/services/auth.service";

type ResetFieldName = "password" | "confirmPassword";
type ResetForm = Record<ResetFieldName, string>;
type ResetErrors = Partial<Record<ResetFieldName, string>>;
type ResetTouched = Partial<Record<ResetFieldName, boolean>>;

type ResetFieldProps = {
  icon: LucideIcon;
  label: string;
  name: ResetFieldName;
  placeholder: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  action?: React.ReactNode;
};

function ResetField({
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
}: ResetFieldProps) {
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
          autoComplete="new-password"
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

function validateReset(form: ResetForm): ResetErrors {
  const errors: ResetErrors = {};

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

function getResetPasswordErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response) {
    return "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  const status = error.response.status;

  if (status === 400 || status === 401 || status === 404 || status === 410) {
    return "El enlace no es válido o ya expiró. Solicitá uno nuevo.";
  }

  return "No pudimos actualizar tu contraseña. Intentá nuevamente en unos minutos.";
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const hasToken = token.length > 0;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ResetErrors>({});
  const [touched, setTouched] = useState<ResetTouched>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [form, setForm] = useState<ResetForm>({
    password: "",
    confirmPassword: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target as HTMLInputElement & {
      name: ResetFieldName;
    };

    setSubmitError("");
    setForm((prev) => {
      const nextForm = { ...prev, [name]: value };

      setErrors(validateReset(nextForm));
      return nextForm;
    });
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { name } = event.target as HTMLInputElement & { name: ResetFieldName };

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateReset(form));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = validateReset(form);
    setErrors(nextErrors);
    setTouched({ password: true, confirmPassword: true });
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmiting(true);
      await resetPassword({ token, password: form.password });
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (error: unknown) {
      console.error(
        "Reset password error:",
        axios.isAxiosError(error) ? error.response?.data || error.message : error
      );
      setSubmitError(getResetPasswordErrorMessage(error));
    } finally {
      setIsSubmiting(false);
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
                  {hasToken ? (
                    <LockKeyhole
                      className="h-7 w-7 text-[#0754d8] sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShieldAlert
                      className="h-7 w-7 text-[#0754d8] sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <h1 className="text-3xl font-black tracking-normal text-[#07183c] sm:text-4xl">
                  {hasToken ? "Elegí tu nueva contraseña" : "Enlace inválido"}
                </h1>
              </div>
              <p className="mt-3 text-base font-medium text-[#64748B]">
                {hasToken
                  ? "Creá una contraseña nueva para tu cuenta."
                  : "Este enlace no es válido o ya venció. Pedí uno nuevo desde la pantalla de recuperación."}
              </p>
            </div>

            {hasToken ? (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {submitError && (
                  <p
                    role="alert"
                    className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
                  >
                    {submitError}
                  </p>
                )}

                <ResetField
                  icon={LockKeyhole}
                  label="Contraseña nueva"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Creá una contraseña segura"
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

                <ResetField
                  icon={LockKeyhole}
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repetí tu contraseña"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                  className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#087af2,#064bc8)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(8,86,190,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(8,86,190,0.34)] focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span>{isSubmiting ? "Actualizando..." : "Actualizar contraseña"}</span>
                  {!isSubmiting && (
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </form>
            ) : (
              <Link
                to="/forgot-password"
                className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#087af2,#064bc8)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(8,86,190,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(8,86,190,0.34)] focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
              >
                Solicitar un nuevo enlace
              </Link>
            )}

            <p className="mt-6 text-center text-sm font-semibold text-[#64748B]">
              <Link
                to="/login"
                className="font-black text-[#0754b8] transition hover:text-[#087af2] hover:underline focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResetPasswordPage;
