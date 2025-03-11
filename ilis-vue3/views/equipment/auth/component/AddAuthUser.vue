<template>
  <HtModal
    v-model:open="visible"
    :title="title"
    width="800px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <a-button class="mt-4" type="primary" @click="onAddUser">
      新增
    </a-button>

    <div class="mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="userList"
        :pagination="false"
        :loading="loading"
        :scroll="{ y: 400 }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'personStatus'">
            <span v-if="record.personStatus === '0'">在职</span>
            <span v-if="record.personStatus === '1'">离职</span>
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-button type="link" danger @click="onDel(record)">
              移除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { EquipmentAuthEntity } from '../EquipmentAuthEntity.ts'
import { addEqAuthUser } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import PersonInfoSelector from '~/components/PersonInfoSelector.vue'
import type { PersonDataEntity } from '~/api/person.ts'
import { IlisProcessModal } from '~/components/ilisComponent'
import { ProcessType } from '~/components/commonProcess'

const props = defineProps<IDialogPropsParam<null, EquipmentAuthEntity>>()

const visible = ref(true)

const rowData = ref<EquipmentAuthEntity>(props.param.record)

const title = computed(() => {
  if (rowData.value.equipmentSn) {
    return `${rowData.value.name}（${rowData.value.equipmentSn}）的授权操作人员`
  }
  return `${rowData.value.name}的授权操作人员`
})

const loading = ref(false)

const userList = ref<PersonDataEntity[]>([])

const columns: ColumnType[] = [
  {
    title: '姓名',
    dataIndex: 'personName',
  },
  {
    title: '身份证号',
    dataIndex: 'identityNumber',
  },
  {
    title: '任职部门',
    dataIndex: 'department',

  },
  {
    title: '人员状态',
    dataIndex: 'personStatus',
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: 80,
  },
]

async function onAddUser() {
  AnyDialogHelper.showModel(PersonInfoSelector, {
    multiple: true,
    equipmentId: rowData.value.id,
    onConfirm: (rows: PersonDataEntity[]) => {
      rows.forEach((item) => {
        if (!userList.value.find(i => i.id === item.id)) {
          userList.value.push(item)
        }
      })
    },
  })
}

function onDel(row: PersonDataEntity) {
  userList.value = userList.value.filter(i => i.id !== row.id)
}

async function handleOk() {
  // 是否走流程
  const AUTH_EQUIPMENT_PROCESS = await getBusinessParam('AUTH_EQUIPMENT_PROCESS')

  if (AUTH_EQUIPMENT_PROCESS) {
    handleOkByAudit()
    return
  }

  loading.value = true
  await addEqAuthUser(rowData.value.id, {
    userIds: userList.value.map(i => i.id).join(','),
  }).finally(() => {
    loading.value = false
  })

  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}

function handleOkByAudit() {
  AnyDialogHelper.showModel(IlisProcessModal, {
    processType: ProcessType.EQ_USER_AUTH,
    processId: rowData.value.id,
    queryParams: {
      userIds: userList.value.map(i => i.id).join(','),
    },
    submitAuditApi: data => (addEqAuthUser(rowData.value.id, data)),
  }).then(() => {
    message.success('操作成功！')
    props.onConfirm(null)
    visible.value = false
  })
}
</script>
