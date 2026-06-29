import { useState } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Map,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthButton from "../features/auth/components/GoogleAuthButton";
import { register } from "../shared/services/auth.service";

type RegisterFieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword";

type RegisterFieldProps = {
  icon: LucideIcon;
  label: string;
  name: RegisterFieldName;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  action?: React.ReactNode;
};

const decorativeItems = [
  { Icon: Package, className: "left-[12%] top-[18%] rotate-[-12deg]" },
  { Icon: ShoppingBag, className: "right-[15%] top-[22%] rotate-[14deg]" },
  { Icon: Map, className: "bottom-[20%] left-[18%] rotate-[10deg]" },
  { Icon: MapPin, className: "bottom-[26%] right-[20%] rotate-[-8deg]" },
  { Icon: Package, className: "right-[8%] top-[54%] rotate-[18deg]" },
];

function RegisterField({
  icon: Icon,
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  action,
}: RegisterFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#0F172A]">{label}</span>
      <span className="group relative block">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B] transition group-focus-within:text-[#2563EB]"
        />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          className="h-[52px] w-full rounded-[14px] border border-[#E2E8F0] bg-white pl-12 pr-12 text-[15px] font-semibold text-[#0F172A] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.10),0_12px_24px_rgba(37,99,235,0.08)]"
        />
        {action}
      </span>
    </label>
  );
}

function BuyMarketLogo() {
  return (
    <Link
      to="/"
      aria-label="Ir al inicio de BuyMarket"
      className="mx-auto flex w-fit items-center gap-3 rounded-full px-3 py-2 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_14px_32px_rgba(37,99,235,0.26)]">
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-2xl font-black tracking-normal text-[#0F172A]">
        BuyMarket
      </span>
    </Link>
  );
}

function RegisterBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#2563EB]/10 blur-3xl" />
      <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/25 blur-3xl" />

      <div className="absolute inset-0 hidden sm:block">
        {decorativeItems.map(({ Icon, className }, index) => (
          <div
            key={index}
            className={`absolute flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#E2E8F0]/80 bg-white/50 text-[#2563EB]/20 shadow-sm backdrop-blur-sm ${className}`}
          >
            <Icon className="h-7 w-7" />
          </div>
        ))}

        <div className="absolute left-[25%] top-[32%] h-2 w-2 rounded-full bg-[#2563EB]/20" />
        <div className="absolute right-[32%] top-[18%] h-2.5 w-2.5 rounded-full bg-[#2563EB]/15" />
        <div className="absolute bottom-[18%] right-[36%] h-3 w-3 rounded-full bg-[#1D4ED8]/15" />
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmiting, setIsSubmiting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (passwordError) {
      setPasswordError("");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    const registerPayload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
    };

    try {
      setIsSubmiting(true);

      console.log("FORM REGISTER:", registerPayload);

      const data = await register(registerPayload);
      const token = data.access_token ?? data.accessToken;

      if (!token) {
        throw new Error("El backend no devolvió token.");
      }

      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("auth-change"));

      navigate("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Register error:", error.response?.data || error.message);
        return;
      }

      console.error("Register error:", error);
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <section className="-mx-4 -my-8 min-h-[calc(100svh-154px)] overflow-hidden bg-[#F8FAFC] sm:-mx-6 lg:-mx-8">
      <div className="relative flex min-h-[calc(100svh-154px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34%),linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_50%,#EFF6FF_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <RegisterBackground />

        <div className="relative z-10 w-full max-w-[520px] animate-login-card-in rounded-[24px] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12),0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <BuyMarketLogo />
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#64748B]">
                <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                Publicá, comprá y conectá cerca
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-normal text-[#0F172A] sm:text-4xl">
              Crear cuenta
            </h1>
            <p className="mt-3 text-base font-medium text-[#64748B]">
              Sumate a BuyMarket y empezá a comprar y vender cerca tuyo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <RegisterField
                icon={User}
                label="Nombre"
                name="firstName"
                placeholder="Tu nombre"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
              />

              <RegisterField
                icon={User}
                label="Apellido"
                name="lastName"
                placeholder="Tu apellido"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
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
              autoComplete="email"
            />

            <RegisterField
              icon={LockKeyhole}
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Creá una contraseña segura"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              action={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-slate-100 hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
              autoComplete="new-password"
              action={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-slate-100 hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              }
            />

            {passwordError && (
              <p
                role="alert"
                className="-mt-2 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
              >
                {passwordError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmiting}
              className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.26)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.32)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmiting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-sm font-bold text-[#64748B]">o continuar con</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <GoogleAuthButton />

          <p className="mt-7 text-center text-sm font-semibold text-[#64748B]">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="font-black text-[#2563EB] transition hover:text-[#1D4ED8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
