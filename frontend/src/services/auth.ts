import api from './api'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}
