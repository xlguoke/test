<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    width="80%"
    title="过程记录"
    destroy-on-close
    :body-style="{ height: '60vh', overflowY: 'auto' }"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <a-table
      row-key="id"
      :data-source="dataSource"
      :columns="cutomeColumns"
      :scroll="{
        x: '1400px',
      }"
    />
  </a-modal>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { getProcess, getProperties } from '../api'
import { type ICustomRecord, columns } from './customRecord'
import type { IConfirmHistoryEntity } from './confirmHistory'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<IConfirmHistoryEntity>,
    required: true,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const internalOpen = ref(props.show)

const cutomeColumns = ref(columns)

const dataSource = ref<ICustomRecord[]>([])

watch(() => props.show, async (val) => {
  internalOpen.value = val
  if (val) {
    await getCustomProperties()
    getList()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

async function getCustomProperties() {
  const { data } = await getProperties(props.data.checkItemId)
  const cusColumns = data.map((item) => {
    return {
      title: item.columnName,
      dataIndex: item.columnName,
      ellipsis: true,
    }
  }) as unknown as any[]
  cutomeColumns.value = [...columns, ...cusColumns]
}

async function getList() {
  const { data } = await getProcess(props.data.id)
  data.forEach((item) => {
    item.customValues.forEach((item2) => {
      item[item2.columnName] = item2.columnValue
    })
  })
  dataSource.value = data
}
</script>
