import api from "./axios";

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export const register = async (username: string, email: string, password: string) => {
  const { data } = await api.post<AuthResponse>("/auth/register", { username, email, password });
  return data;
};

export const login = async (username: string, password: string) => {
  const { data } = await api.post<AuthResponse>("/auth/login", { username, password });
  return data;
};
