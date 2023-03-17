import { userLocalStorage } from "./index"
const TokenKey = "Token"

export function getToken(): string {
  return userLocalStorage.get(TokenKey)
}

export function setToken(token: string): void {
  userLocalStorage.set(TokenKey, token)
}

export function removeToken(): void {
  userLocalStorage.remove(TokenKey)
}
