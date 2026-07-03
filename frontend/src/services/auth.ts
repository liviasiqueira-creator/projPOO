import api from './api'

interface UserPayload {
  email: string
  password: string
}

interface RegisterPayload extends UserPayload {
  name: string
  role?: 'client' | 'barber'
}

interface LoginResponse {
  accessToken: string;
  role: 'client' | 'barber'
}

export async function login(payload: UserPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

interface RegisterResponse {
  accessToken: string
}

export async function createUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/auth/register', payload)
  return data;
}

export interface Me {
  id: string
  name: string
  email: string
  role: 'client' | 'barber' | 'admin'
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>('/auth/me')
  return data
}
