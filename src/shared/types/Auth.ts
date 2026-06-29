export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type AuthTokenResponse = {
  access_token?: string;
  accessToken?: string;
  token?: string;
};

export type RegisterPayload = {
  firstName : string; 
  lastName : string; 
  email : string ; 
  password : string; 
}

export type RegisterResponse = {
  accessToken?: string;
  access_token?: string;
};

export type SendVerificationCodeResponse = {
  message?: string;
};

export type AuthUser = {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  role?: "admin" | "user" | "seller";
  emailVerified?: boolean;
  isEmailVerified?: boolean;
};

export type VerifyEmailPayload = {
  code: string;
};

export type VerifyEmailResponse = {
  message?: string;
  access_token?: string;
  accessToken?: string;
  emailVerified?: boolean;
  isEmailVerified?: boolean;
};

export type GoogleAuthPayload = {
  idToken: string;
};

export type GoogleAuthResponse = AuthTokenResponse & {
  message?: string;
  user?: AuthUser;
};

export type TokenPayload = AuthUser;
