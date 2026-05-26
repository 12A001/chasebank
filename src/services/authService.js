//
import api from './api'

// LOGIN
export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}
