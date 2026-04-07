<template>
  <AppProvider>
    <ht-modal
      v-model:open="open"
      title="语音记录"
      width="800px"
      :mask-closable="false"
      destroy-on-close
      centered
      @cancel="cancel"
    >
      <div class="flex h-[420px]">
        <div class="w-[260px] overflow-y-auto h-full pr-8">
          <div
            v-for="(item, index) in sheetsJson" :key="index" class="menu-item textOverflow" :class="{
              active: index === tabIndex,
            }" :title="item.sheetName"
            @click="tabIndex = index"
          >
            {{ item.sheetName }}
          </div>
        </div>
        <div class="px-8 py-4 flex-1 overflow-y-auto h-full bg-[#f9f9f9]">
          <div v-for="item in aiInputItems" v-show="!item.isDelete" :key="item.id" class="mb-8 w-[320px]">
            <audio :src="`${filePath + item.id}.opus`" class="w-full" controls></audio>
            <div class="bg-white p-4">
              {{ item.displayContext }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <a-button @click="cancel">
          关闭
        </a-button>
      </template>
    </ht-modal>
  </AppProvider>
</template>

<script setup lang='ts'>
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { getVoiceFilePath, getVoiceRecord } from '~/views/task/components/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open'])

// 用于嵌入到html页面调用
const pageProps = ref({
  taskId: null,
  open: false,
})

const taskId = ref<string>()

const filePath = ref<string>()

const sheetsJson = ref<Array<{
  aiInputItems: Array<{
    createTime: number
    displayContext: string
    durationMs: number
    id: string
    isUse: boolean
    messageType: number
    isDelete: boolean
  }>
  sheetName: string
}>>([])

const tabIndex = ref(0)

const aiInputItems = computed(() => sheetsJson.value[tabIndex.value] ? sheetsJson.value[tabIndex.value].aiInputItems : [])

const open = computed(() => props.open || pageProps.value.open)

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    getData()
  }
})

async function getData() {
  if (taskId.value) {
    const res = await getVoiceRecord(taskId.value)
    const sheetsJsonObj = res.data.find(i => i.fileName === 'sheets.json')
    if (sheetsJsonObj) {
      const jsonRes = await IlisApiHelper.get(sheetsJsonObj.fileUrl)
      sheetsJson.value = jsonRes.data
    }

    const pathRes = await getVoiceFilePath(taskId.value, 'TASK')
    filePath.value = pathRes.data.replace(/\\/g, '/')
  }
}

// 关闭弹窗
function cancel() {
  pageProps.value.open = false
  emits('update:open', false)
}

window.$voiceRecord = {
  open: (id: string) => {
    taskId.value = id
    pageProps.value.open = true
  },
}
</script>

<style lang="less" scoped>
.menu-item {
  padding: 8px;
  cursor: pointer;

  &.active,
  &:hover {
    background: var(--colorPrimary);
    color: #fff;
  }
}

audio {
  height: 42px;
  border-radius: 0
}

audio::-webkit-media-controls-panel {
  background: #e1eeff;
  border-radius: 0;
}
</style>
