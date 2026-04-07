import CryptoJS from "crypto-js"

const key = CryptoJS.enc.Utf8.parse("c6cq2uww4ynf1q4f")

/**
 * 解密
 */
export function decrypt(word: string) {
  const decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypt.toString(CryptoJS.enc.Utf8)
}
