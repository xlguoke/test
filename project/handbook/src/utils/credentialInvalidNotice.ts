import { getLogger } from '@ilis/cordova-plugin-log4c'
import router from '@/router'

const log = getLogger('credentialInvalidNotice')

export function credentialInvalidNotice() {
  const onClose = () => router.replace({ name: 'Login' })
  showDialog({
    title: '请重新登录',
    message: '无效或已过期的登录凭证',
    showCancelButton: true,
  }).then(() => {
    onClose().catch(log.error)
  }).catch(() => {
  })
}
