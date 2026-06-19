import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../shared/services/auth.service";

function LoginPage() {
    const [isSubmiting, setIsSubmiting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // const [isLoadig, setIsLoading] = useState(false)
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

            if(!token) {
                alert("El backend no devolvio accessToken")
            }
            
            localStorage.setItem("token", token);
            
            window.dispatchEvent(new Event("auth-change"));
            console.log("LOGIN OK");
            navigate("/");
        } catch (error) {
            console.log("Login Error");
            alert("Credenciales invalidas");
        } finally {
            setIsSubmiting(false);
        }
    }

    return (
        <section className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-slate-950">Iniciar sesion</h1>

            <p className="mt-2 text-slate-500">
                Accede a tu cuenta de BuyMarket.
            </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

            <div className="relative">
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contrasena"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-600"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <button
                disabled={isSubmiting}
                className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
                {isSubmiting ? "Ingresando..." : "Entrar"}
            </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                No tenes cuenta?{" "}
                <Link
                    to="/register"
                    className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                    Registrate
                </Link>
            </p>
        </div>
        </section>
    );
}

export default LoginPage;
