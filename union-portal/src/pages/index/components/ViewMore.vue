<script setup lang='ts'>
import { toRefs } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import NoticeDetail from './NoticeDetail.vue'
import { useTableHooks } from '@/composables/useTableHooks'
import type { Category, Notice, Query } from '@/types/index.d'
import { OPENTYPE, PRIORITY, STATUSOPT } from '@/types/index.d'

interface PropsType {
  type: Category
  title?: string
}
const props = defineProps<PropsType>()
const { title = '标题', type } = toRefs(props)
const visible = ref(false)

// 列
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '打开方式',
    dataIndex: 'openType',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '100px',
  },
]

// 查询数据
const query = ref<Query>({
  category: type.value,
})
const formRef = ref<FormInstance>()
const {
  loading,
  tableBoxRef,
  tableHeight,
  dataSource,
  getList,
  handleSearch,
  handleReset,
  getPagination,
} = useTableHooks<Notice>({
  api: '/api/v1/todos',
  formRef,
  query,
  eqQuery: ['status'],
  isInitData: false,
})

// 查看详情
const noticeDetailRef = ref()
function showDetail(id: string) {
  noticeDetailRef.value.showModal(id)
}

function showModal() {
  visible.value = true
  getList()
}

defineExpose({
  showModal,
})
</script>

<template>
  <a-modal
    v-model:open="visible"
    :title="title"
    :keyboard="false"
    :mask-closable="false"
    destroy-on-close
    width="80%"
  >
    <!-- 快捷查询 -->
    <a-form ref="formRef" :model="query" layout="inline" mb-2>
      <a-form-item name="title">
        <a-input
          v-model:value="query.title"
          placeholder="请输入标题查询"
          @keyup.enter="handleSearch"
        />
      </a-form-item>
      <a-form-item name="status">
        <a-select
          v-model:value="query.status"
          style="width: 120px"
          allow-clear
          placeholder="请选择状态"
          @change="handleSearch"
        >
          <a-select-option v-for="(v, k) in STATUSOPT" :key="k" :value="k">
            {{ v }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSearch">
            查询
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <div ref="tableBoxRef" class="h-[65vh] w-full">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'openType'">
            {{ OPENTYPE[text] }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            {{ STATUSOPT[text] || '' }}
          </template>
          <template v-else-if="column.dataIndex === 'priority'">
            {{ PRIORITY[text] || '' }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" @click="showDetail(record.id)">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
  </a-modal>

  <NoticeDetail ref="noticeDetailRef" />
</template>
