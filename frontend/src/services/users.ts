import api from './api'

export interface User {
  id: string
  name: string
}

export async function getUser(userId: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${userId}`)
  return data
}
