import { ref } from 'vue'
import { getLogger } from '@ilis/cordova-plugin-log4c'

const log = getLogger('useNetwork')

export function useNetwork() {
  const online = ref(false)
  document.addEventListener('online', () => {
    online.value = true
    if (__PROD__) {
      fetch('https://bing.com')
        .catch((err) => {
          log.warn('received device online signal, but got spurious network', err)
          online.value = false
        })
    }
  })

  document.addEventListener('offline', () => {
    online.value = false
  })
  return { online }
}
