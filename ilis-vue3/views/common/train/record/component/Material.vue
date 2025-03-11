<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    width="80%"
    title="培训资料"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <a-button @click="handleClose">
        关闭
      </a-button>
    </template>
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="MaterialEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <div>
        <a-button type="primary" @click="uploadKey++;isShowUplaod = true">
          上传
        </a-button>
      </div>
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :entity="MaterialEntity"
        :pagination="getPagination()"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" size="small" @click="handleDelete([record] as MaterialEntity[])">
              删除
            </a-button>
            <a-button type="link" size="small" @click="handleDownload(record as MaterialEntity)">
              下载
            </a-button>
          </template>
        </template>
      </IlisTable>
    </a-space>
    <IlisUpload
      :key="uploadKey"
      v-model:show="isShowUplaod"
      @success="handleUploadSuccess"
    ></IlisUpload>
  </a-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { delTrainRecordFiles, getTrainRecordFilePage, uploadTrainRecordFiles } from '../api'
import { MaterialEntity } from './MaterialEntity'
import { IlisUpload } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },

  /**
   * # 培训记录ID
   */
  id: {
    type: String,
    required: true,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'cancel'): void
}>()

const {
  loading,
  dataSource,
  getList,
  getPagination,
  handleSearch,
  handleReset,
  handleDelete,
} = useTableHooks<MaterialEntity>({
  api: getTrainRecordFilePage,
  delApi: delTrainRecordFiles,
  payload: {
    objId: props.id,
  },
  sizeKey: 'rows',
})

const uploadKey = ref(0)

const internalOpen = ref(props.show)

const isShowUplaod = ref(false)

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (val) {
    getList()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

function handleClose() {
  handleReset()
  internalOpen.value = false
}

async function handleDownload(row: MaterialEntity) {
  const { data } = await ilisAxios.get<any>(row.url, {
    responseType: 'blob',
  })
  const blob = new Blob([data])
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = row.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function handleUploadSuccess(files: any[]) {
  if (files.length === 0) {
    return
  }
  const ids = files.map(d => d.id).join(',')
  const query = {
    trainRecordId: props.id,
    attIds: ids,
  }
  await uploadTrainRecordFiles(query)
  message.success('上传成功')
  getList()
}
</script>
