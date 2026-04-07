import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import useAppStore from './modules/app'
import { useUserStore } from './modules/user'
import { usePermissionStore } from './modules/permissionStore'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { useAppStore, useUserStore, usePermissionStore }
export default pinia
