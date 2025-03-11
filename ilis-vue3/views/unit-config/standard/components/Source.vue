<template>
  <ht-modal
    ref="htModalRef"
    v-model:open="visible"
    title="规程溯源"
    width="1100px"
    :mask="mask"
    :show-close-all="!mask"
    tiled-level
    :class="`${mask ? 'standard-source-modal' : ''}`"
    @cancel="cancelModal"
  >
    <div class="min-h-[200px]">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        :scroll="{ y: '50vh' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'content'">
            <SourceTableCell :data="record as StandardTrace" />
          </template>
        </template>
      </a-table>
    </div>
    <template #footer>
      <a-button @click="cancelModal">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import { type StandardTrace, standardSourceApi } from '../api'
import SourceTableCell from './SourceTableCell.vue'
import { useTableHooks } from '~/hooks/useTableHooks'

const columns = [
  {
    title: '规程名称',
    dataIndex: 'standardName',
  },
  {
    title: '颁布号',
    dataIndex: 'publishCode',
  },
  {
    title: '更新内容',
    dataIndex: 'content',
    width: '40%',
  },
  {
    title: '更新人',
    dataIndex: 'updater',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
  },
]
const visible = ref(false)
const mask = ref(false)

const query = ref({
  id: '',
})

const { loading, dataSource, getList } = useTableHooks<StandardTrace>({
  api: standardSourceApi,
  responseDataTransform: (res) => {
    return {
      rows: res,
      total: res.length,
    }
  },
  query,
  isPagination: false,
  immediate: false,
})

function showModal(id: string, isMask?: boolean) {
  mask.value = isMask || false
  query.value.id = id
  visible.value = true
  getList()
}

/** 更新弹窗层级 */
const htModalRef = ref()
function initModalZindex() {
  if (!visible.value)
    return ''
  htModalRef.value?.refreshZindex()
}

function cancelModal() {
  if (mask.value && visible.value) {
    htModalRef.value.cancelAllModal()
  }
  visible.value = false
  dataSource.value = []
}

defineExpose({
  showModal,
  initModalZindex,
})
</script>

<style>
.standard-source-modal .ant-modal-header{
  background-color: #ddd;
}
</style>
