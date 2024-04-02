import type { App, InjectionKey, Ref } from 'vue'
import { ref } from 'vue'
import '../migrations'
import { notification } from 'ant-design-vue'
import { setupMigrator } from 'migration'
import { useCredentialStore } from '@/stores/credentials'
import { translateError } from '@/utils/translateError'
import { credentialInvalidNotice } from '@/utils/credentialInvalidNotice'
import { useUserStore } from '@/stores/users'

export interface Device {
  /**
   * Indicates the device is ready; all the native operations could be performed
   */
  readonly ready: Ref<boolean>
  /**
   * Indicates the device is online
   */
  readonly online: Ref<boolean>
  /**
   * Vue plugin
   * @param app
   */
  install: (app: App) => void
}

export const _DEVICE = Symbol('Cordova device') as InjectionKey<Device>

export function createDevice(): Device {
  const ready = ref(false)
  const online = ref(false)
  const device: Device = {
    ready,
    online,
    install: (app: App) => {
      window.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
        console.error('onerror', event, source, lineno, colno, error)
      }
      window.onunhandledrejection = (e) => {
        const detail = translateError(e.reason)
        notification.error({
          message: detail.message,
          description: detail.description,
        })
      }
      document.addEventListener('deviceready', () => {
        const userStore = useUserStore()
        if (userStore.database) {
          const migrator = setupMigrator(userStore.database)
          migrator.migrate().then(() => {
            ready.value = true
          })
        }
        else {
          ready.value = true
        }
      })

      document.addEventListener('online', () => {
        online.value = true
      })

      document.addEventListener('offline', () => {
        online.value = false
      })

      document.addEventListener('resume', async () => {
        const credentialStore = useCredentialStore()
        if (!await credentialStore.hasValidCredential())
          credentialInvalidNotice()
      })

      app.config.globalProperties.$device = device
      app.provide(_DEVICE, device)
    },
  }
  return device
}
