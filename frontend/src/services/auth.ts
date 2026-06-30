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

export async function createUser(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload)
  return data;
}
