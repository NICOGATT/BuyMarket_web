import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../shared/services/auth.service";
import axios from "axios";

function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [isSubmiting, setIsSubmiting] = useState(false);

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

        console.log("FORM REGISTER:", form);

        const data = await register(form);

        localStorage.setItem("token", data.accessToken);
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
        <section className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white py-8 shadow-sm">
            <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-slate-950">Crear cuenta</h1>
            <p className="mt-2 text-slate-500">
                Registrate para comprar y vender en Buy Market
            </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <input
                name="firstName"
                placeholder="Nombre"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />
            <input
                name="lastName"
                placeholder="Apellido"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

            <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

            <input
                name="password"
                type="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

            <button
                disabled={isSubmiting}
                className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
                {isSubmiting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
            </form>
        </div>
        </section>
    );
}

export default RegisterPage;
