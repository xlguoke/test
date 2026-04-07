<template>
  <div class="p-4">
    <a-alert show-icon>
      <template #message>
        <p>1. 若当前样品没有上传填写示例，则会获取父级样品层级中上传的填写示例；</p>
        <p>2. 上传的示例文件仅支持图片格式：png、jpg、jpeg；文件大小不超过10M；</p>
      </template>
    </a-alert>
    <div v-if="showUplaodBtn">
      <div class="mt-4">
        示例图片：
        <a-button @click="showUplaod = true">
          <UploadOutlined />上传文件
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <div class="py-4 min-h-[150px]">
          <ul class="flex flex-wrap gap-3">
            <li
              v-for="(item, index) in fileDatas" :key="index"
              class="relative w-[100px] h-[120px] border-4 border-gray-3 cursor-pointer"
            >
              <a-image
                :width="92"
                :height="112"
                class="object-contain"
                :src="item.attachmentUrl"
                :preview="{
                  visible: item.visible,
                  onVisibleChange: (val) => item.visible = val,
                }"
              />
              <div class="absolute top-0 left-0 w-full h-full flex gap-3 justify-center items-center bg-gray-400/50 opacity-0 hover:opacity-100 transition">
                <EyeOutlined class="text-[16px] text-orange-500" title="预览" @click="item.visible = true" />
                <DeleteOutlined class="text-[16px] text-red-500" title="删除" @click="handleDel(item, index)" />
              </div>
            </li>
          </ul>
        </div>
      </a-spin>
    </div>
    <div v-else class="mt-10 text-center text-gray-400">
      请选择一个样品进行查看
    </div>

    <IlisUpload
      v-model:show="showUplaod"
      multiple
      :accept="['.png', '.jpg', '.jpeg']"
      :size="10"
      force
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup lang='ts'>
import type { FileData } from '../api'
import { DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { deleteSampleExample, getSampleExample, saveSampleExample } from '../api'

const props = defineProps({
  sampleIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})

const loading = ref(false)
const showUplaodBtn = ref(false)
watch(() => props.sampleIds, async () => {
  if (props.sampleIds.length === 1) {
    showUplaodBtn.value = true
    getData()
  }
  else {
    showUplaodBtn.value = false
  }
})

const fileDatas = ref<FileData[]>([])
const showUplaod = ref(false)

async function getData() {
  try {
    loading.value = true
    const sampleId = props.sampleIds[0]
    const { data } = await getSampleExample(sampleId)
    fileDatas.value = data
  }
  finally {
    loading.value = false
  }
}

function handleDel(item: FileData, index: number) {
  Modal.confirm({
    title: '删除提示',
    content: '确认删除该图片吗？',
    async onOk() {
      await deleteSampleExample(item.id)
      fileDatas.value.splice(index, 1)
      message.success('删除成功')
    },
  })
}

async function handleUploadSuccess(files: any[]) {
  if (files.length === 0)
    return ''
  try {
    loading.value = true
    await saveSampleExample({
      sampleId: props.sampleIds[0],
      attachmentIds: files.map(item => item.id),
    })
    getData()
  }
  finally {
    loading.value = false
  }
}
</script>

<style>

</style>
