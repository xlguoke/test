import CryptoJS from 'crypto-js'

const keyBase64 = 'o9szYIOq1rRMiouNhNvaq96lqUvCekxR'
const key = CryptoJS.enc.Base64.parse(keyBase64)

/**
 * 加密
 */
export function encrypt(word: string) {
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}
//
/**
 * 解密
 */
export function decrypt(word: string | null) {
  const decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypt.toString(CryptoJS.enc.Utf8)
}

/**
 * 加密存入localStorage
 */
export function encryptLocalStorage(key: string, value: string) {
  localStorage.setItem(key, encrypt(value))
}

/**
 * 解密localStorage
 */
export function decryptLocalStorage(key: string) {
  return decrypt(localStorage.getItem(key))
}
