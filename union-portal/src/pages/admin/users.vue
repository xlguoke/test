<script setup lang="ts">
import { h } from 'vue'
import { Modal, message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined, UserOutlined } from '@ant-design/icons-vue'
import { EditModal } from './users/components'
import useMyFetch from '@/composables/useMyFetch'
import { useTableHooks } from '@/composables/useTableHooks'
import type { DataSource, Query, Status } from '@/types/users.d'
import { statusOpt } from '@/types/users.d'
import permissionsStore from '@/stores/permissions'

const props = defineProps<{
  selectedMode?: boolean // 是否开启选择模式（目前仅支持多选）
  roleId?: string | number // 角色id
  applicationId?: string | number // 子系统id
}>()

const pStore = permissionsStore()

// 列
const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
  },
  {
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '用户昵称',
    dataIndex: 'name',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
  },
  {
    title: '角色',
    dataIndex: 'roles',
    width: '30%',
  },
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
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
  selectedRows,
  getList,
  getRowSelection,
  handleSearch,
  handleReset,
  getPagination,
} = useTableHooks<DataSource>({
  api: '/api/v1/users',
  formRef,
  query,
  eqQuery: ['status','roles.id'],
  isInitData: false,
  filterData: (data) => {
    return data.map(d => ({
      ...d,
      statusBol: d.status === 'ACTIVE',
      statusText: statusOpt[d.status],
      rolesStr: d.roles.map(r => r.name).join('，'),
    }))
  },
})

// 开启选择模式时，初始化查询条件
watchEffect(() => {
  if (props.roleId) {
    query.value['roles.id'] = `${props.roleId}` || ''
  }
  else {
    delete query.value['roles.id']
  }
  if (props.applicationId) {
    query.value['applications.id'] = `${props.applicationId}` || ''
  }
  else {
    delete query.value['applications.id']
  }
})

onMounted(() => {
  getList()
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
      const { error } = await useMyFetch(`/api/v1/users/${id}`, { method: 'DELETE' })
      if (error.value)
        return
      message.success('删除成功')
      getList()
    },
  })
}

// 修改用户状态
async function chagneStatus(id: string, status: Status) {
  loading.value = true
  const { error } = await useMyFetch(`/api/v1/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    }),
  })
  loading.value = false
  if (error.value)
    return ''
  message.success('修改成功')
  getList()
}

// 重置密码
function resetPassword(id: string, username: string) {
  Modal.confirm({
    title: '提示',
    content: `确认重置用户${username}的密码？`,
    centered: true,
    async onOk() {
      const { error } = await useMyFetch(`/api/v1/users/init/${id}/password`, { method: 'PUT' })
      if (error.value)
        return ''
      message.success('重置成功')
    },
  })
}

defineExpose({
  selectedRows,
})

definePage({
  meta: {
    title: '用户管理',
    authName: 'users',
  },
})
</script>

<template>
  <div h-full flex flex-col>
    <!-- 快捷查询 -->
    <a-form ref="formRef" :model="query" layout="inline" mb-2>
      <a-form-item name="name">
        <a-input
          v-model:value.trim="query.name"
          allow-clear
          placeholder="请输入用户名查询"
          @press-enter="handleSearch"
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
          <a-select-option value="ACTIVE">
            启用
          </a-select-option>
          <a-select-option value="INACTIVE">
            禁用
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
    <!-- 操作栏 -->
    <a-space mb-1>
      <a-button v-permission="'users:create'" type="text" :icon="h(PlusOutlined)" @click="add">
        新增
      </a-button>
    </a-space>
    <!-- 表格 -->
    <div ref="tableBoxRef" flex-1 h-0>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :row-selection="selectedMode ? getRowSelection() : undefined"
        :pagination="getPagination()"
        :loading="loading"
        row-key="id"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'avatar'">
            <a-avatar v-if="text" shape="square" :src="text" />
            <a-avatar v-else shape="square">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
          </template>
          <template v-else-if="column.dataIndex === 'roles'">
            <div class="text-ellipsis-2" :title="record.rolesStr">
              {{ record.rolesStr }}
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <a-switch
              v-if="pStore.hasPermission('users:status')"
              v-model:checked="record.statusBol"
              @change="chagneStatus(record.id, record.status)"
            />
            <span v-else>{{ record.statusText }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button
              v-permission="'users:reset'"
              type="link"
              size="small"
              @click="resetPassword(record.id, record.username)"
            >
              <span text-orange hover:text-orange-3>重置密码</span>
            </a-button>
            <a-button
              v-permission="'users:update'"
              type="link"
              size="small"
              @click="editRow(record.id)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.username !== 'admin'"
              v-permission="'users:delete'"
              type="link"
              size="small"
              danger
              @click="delRow(record.id)"
            >
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <EditModal ref="editModalRef" @save="getList" />
  </div>
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
