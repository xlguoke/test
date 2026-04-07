<template>
  <HtModal
    v-model:open="visible"
    :title="title"
    width="800px"
    :confirm-loading="loading"
    :hide-confirm="disabled"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <a-button v-if="!disabled" class="mt-4" type="primary" @click="onAddUser">
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

    <a-flex :gap="2" class="py-4">
      <span class="leading-7">附件：</span>
      <HtUploadFile
        :business-type="BUSINES_TYPE.EQ_IOT_AUTH"
        :business-id="param._processId"
        :is-reandonly="disabled"
        @get-data="getFileData"
      />
    </a-flex>
  </HtModal>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { EquipmentAuthEntity } from '../EquipmentAuthEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { PersonDataEntity } from '~/api/person.ts'
import type { UploadFileData } from '~/components/htUploadFile'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import PersonInfoSelector from '~/components/PersonInfoSelector.vue'
import { addEqAuthUser } from '../api'

interface IPropParam {
  record: EquipmentAuthEntity
  isAdd?: boolean
  userDatas?: PersonDataEntity[]
  _processId?: string
}

const props = defineProps<IDialogPropsParam<null, IPropParam>>()

const visible = ref(true)

const rowData = ref<EquipmentAuthEntity>(props.param.record)

const title = computed(() => {
  const text = props.param.isAdd ? '' : '详情'
  if (rowData.value.equipmentSn) {
    return `${rowData.value.name}（${rowData.value.equipmentSn}）的授权操作人员${text}`
  }
  return `${rowData.value.name}的授权操作人员${text}`
})

const loading = ref(false)

const userList = ref<PersonDataEntity[]>([])

const attachmentQrKey = ref('')

const columns = ref<ColumnType[]>([
  {
    title: '姓名',
    dataIndex: 'personName',
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
])
const disabled = ref(false)

onMounted(() => {
  if (props.param.userDatas) {
    userList.value = props.param.userDatas
  }
  disabled.value = !props.param.isAdd
  if (disabled.value) {
    columns.value.pop()
  }
})

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
  AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.EQ_USER_AUTH,
    processId: rowData.value.id,
    queryParams: {
      userIds: userList.value.map(i => i.id).join(','),
      attachKey: attachmentQrKey.value,
    },
    submitAuditApi: data => (addEqAuthUser(rowData.value.id, data)),
  }).then(() => {
    message.success('操作成功！')
    props.onConfirm(null)
    visible.value = false
  })
}

function getFileData(data: UploadFileData) {
  attachmentQrKey.value = data.qrCodeKey
}
</script>
