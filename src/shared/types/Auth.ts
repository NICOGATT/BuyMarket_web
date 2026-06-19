export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type RegisterPayload = {
  firstName : string; 
  lastName : string; 
  email : string ; 
  password : string; 
}

export type RegisterResponse = {
  accessToken: string;
};

export type TokenPayload = {
  sub?: string;
  id?: string;
  email?: string;
  firstName?: string;
  role?: "admin" | "user" | "seller";
};