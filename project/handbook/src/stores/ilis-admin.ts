import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIlisAdmin = defineStore('ilisAdmin', () => {
  const auth = ref(__AUTH_BASE__)
  return { auth }
})
