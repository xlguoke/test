<template>
  <ht-modal
    v-model:open="visible"
    :closable="false"
    :footer="null"
    :z-index="99999999"
  >
    <div class="flex flex-col justify-center w-full min-h-[100px] overflow-hidden">
      <div class="mb-3 text-sm">
        {{ describe }}
      </div>
      <a-progress
        v-if="percent > 0"
        :stroke-color="{
          '0%': '#108ee9',
          '100%': '#87d068',
        }"
        :percent="percent"
      />
      <div v-else class="h-[20px] w-full overflow-hidden rounded">
        <img :src="LoadingImage" class="w-[490px] max-w-[490px] h-[28px] ml-[-3px] mt-[-3px]" />
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import { message, Modal } from 'ant-design-vue'

export interface IProps {
  /** 业务接口地址 */
  api: string
  /** 接口请求方式 */
  method?: 'get' | 'post' | 'put' | 'delete' | 'postForm'
  /** 进度条默认描述信息 */
  description?: string
  /** 接口参数 */
  data?: any
  /** 进度完成回调 */
  onComplete?: (res: any) => void
  /** 进度错误回调 */
  onError?: (err: any) => void
  /** 请求超时回调，参数为关闭进度方法 */
  onTimeout?: (fn: () => void) => void
}

interface ProgressData {
  current: number
  total: number
  notice: string
}

const props = ref<IProps>({
  api: '',
})

let isConnect = false
let timer: any = null
const LoadingImage = new URL('~/assets/img/loading-bar.gif', import.meta.url).href
const visible = ref(false)
const describe = ref('')
const percent = ref(0)

// 显示进度
function showModal(data: IProps) {
  props.value = data || {}
  visible.value = true
  connectSSE()
}

// 显示loading，调用该方法时，仅显示loading状态
function showLoading(description: string) {
  describe.value = description || '加载中，请稍后...'
  visible.value = true
}

function closeModal() {
  isConnect = false
  visible.value = false
  percent.value = 0
  describe.value = ''
  if (timer)
    clearTimeout(timer)
}

/** 连接sse */
function connectSSE() {
  const { api, method = 'get', data = {}, description } = props.value
  describe.value = description || '加载中，请稍后...'
  if (!api) {
    console.error('请传入api地址')
    return
  }

  isConnect = true
  ilisAxios[method](api, data, {
    headers: {
      Accept: 'text/event-stream',
    },
    onDownloadProgress: (res) => {
      sseOnMessage(res.event.target.responseText)
    },
  }).catch((err) => {
    if (err.response && err.response.data)
      sseOnMessage(err.response.data)
    else
      handleError(new Error(err))
  })

  handleTimeout()
}

/** 处理sse返回数据 */
async function sseOnMessage(res: string) {
  if (!isConnect)
    return

  if (res && res.includes('<html>') && res.includes('非法访问，无授权')) {
    handleError(new Error('未授权，无法进行操作！'))
    return
  }

  let events = res ? res.split('\n\n') : []
  events = events.filter(d => !!d)
  if (events.length === 0) {
    closeModal()
    return
  }
  const lastItem = events.pop()
  // 通过axios方式存在获取到不完整数据的情况
  if (!lastItem || lastItem === 'data:')
    return
  const evArr = lastItem.split('\n') as string[]
  try {
    const evMap = parseEventMap(evArr)

    // 获取进度信息错误
    if (evMap.event === 'error') {
      console.error('SSE错误：', evMap)
      handleError(new Error(evMap.data))
      return
    }

    const data = parseResData(evMap.data)
    if (data.code && data.code !== '20000') {
      console.error('业务错误：', res)
      handleError(data)
      return
    }

    // 进度执行完成
    if (data.complete) {
      handleComplete(data.data)
      return
    }
    // 进度执行中
    updateProgress(data)
  }
  catch (err) {
    console.error('SSE数据解析错误：', err)
    handleError(err as Error)
  }
}

/** 解析sse返回数据 */
function parseEventMap(arr: string[]) {
  const map: any = {}
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i]
    if (!d)
      continue
    const ind = d.indexOf(':')
    if (ind !== -1) {
      const key = d.substring(0, ind)
      const value = d.substring(ind + 1)
      map[key] = value
    }
  }
  return map
}

/** 解析sse数据中的data */
function parseResData(dataStr: string) {
  if (!dataStr)
    return {}
  if (typeof dataStr !== 'string')
    return dataStr

  try {
    return JSON.parse(dataStr)
  }
  catch (err) {
    console.error('SSE数据解析错误：', err)
    handleError(err as Error)
    return {}
  }
}

/** 更新进度条 */
function updateProgress(data: ProgressData) {
  const { current, total, notice } = data
  percent.value = total > 1 ? Math.min(Math.floor((current / total) * 100), 100) : 0
  if (notice)
    describe.value = notice
}

/** 请求超时 */
function handleTimeout() {
  if (timer)
    clearTimeout(timer)
  timer = setTimeout(() => {
    if (props.value.onTimeout)
      props.value.onTimeout(closeModal)
  }, 1000 * 60 * 3)
}

/** 判断是否为空数据 */
function isNullData(res: any) {
  const type = Object.prototype.toString.call(res)
  if (type === '[object Object]')
    return JSON.stringify(res) === '{}'
  if (type === '[object Array]')
    return res.length === 0
  return !res
}

/** 请求完成 */
function handleComplete(res: any) {
  if (!isConnect)
    return
  isConnect = false
  // 类型复制功能，进度执行完成后立即执行回调，可能获取不到最新数据
  setTimeout(() => {
    closeModal()
    if (props.value.onComplete) {
      if (isNullData(res)) {
        res = null
      }
      props.value.onComplete(res)
      return
    }
    message.success('操作成功')
  }, 500)
}

/** 错误处理 */
function handleError(err: Error) {
  closeModal()
  if (props.value.onError) {
    props.value.onError(err)
    return
  }
  Modal.error({
    title: '提示',
    content: err.message || '系统异常，请稍后重试或联系系统管理员',
    centered: true,
    okText: '确定',
    zIndex: 99999999, // jsp中调用时，layer弹窗层级太高，导致提示被遮挡
  })
}

defineExpose({
  showModal,
  showLoading,
  closeModal,
})
</script>

<style scoped>
.ant-progress{
  margin: 0;
  height: 16px;
}
:deep(.ant-progress div){
  height: 100% !important;
}
</style>
