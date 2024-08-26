<script setup lang="ts">
import { h } from 'vue'
import { Modal, message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import EditModal from './EditModal.vue'
import type { AppUser, DetailForm, EmitData, Query } from '@/types/applications.d'
import { useTableHooks } from '@/composables/useTableHooks'
import useMyFetch from '@/composables/useMyFetch'

const emits = defineEmits<{
  (e: 'setUsers', data: EmitData<AppUser>): void
}>()

// 列
const columns = [
  {
    title: '系统名称',
    dataIndex: 'name',
  },
  {
    title: '系统描述',
    dataIndex: 'description',
  },
  {
    title: '密钥',
    dataIndex: 'securityKey',
  },
  {
    title: '公钥',
    dataIndex: 'publicKey',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 180,
  },
]

// 查询数据
const query = ref<Query>({})
const formRef = ref<FormInstance>()
const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getList,
  handleSearch,
  handleReset,
  getPagination,
} = useTableHooks<DetailForm>({
  api: '/api/v1/applications',
  formRef,
  query,
})

const editModalRef = ref()
// 新增
function add() {
  editModalRef.value.openModal('新增')
}

// 编辑
function editRow(id: string) {
  editModalRef.value.openModal('编辑', id)
}

// 删除
function delRow(id: string) {
  Modal.confirm({
    title: '删除确认',
    content: '确定删除这条数据吗？',
    centered: true,
    async onOk() {
      const { error } = await useMyFetch(`/api/v1/applications/${id}`, { method: 'DELETE' })
      if (error.value)
        return
      message.success('删除成功')
      getList()
    },
  })
}

// 设置用户
function usersRow(obj: DetailForm) {
  emits('setUsers', {
    appInfo: { id: obj.id || '', name: obj.name },
    data: obj.owners,
  })
}

defineExpose({
  getList,
})
</script>

<template>
  <!-- 快捷查询 -->
  <a-form ref="formRef" :model="query" layout="inline" mb-2>
    <a-form-item name="name">
      <a-input
        v-model:value.trim="query.name"
        allow-clear
        placeholder="请输入系统名称查询"
        @press-enter="handleSearch"
      />
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
  <!-- 操作栏 -->
  <a-space mb-1>
    <a-button v-permission="'applications:create'" type="text" :icon="h(PlusOutlined)" @click="add">
      新增
    </a-button>
  </a-space>
  <!-- 表格 -->
  <div ref="tableBoxRef" flex-1 h-0>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="getPagination()"
      :loading="loading"
      :scroll="{ y: tableHeight }"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" size="small" @click="usersRow(record as DetailForm)">
            用户
          </a-button>
          <a-button v-permission="'applications:update'" type="link" size="small" @click="editRow(record.id)">
            编辑
          </a-button>
          <a-button v-permission="'applications:delete'" type="link" size="small" danger @click="delRow(record.id)">
            删除
          </a-button>
        </template>
        <template v-else>
          <div class="text-ellipsis-2" :title="text">
            {{ text }}
          </div>
        </template>
      </template>
    </a-table>
  </div>

  <EditModal ref="editModalRef" @save="getList" />
</template>

<style scoped>
.text-ellipsis-2 {
  max-height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
