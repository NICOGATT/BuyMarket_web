import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: "admin" | "user" | "seller";
  exp?: number;
};

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserFromToken() {
  const token = getToken();

  if (!token) return null;

  try {
    const decodedToken = jwtDecode<TokenPayload>(token);

    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      logout();
      return null;
    }

    return decodedToken;
  } catch {
    logout();
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-change"));
}
