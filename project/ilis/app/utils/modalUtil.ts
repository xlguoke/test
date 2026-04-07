import { message, Modal, Textarea } from 'ant-design-vue'

/** 确认弹窗 */
export async function modalConfirm(content: string | VNode, title?: string, config?: any): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.confirm({
      title: title || '提示',
      content,
      okText: config?.okText || '确定',
      cancelText: config?.cancelText || '取消',
      centered: true,
      onOk() {
        resolve(true)
      },
      onCancel() {
        resolve(false)
      },
    })
  })
}

/** 意见弹窗 */
export async function opinionModal(title?: string, vNode?: VNode[], config?: {
  subTitle?: string
  placeholder?: string
}): Promise<string> {
  const placeholder = config?.placeholder || '请输入意见'
  return new Promise((resolve) => {
    const comment = ref('')
    Modal.confirm({
      title: title || '意见填写',
      content: h('div', { style: { padding: '10px 0' } }, [
        h('p', { style: { marginBottom: '4px' } }, [
          h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
          config?.subTitle || '意见填写：',
        ]),
        h(Textarea, {
          placeholder,
          style: { width: '100%' },
          onChange(e: any) {
            comment.value = e.target?.value || ''
          },
        }),
        ...(vNode || []),
      ]),
      okText: '确定',
      cancelText: '取消',
      centered: true,
      async onOk() {
        if (!comment.value) {
          message.warn(placeholder)
          return Promise.reject(new Error(placeholder))
        }
        resolve(comment.value)
      },
      onCancel() {
        resolve('')
      },
    })
  })
}

/** 错误提示 */
export function modalError(msg: string | VNode, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}

/** 信息提示 */
export function modalInfo(msg: string | VNode, title?: string) {
  Modal.info({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}
