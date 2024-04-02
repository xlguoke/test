import { Button, notification } from 'ant-design-vue'
import { h } from 'vue'
import router from '@/router'

export function credentialInvalidNotice() {
  const key = `open${Date.now()}`
  const onClose = () => router.replace({ name: 'Login' })
  notification.error({
    message: '无效或已过期的登录凭证',
    description: '请重新登录',
    duration: 0,
    btn: () =>
      h(
        Button,
        {
          type: 'primary',
          size: 'small',
          onClick: () => {
            notification.close(key)
            onClose().catch(console.error)
          },
        },
        { default: () => '确认' },
      ),
    key,
    onClose,
  })
}
