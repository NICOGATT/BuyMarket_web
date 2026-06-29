import { useState } from "react";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthButton from "../features/auth/components/GoogleAuthButton";
import { login } from "../shared/services/auth.service";

type LoginFieldProps = {
  icon: LucideIcon;
  label: string;
  name: "email" | "password";
  placeholder: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  action?: React.ReactNode;
};

const decorativeItems = [
  { Icon: Package, className: "left-[12%] top-[18%] rotate-[-12deg]" },
  { Icon: ShoppingBag, className: "right-[15%] top-[22%] rotate-[14deg]" },
  { Icon: Map, className: "bottom-[20%] left-[18%] rotate-[10deg]" },
  { Icon: MapPin, className: "bottom-[26%] right-[20%] rotate-[-8deg]" },
  { Icon: Package, className: "right-[8%] top-[54%] rotate-[18deg]" },
];

function LoginField({
  icon: Icon,
  label,
  name,
  placeholder,
  type,
  value,
  onChange,
  action,
}: LoginFieldProps) {
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
          autoComplete={name === "email" ? "email" : "current-password"}
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

function LoginBackground() {
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

function LoginPage() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setIsSubmiting(true);
      const data = await login(form);
      const token = data.access_token;

      if (!token) {
        alert("El backend no devolvió accessToken");
      }

      localStorage.setItem("token", token);

      window.dispatchEvent(new Event("auth-change"));
      console.log("LOGIN OK");
      navigate("/");
    } catch (error) {
      console.log("Login Error", error);
      alert("Credenciales inválidas");
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <section className="-mx-4 -my-8 min-h-[calc(100svh-154px)] overflow-hidden bg-[#F8FAFC] sm:-mx-6 lg:-mx-8">
      <div className="relative flex min-h-[calc(100svh-154px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34%),linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_50%,#EFF6FF_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <LoginBackground />

        <div className="relative z-10 w-full max-w-[456px] animate-login-card-in rounded-[24px] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12),0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <BuyMarketLogo />
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#64748B]">
                <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                Tu mercado local, en un toque
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-normal text-[#0F172A] sm:text-4xl">
              Iniciar sesión
            </h1>
            <p className="mt-3 text-base font-medium text-[#64748B]">
              Comprá y vendé cerca tuyo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <LoginField
              icon={Mail}
              label="Email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
            />

            <LoginField
              icon={LockKeyhole}
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresá tu contraseña"
              value={form.password}
              onChange={handleChange}
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-[#2563EB] transition hover:text-[#1D4ED8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmiting}
              className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.26)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.32)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
            No tenés cuenta?{" "}
            <Link
              to="/register"
              className="font-black text-[#2563EB] transition hover:text-[#1D4ED8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
            >
              Crear una cuenta
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
