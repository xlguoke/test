import { Button, Modal, Tag } from 'ant-design-vue'
import type { Delta } from '@vueup/vue-quill'
import { Bug } from 'lucide-vue-next'
import { serializeError } from 'serialize-error'
import type { Envelope, Metadata } from '~/types'
// import '~/main.css'
// import '@vueup/vue-quill/dist/vue-quill.bubble.css'

const EXT_REG = /chrome-extension:/g

export async function captureException(err: Error | unknown) {
  // 打印出具体报错内容，方便调试
  console.warn(err)

  const serializedError = serializeError(err)
  if (EXT_REG.test(serializedError.stack || ''))
    throw new Error('Chrome Extension injected!')
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const metadata: Metadata = {
    user: user.realName,
    username: user.username,
    company: localStorage.getItem('unitCode') || '',
  }
  return await sendEnvelope({
    name: serializedError.name,
    message: serializedError.message,
    stack: serializedError.stack,
    metadata,
  })
}

export function showComplementaryDialog(issueId: string, errorType: string = '未知错误') {
  return new Promise((resolve) => {
    const modal = Modal.confirm({
      // clear the default icon
      icon: null,
      zIndex: Number.MAX_VALUE,
      centered: true,
      title: () => h('div', { style: 'margin-bottom:10px;display:flex;align-items:center;' }, [
        h(Bug, { style: 'font-size: 16px;color: red' }),
        h('span', { style: 'font-size: 16px;margin-left: 10px;' }, errorType),
      ]),
      content: () => h('div', { style: 'width: 97%;margin-left:34px;' }, [
        h('p', [
          '错误代码：',
          h(Tag, { color: 'error' }, () => issueId),
        ]),
        h(
          'div',
          { style: 'min-height: 40px' },
          [
            h('p', { style: 'margin:0' }, [
              '很抱歉，我们的系统遇到了一个未预期的问题。您可以尝试重新操作，若仍出现当前错误，请',
              h('span', { style: 'color: red' }, '不要关闭当前弹窗'),
              '，请您将',
              h('span', { style: 'color: red' }, '全屏进行截图'),
              '后发送给技术支持人员，我们的技术支持团队将尽快响应您的问题，并提供进一步的指导或解决方案。',
            ]),
            h('p', '感谢您的理解和耐心，我们致力于提供最佳的用户体验，并努力解决任何问题。'),
          ],
        ),
      ]),
      footer: h('div', { style: 'padding-right:3%;text-align:right;' }, [
        h(Button, {
          onClick: () => {
            modal.destroy()
            resolve('cancel')
          },
        }, () => '关闭'),
      ]),
    })
  })
}

export async function sendEnvelope(envelope: Envelope) {
  return (await ilisAxios.post<{ id: string }>('api/issues', envelope)).data
}

export async function complementIssue(issueId: string, delta: Delta) {
  return ilisAxios.patch(`api/issues/${issueId}`, delta.ops)
}
