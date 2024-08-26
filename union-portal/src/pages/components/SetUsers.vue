<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import Users from '@/pages/admin/users.vue'
import type { DataSource as UserData } from '@/types/users.d'
import type { BaseItem, RoleUser } from '@/types/roles.d'
import useTableHeight from '@/composables/useTableHeight'
import permissionsStore from '@/stores/permissions'

const props = defineProps<{
  selectedDatas: RoleUser[]
  permissionCode: string // 权限编码
  roleInfo?: BaseItem // 角色信息
  appInfo?: BaseItem // 子系统信息
}>()
const emits = defineEmits<{
  (e: 'del', obj: RoleUser): void
  (e: 'save', data: UserData[], cb: (d: any) => void): void
}>()
const pStore = permissionsStore()
// 初始化表格高度
const { tableBoxRef, tableHeight } = useTableHeight(false)

// 列
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '用户昵称',
    dataIndex: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 70,
  },
]

if (!pStore.hasPermission(props.permissionCode)) {
  columns.pop()
}

const dataSource = ref<RoleUser[]>([])
watch(
  () => props.selectedDatas,
  (list) => {
    dataSource.value = list
  },
  {
    immediate: true,
  },
)

const visible = ref(false)
const submitLoad = ref(false)
// 添加用户
function addUser() {
  visible.value = true
}

// 删除用户
function delRow(obj: RoleUser) {
  Modal.confirm({
    title: '删除确认',
    content: '确定删除这条数据吗？',
    centered: true,
    async onOk() {
      emits('del', obj)
    },
  })
}

function cancelModal() {
  visible.value = false
}

// 保存选择的用户
const usersRef = ref()
async function saveRoleUser() {
  submitLoad.value = true
  const rows: UserData[] = usersRef.value.selectedRows
  if (rows.length === 0) {
    message.info('未修改用户信息')
    submitLoad.value = false
    visible.value = false
    return
  }
  emits('save', rows, (saveSuccess: boolean) => {
    submitLoad.value = false
    if (saveSuccess)
      visible.value = false
  })
}
</script>

<template>
  <div
    flex
    flex-col
    h-full
    overflow-auto
  >
    <div v-if="pStore.hasPermission(permissionCode)" p-1>
      <a-button type="text" @click="addUser">
        <PlusOutlined />添加用户
      </a-button>
    </div>
    <div ref="tableBoxRef" h-0 flex-1>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'status'">
            {{ text === 'ACTIVE' ? '启用' : '禁用' }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" danger @click="delRow(record as RoleUser)">
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>

  <a-modal
    v-model:open="visible"
    title="选择用户"
    :keyboard="false"
    :mask-closable="false"
    :confirm-loading="submitLoad"
    centered
    destroy-on-close
    width="80%"
    @cancel="cancelModal"
    @ok="saveRoleUser"
  >
    <div class="h-[70vh]">
      <Users
        ref="usersRef"
        selected-mode
        :role-id="roleInfo?.id"
        :application-id="appInfo?.id"
      />
    </div>
  </a-modal>
</template>
