import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: "admin" | "user" | "seller";
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  exp?: number;
};

const EMAIL_VERIFIED_PREFIX = "email-verified:";

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

export function getEmailVerificationKey(user: Pick<TokenPayload, "id" | "sub" | "email">) {
  const userKey = user.id || user.sub || user.email;

  return userKey ? `${EMAIL_VERIFIED_PREFIX}${userKey}` : null;
}

export function isEmailVerifiedLocally(
  user: Pick<TokenPayload, "id" | "sub" | "email">
) {
  const key = getEmailVerificationKey(user);

  return key ? localStorage.getItem(key) === "true" : false;
}

export function markEmailVerifiedLocally(
  user: Pick<TokenPayload, "id" | "sub" | "email">
) {
  const key = getEmailVerificationKey(user);

  if (key) {
    localStorage.setItem(key, "true");
  }
}

export function isEmailVerifiedFromUser(user?: Pick<TokenPayload, "emailVerified" | "isEmailVerified"> | null) {
  return user?.emailVerified === true || user?.isEmailVerified === true;
}

export function logout() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-change"));
}
