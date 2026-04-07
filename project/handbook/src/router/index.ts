import { createRouter, createWebHistory } from 'vue-router'
import routerDatas from './modules/menuTreeDatas'
import { useCredentialStore } from '@/stores/credentials'
import { InvalidTokenError } from '@/type/errors'
import { credentialInvalidNotice } from '@/utils/credentialInvalidNotice'

// 白名单
// const whiteList = ['/login', '/404', '/error']

const router = createRouter({
  history: createWebHistory(),
  routes: routerDatas,
})

router.beforeEach(async (to) => {
  if (to.name === 'Login')
    return true
  const credentialStore = useCredentialStore()
  if (!await credentialStore.hasValidCredential())
    throw new InvalidTokenError()
})

router.onError((e, _to, from) => {
  if (from.name === 'Login')
    return
  if (e instanceof InvalidTokenError)
    credentialInvalidNotice()
})

export default router
