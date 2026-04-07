<template>
  <div class="sign-panel flex gap-3 min-h-[70vh] h-0">
    <div class="l w-[200px] ">
      <div
        v-for="item in files"
        :key="item?.id"
        class="p-3 rounded-sm"
        :class="{
          'bg-colorPrimary text-[#fff]': item?.id === currentFile?.id,
        }"
        @click="currentFile = item"
      >
        <div>
          <BaseText> {{ item.attachmenttitle }} </BaseText>
        </div>
      </div>
    </div>
    <div class="c flex-1 border-x border-solid border-[#f2f2f2]">
      <iframe
        ref="pdfRef"
        frameborder="0"
        class="w-full h-full"
        :src="`plug-in/pdfjs/web/viewer.html?file=${encodeURIComponent(`${basePathFun()}/reportController.do?displayPDF&attachmentId=${currentFile?.id}`)}`"
      ></iframe>
    </div>
    <div class="r w-[540px] h-full overflow-y-scroll pr-3">
      <a-button class="mb-2" type="primary" @click="handleAddSignToOtherPage">
        应用到其他页
      </a-button>
      <div v-for="option in signTagList" :key="option.id">
        <BaseTitle>{{ option.typename }}</BaseTitle>
        <div
          v-for="item in data.filter(i => i.tag === option.signTag && i.attachmentId === currentFile?.id)"
          :key="item.id"
          class="flex  gap-3 px-2 py-2 items-center"
          :class="{
            'bg-[#ffff80]': item.isTarget,
          }"
        >
          <span class="!w-[60px] overflow-hidden text-ellipsis whitespace-nowrap  shrink-0" :title="item.userName || ''">{{ item.userName }}</span>
          <span class="flex items-center whitespace-nowrap">页码：
            <a-input-number
              v-model:value="item.pageNo"
              class="w-[50px]"
              :min="1"
              :max="pdfSignerInstance?.pagesCount"
              size="small"
              :precision="0"
              :disabled="isReadOnly"
              @change="nextTick(() => pdfSignerInstance?.render())"
            ></a-input-number>
          </span>
          <span class="flex-1 flex items-center whitespace-nowrap">
            位置：
            <a-input-number
              v-model:value="item.signX"
              class="w-[60px]"
              size="small"
              :min="0"
              :max="pdfSignerInstance?.maxWidth ? pdfSignerInstance?.maxWidth - signWidth : undefined"
              :precision="2"
              :disabled="isReadOnly"
              @change="nextTick(() => handlePosition(item))"
            ></a-input-number>
            <span>-</span>
            <a-input-number
              v-model:value="item.signY"
              class="w-[60px]"
              :min="0"
              :max="pdfSignerInstance?.maxHeight ? pdfSignerInstance?.maxHeight - signHeight : undefined"
              size="small"
              :precision="2"
              :disabled="isReadOnly"
              @change="nextTick(() => handlePosition(item))"
            ></a-input-number>
          </span>
          <span class="flex items-center gap-3">
            <PlusCircleOutlined
              v-if="!isReadOnly"
              class=" hover:text-colorPrimary"
              title="添加"
              @click="handleAdd(item);pdfSignerInstance?.render()"
            />
            <AimOutlined
              class=" hover:text-colorPrimary"
              title="定位"
              @click="pdfSignerInstance?.scrollTo(item.id)"
            />
            <DeleteOutlined
              v-if="!isReadOnly
                && data.filter(i => i.tag === option.signTag && i.attachmentId === currentFile?.id)?.filter(i => i.userId === item.userId)?.length > 1"
              class=" text-colorError"
              title="删除"
              @click="handleDel(item.id)"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SignStaffEntity } from '../SignStaffEntity'
import { AimOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { BaseText, BaseTitle } from '~/components/UI'
import { getSignSizePX } from '../api'
import { PdfSignHelper } from '../helper/PdfSignHelper'
import { SignPostionConfigEntity } from '../SignPostionConfigEntity'
import AddSignToOtherPage from './AddSignToOtherPage.vue'

const props = defineProps<{
  modelValue: SignPostionConfigEntity[]
  files: any[]
  signTagList: SignStaffEntity[]
  isReadOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SignPostionConfigEntity[]): void
}>()

const signWidth = ref(73)

const signHeight = ref(33)

const currentFile = ref(props.files[0])

const pdfRef = ref<HTMLIFrameElement>()

let pdfSignerInstance: PdfSignHelper | undefined

const data = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  },
})

watch(() => data.value, (_value) => {
  _value.forEach((i) => {
    handlePosition(i)
  })
}, {
  deep: true,
})

const presetSignPerson = ref<SignPostionConfigEntity[]>([])

watch(() => props.signTagList, () => {
  const arr = props.signTagList.map((i) => {
    const groupByFile = props.files?.map((c) => {
      return i.staffname?.map((j) => {
        return SignPostionConfigEntity.fromJSON({
          tag: i.signTag,
          type: i.type,
          userName: j.name,
          userId: j.id,
          attachmentId: c.id,
        })
      })
    }) as [][]
    return [].concat(...groupByFile)
  }) as [][]

  presetSignPerson.value = [].concat(...arr)?.filter(Boolean) as SignPostionConfigEntity[]
}, { deep: true, immediate: true })

watch(() => [currentFile.value, presetSignPerson.value], () => {
  // const curretnPresetSignPerson = presetSignPerson.value.filter(i => i?.attachmentId === currentFile.value?.id)
  nextTick(() => {
    presetSignPerson.value.forEach((i) => {
      const isExist = data.value.find(j => i?.userId === j.userId && i?.tag === j.tag && i?.attachmentId === j.attachmentId)
      if (!isExist) {
        const persetAddData = SignPostionConfigEntity.fromJSON(i)
        persetAddData.signX = persetAddData.signX || 1
        persetAddData.signY = persetAddData.signY || 1
        persetAddData.signWidth = signWidth.value
        persetAddData.signHeight = signHeight.value
        persetAddData.isTarget = false
        persetAddData.id = String(Date.now() + Math.random())
        persetAddData.pageNo = 1
        data.value.push(persetAddData)
      }
    })
  })
}, { deep: true, immediate: true })

async function initPDFViewerApplication() {
  const PDFViewerApplication = pdfRef.value?.contentWindow?.PDFViewerApplication
  pdfSignerInstance = new PdfSignHelper(PDFViewerApplication, data, {
    renderFilter: (data) => {
      return data.filter(i => i.attachmentId === currentFile.value?.id)
    },
    isReadonly: props.isReadOnly,
  })
}

async function getSignSize() {
  const { data } = await getSignSizePX()
  const { signWidth: w, signHigh: h } = data
  if (w) {
    signWidth.value = w
  }
  if (h) {
    signHeight.value = h
  }
}
getSignSize()

function handleAdd(item: SignPostionConfigEntity, pageNo = 1) {
  const index = data.value?.findIndex(i => i.id === item.id)
  const addData = SignPostionConfigEntity.fromJSON(item)
  addData.signX = addData.signX || 1
  addData.signY = addData.signY || 1
  addData.signWidth = signWidth.value
  addData.signHeight = signHeight.value
  addData.isTarget = false
  addData.id = String(Date.now() + Math.random())
  addData.pageNo = pageNo
  addData.attachmentId = currentFile.value.id
  data.value.splice(index + 1, 0, addData)
}

function basePathFun() {
  // 获得根目录
  const strFullPath = window.document.location.href
  const strPath = window.document.location.pathname
  const pos = strFullPath.indexOf(strPath)
  const prePath = strFullPath.substring(0, pos)
  const postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1)
  const basePath = prePath + postPath
  return basePath
}

function handlePosition(item: SignPostionConfigEntity) {
  if (item.signX < 0) {
    item.signX = 0
  }
  if (item.signY < 0) {
    item.signY = 0
  }
  if (pdfSignerInstance?.maxWidth && item.signX > pdfSignerInstance.maxWidth - signWidth.value) {
    item.signX = pdfSignerInstance!.maxWidth - signWidth.value
  }
  if (pdfSignerInstance?.maxHeight && item.signY > pdfSignerInstance.maxHeight - signHeight.value) {
    item.signY = pdfSignerInstance!.maxHeight - signHeight.value
  }

  pdfSignerInstance?.render()
}

function handleDel(id: string) {
  Modal.confirm({
    title: '提示',
    content: '确定删除吗？',
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: () => {
      data.value = data.value.filter(i => i.id !== id)
      nextTick(() => pdfSignerInstance?.render())
    },
  })
}

async function handleAddSignToOtherPage() {
  let signItems = data.value.filter(i => i.attachmentId === currentFile.value?.id)
  // 对signItems 进行去重
  signItems = signItems.filter((item, index, self) =>
    index === self.findIndex(t => (
      t.tag === item.tag && t.userId === item.userId
    )),
  )

  const res = await AnyDialogHelper.showModel<SignPostionConfigEntity[]>(AddSignToOtherPage, {
    signItems,
    pageCount: pdfSignerInstance?.pagesCount,
    currentPage: pdfSignerInstance?.page,
  })
  if (res?.length) {
    res.forEach(i => handleAdd(i, i.pageNo))
  }
}

async function pdfjsListener(event: MessageEvent) {
  switch (event.data) {
    case 'onLoadAll':
      initPDFViewerApplication()
      setTimeout(() => {
        pdfSignerInstance?.render()
      }, 0)
      break
    case 'onLoadPage':
      pdfSignerInstance?.render()
      break
    default:
      break
  }
}

window.removeEventListener('message', pdfjsListener)
// 监听来自 iframe 的消息
window.addEventListener('message', pdfjsListener)

onUnmounted(() => {
  window.removeEventListener('message', pdfjsListener)
})
</script>
