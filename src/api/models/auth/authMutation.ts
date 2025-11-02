import { AuthClient, type RegisterDto, type LoginDto, type AuthResponse } from './authClient'

export const AuthMutation = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const res = await AuthClient.post('/register', data)
    return res.data
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await AuthClient.post('/login', data)
    return res.data
  },
}
