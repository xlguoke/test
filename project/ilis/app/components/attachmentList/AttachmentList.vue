<template>
  <div>
    <template v-if="fileList.length > 0">
      <ul v-if="listType === 'picture-card'" :class="`${fileWrapClass} gap-y-1`">
        <li v-for="(file, i) in fileList" :key="i" :style="`width: ${itemWidth}`">
          <div class="flex items-center p-2 border border-gray-200 rounded-md">
            <FilePdfOutlined v-if="fileType(file.name) === 'pdf'" class="icon-file-pdf" />
            <a-image
              v-else-if="isImage(file.name)"
              :preview="false"
              :fallback="fallback"
              :src="file.url"
              width="32px"
              height="32px"
            ></a-image>
            <FileTextOutlined v-else />
            <span :class="`${fileNameClass} mx-2`" :title="file.name">{{ file.name }}</span>
            <a-button
              v-if="fileType(file.name) === 'pdf' || isImage(file.name)"
              type="link"
              primary
              size="small"
              @click="showFile(file)"
            >
              查看
            </a-button>
            <a-button type="link" primary size="small" @click="downloadFile(file)">
              下载
            </a-button>
            <a-button v-if="showDel" type="text" danger size="small" @click="deleteFile(i)">
              删除
            </a-button>
          </div>
        </li>
      </ul>
      <ul v-else :class="fileWrapClass">
        <li v-for="(file, i) in fileList" :key="i" class="h-5 leading-3" :style="`width:${itemWidth}`">
          <div class="px-1 inline-flex items-center max-w-full rounded-sm hover:bg-gray-100">
            <span :class="`${fileNameClass} mr-3`" :title="file.name">{{ file.name }}</span>
            <a-space class="text-colorPrimary">
              <a
                v-if="fileType(file.name) === 'pdf' || isImage(file.name)"
                @click="showFile(file)"
              >
                查看
              </a>
              <a @click="downloadFile(file)">
                下载
              </a>
              <a v-if="showDel" class="!text-red-500 hover:text-red-400" @click="deleteFile(i)">
                删除
              </a>
            </a-space>
          </div>
        </li>
      </ul>
    </template>
    <p v-else class="pl-2 text-gray-400 my-0 leading-7">
      暂无文件信息
    </p>
    <div style="display: none">
      <a-image-preview-group :preview="{ visible, onVisibleChange: (vis: any) => (visible = vis) }">
        <a-image :src="viewImgUrl" />
      </a-image-preview-group>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { Attachment } from './'
import { FilePdfOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import { downloader } from '~/utils/Downloader'

interface Props {
  datas: Attachment[]
  listType?: 'text' | 'picture-card'
  col?: number
  showDel?: boolean
  pdfPreviewHandler?: (file: Attachment) => void
}

const props = defineProps<Props>()

const emits = defineEmits<{
  (e: 'delete', index: number, file: Attachment): void
}>()

const fileNameClass = 'truncate flex-1 leading-5'
const fallback = 'data:image/png;base64,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'
const viewImgUrl = ref('')
const visible = ref(false)
const fileList = ref<Attachment[]>([])

watch(() => props.datas, (list) => {
  fileList.value = list
}, {
  immediate: true,
})

const colGap = 10
// 显示列数
const colCount = computed(() => {
  return Math.min(3, props.col ? Math.max(props.col, 1) : 1)
})
// 每列宽度
const itemWidth = computed(() => {
  const scale = 1 / colCount.value * 100
  const px = (colCount.value - 1) * colGap
  return `calc(${scale}% - ${px}px)`
})
// 间距
const fileWrapClass = ref(`flex flex-wrap gap-x-[${colCount.value * colGap}px]`)

// 文件类型
function fileType(name: string) {
  const n = name.lastIndexOf('.')
  return name.substring(n + 1).toLowerCase()
}

const imgTypes = ['jpg', 'jpeg', 'png', 'bmp', 'svg', 'webp', 'wmf', 'gif', 'apng']
function isImage(name: string) {
  const type = fileType(name).toLowerCase()
  return imgTypes.includes(type)
}

// 查看
function showFile(file: Attachment) {
  if (isImage(file.name)) {
    viewImgUrl.value = file.url
    visible.value = true
  }
  else {
    if (props.pdfPreviewHandler) {
      props.pdfPreviewHandler(file)
    }
    else {
      window.open(file.url, '_blank')
    }
  }
}

// 下载
async function downloadFile(file: Attachment) {
  await downloader.excute(file.url, file.name)
}

// 删除
function deleteFile(i: number) {
  const file = fileList.value[i]
  fileList.value.splice(i, 1)
  emits('delete', i, file)
}
</script>

<style scoped>
.anticon {
  font-size: 18px;
}
.anticon-file-text,
.anticon-file-pdf {
  font-size: 32px;
}

.icon-file-pdf {
  color: #fe6550;
}

.file-item{
  width: calc(100% - 8px);
}
</style>
