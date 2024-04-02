import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'

export const useUdrScript = defineStore('udrScript', () => {
  const online = ref('asset://www/init-udr-online.js')
  const offline = ref('asset://www/offline.js')
  function setScript(script: string, ref: Ref<string>) {
    try {
      const resource = new URL(script)
      ref.value = resource.href
    }
    catch (e) {
      console.warn(`fail to set ${script} as script`, e)
    }
  }
  function setOnlineScript(script: string) {
    setScript(script, online)
  }
  function setOfflineScript(script: string) {
    setScript(script, offline)
  }
  return { online, setOnlineScript, offline, setOfflineScript }
})
