import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../../../shared/services/auth.service";
import type { GoogleAuthResponse } from "../../../shared/types/Auth";

function getAuthToken(response: GoogleAuthResponse) {
  return response.access_token ?? response.accessToken ?? response.token ?? "";
}

function GoogleAuthButton() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const configurationError = import.meta.env.VITE_GOOGLE_CLIENT_ID
    ? ""
    : "Falta configurar Google.";

  async function handleGoogleCredential(idToken?: string) {
    if (!idToken) {
      setError("Google no devolvio credenciales.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const data = await loginWithGoogle({ idToken });
      const token = getAuthToken(data);

      if (!token) {
        setError("El backend no devolvio token.");
        return;
      }

      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (authError) {
      if (axios.isAxiosError(authError)) {
        if (authError.response?.status === 401) {
          setError(
            "Google no pudo validar la sesion. Revisa la configuracion del cliente OAuth."
          );
          return;
        }

        if (authError.response?.status === 404) {
          setError(
            "El backend no encontro /auth/google. Revisa que VITE_API_URL apunte al ngrok/backend correcto."
          );
          return;
        }
      }

      setError("No pudimos iniciar sesion con Google.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div
        className={`flex min-h-[52px] w-full items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-white px-3 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] ${
          isLoading || configurationError ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {isLoading ? (
          <span className="text-base font-black text-[#0F172A]">Conectando...</span>
        ) : (
          <GoogleLogin
            onSuccess={(credentialResponse) =>
              handleGoogleCredential(credentialResponse.credential)
            }
            onError={() => setError("No pudimos abrir Google. Intenta nuevamente.")}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="360"
          />
        )}
      </div>

      {(configurationError || error) && (
        <p
          role="alert"
          className="mt-3 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
        >
          {configurationError || error}
        </p>
      )}
    </div>
  );
}

export default GoogleAuthButton;
