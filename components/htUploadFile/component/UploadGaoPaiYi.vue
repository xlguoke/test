<template>
  <div class="gaopaiyi-wrapper">
    <VideoCameraOutlined />
    <p>
      {{ hintText }}
      <span v-if="!connectable && !disabled" class="download-link" @click="downloadGaoPaiYi">
        插件下载
      </span>
    </p>
    <a-button type="primary" :loading="disabled" @click="openGPYModal">
      {{ connectable ? "启动高拍仪" : "连接并启动高拍仪" }}
    </a-button>

    <UploadModal
      v-model="gpyVisible"
      title="高拍仪"
      hide-full-screen
      destroy-on-close
      ok-text="上传文件"
      :business-type="businessType"
      @ok="gpyUploadFile"
      @cancel="closeConnect"
    >
      <GaoPaiYi ref="gaoPaiYiRef" @cancel="closeConnect" />
    </UploadModal>

    <UploadModal
      v-model="visible"
      title="高拍仪导出文件上传结果"
      hide-full-screen
      hide-close-icon
      hide-ok-btn
      width="800px"
      auto-height
      @cancel="closeVisible"
    >
      <a-table :data-source="scanFileDatas" :columns="columns" :pagination="false">
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tooltip v-if="text === '上传失败'" placement="left">
              <template #title>
                <span>{{ record.failMsg }}</span>
              </template>
              <span style="color: red">{{ text }}</span>
            </a-tooltip>
            <span v-else>{{ text }}</span>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-button v-if="record.status === '上传失败'" type="link" @click="reUpload(record)">
              重新上传
            </a-button>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>
    </UploadModal>
  </div>
</template>

<script lang="ts" setup>
import { Modal } from 'ant-design-vue'
import {
  VideoCameraOutlined,
} from '@ant-design/icons-vue'
import UploadModal from './UploadModal.vue'
import GaoPaiYi from './GaoPaiYi.vue'
import { useCommonUpload } from './commonUpload'

const props = defineProps<{
  qrCodeKey: string
  businessType: string
  accept?: string[] // 接受上传的文件类型
}>()

const emits = defineEmits(['load'])

const gaoPaiYiRef = ref()

const qrCodeKeyRefValue = ref(props.qrCodeKey)

watch(() => props.qrCodeKey, (val) => {
  qrCodeKeyRefValue.value = val
})

const {
  FILE_SIZE,
  httpUpload,
  createScript,
} = useCommonUpload({
  qrCodeKey: qrCodeKeyRefValue,
  uploadWay: 'GPY',
  accept: props.accept,
})

const isDev = import.meta.env.DEV

const columns = [
  { title: '文件名称', dataIndex: 'name', key: 'name' },
  { title: '文件类型', dataIndex: 'type', key: 'type' },
  { title: '文件大小', dataIndex: 'size', key: 'size' },
  {
    title: '上传状态',
    dataIndex: 'status',
    key: 'status',
  },
  { title: '操作', dataIndex: 'action', key: 'action' },
]

const connectable = ref(false) // 高拍仪服务连接状态

const gpyCount = ref(0) // 高拍仪设备数量

const hintText = ref('正在检查高拍仪状态...')

const disabled = ref(false)

const visible = ref(false)

const gpyVisible = ref(false)

const scanFileDatas = ref([] as any[])

/**
 * 与高拍仪建立websocket连接
 * @param {boolean} flag 预连接，只检查是否可连接高拍仪服务，检查完成后关闭连接
 */
async function connectGaoPaiYi(flag = false) {
  return await new Promise((resolve) => {
    disabled.value = true
    hintText.value = '正在检查高拍仪状态...'
    window.WebSocketConnect(flag)
    const timer = setInterval(() => {
      if (window.openFlagA === 0)
        return
      if (window.openFlagA === 1) {
        // 成功建立连接高拍仪服务
        hintText.value = '插件已启动，点击下方按钮开始扫描'
      }
      else if (window.openFlagA === 2) {
        // 未检测到高拍仪服务，建立检测报错
        hintText.value = '插件未开启，请开启后再次尝试'
      }
      gpyCount.value = window.GPY_DEVCOUNT || 0
      disabled.value = false
      connectable.value = window.openFlagA === 1
      clearInterval(timer)
      if (connectable.value && gpyCount.value === 0) {
        Modal.error({
          title: '启动失败',
          content: '未检测到高拍仪！',
          centered: true,
          okText: '确定',
        })
        return resolve(false)
      }
      resolve(window.isSocketConnect)
    }, 1000)
  })
}

/**
 * 关闭连接
 */
function closeConnect() {
  // console.log('cancel modal -> 关闭连接')
  gpyVisible.value = false
  window.CloseConnect()
}

/**
 * 打开高拍仪：打开前获取最新连接状态
 */
async function openGPYModal() {
  const res = await connectGaoPaiYi()
  if (!res)
    return
  gpyVisible.value = true
}

/**
 * 下载高拍仪插件
 */
function downloadGaoPaiYi() {
  if (isDev) {
    window.open('http://192.168.2.65:8080/fileShare/KMGpyServer_3.9.2.exe', '_blank')
  }
  else {
    window.open('https://pre.ilis.cn/fileShare/KMGpyServer_3.9.2.exe', '_blank')
  }
}

function fileSize(size: number) {
  const n = size / 1024
  return n < 1000 ? `${Math.ceil(n)}KB` : `${(n / 1024).toFixed(2)}M`
}

// 上传文件
function gpyUploadFile() {
  const scanFiles = gaoPaiYiRef.value.getFiles()
  if (!scanFiles || scanFiles.length === 0)
    return
  const sizeFail = [] as any[]
  const fileDatas = []
  for (let i = 0; i < scanFiles.length; i++) {
    const item = scanFiles[i]
    const file = dataURLtoFile(item.base64Str, item?.name)
    fileDatas.push({
      file,
      name: file?.name,
      size: fileSize(file.size),
      type: item.type,
      key: item.id,
      status: '',
      failMsg: '',
    })
    if (file.size > FILE_SIZE.value) {
      sizeFail.push(file?.name)
    }
  }
  if (sizeFail.length > 0) {
    Modal.error({
      title: '提示',
      content: () =>
        h('div', {}, [
          h('p', '以下文件大小超过500M，无法上传'),
          ...sizeFail.map(d => h('p', d)),
        ]),
      centered: true,
      okText: '确定',
    })
    return
  }
  gpyVisible.value = false
  scanFileDatas.value = fileDatas
  visible.value = true
  startUpload()
}

function startUpload() {
  for (let i = 0; i < scanFileDatas.value.length; i++) {
    const item = scanFileDatas.value[i]
    reUpload(item)
  }
}

function reUpload(item: any) {
  item.status = '上传中'
  httpUpload(item.file)
    .then(({ data }) => {
      emits('load', data)
      item.status = '已上传'
    })
    .catch((err) => {
      item.status = '上传失败'
      item.failMsg = err.msg || err.message || '系统异常'
    })
}

/**
 * 结束上传
 */
function closeVisible() {
  const uploadFinish = scanFileDatas.value?.every(item => item.status === '已上传')
  if (uploadFinish) {
    visible.value = false
    scanFileDatas.value = []
  }
  else {
    Modal.confirm({
      title: '确认关闭？',
      content: `存在上传失败的文件，可前往 ${window.IlisGpyPhotoFolder} 选择文件进行本地上传`,
      onOk: () => {
        visible.value = false
        scanFileDatas.value = []
      },
    })
  }
}

/**
 * base64数据转为文件对象
 */
function dataURLtoFile(dataurl: string, filename: string) {
  const bstr = atob(dataurl)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  const suffix = filename.substring(filename.length - 3, filename.length)
  if (suffix === 'jpg' || suffix === 'JPG')
    return new File([u8arr], filename, { type: 'image/jpg' })
  if (suffix === 'png' || suffix === 'PNG')
    return new File([u8arr], filename, { type: 'image/png' })
  if (suffix === 'tif' || suffix === 'TIF')
    return new File([u8arr], filename, { type: 'image/tiff' })
  if (suffix === 'pdf' || suffix === 'PDF')
    return new File([u8arr], filename, { type: 'application/pdf' })

  return new File([u8arr], filename, { type: 'application/jpg' })
}

onMounted(async () => {
  await createScript('gpyhs.js')
  connectGaoPaiYi(true)
})

onBeforeUnmount(() => {
  closeConnect()
})
</script>

<style lang="less" scoped>
.gaopaiyi-wrapper {
  padding-bottom: 8px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  text-align: center;
  .anticon {
    margin: 10px 0 4px;
    color: #ccc;
    font-size: 32px;
  }
  .ant-btn {
    margin-top: 8px;
    width: 80%;
  }
}
.download-link {
  color: #1890ff;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}
</style>
