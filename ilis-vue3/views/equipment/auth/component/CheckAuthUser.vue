<template>
  <HtModal
    v-model:open="visible"
    :title="title"
    :width="processView ? '640px' : '800px'"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="onClose"
  >
    <a-space v-if="!processView" class="mt-4">
      <a-input
        v-model:value.trim="quickQry"
        allow-clear
        class="w-[220px]"
        placeholder="请输入人员姓名或身份证号查询"
      />
      <a-button type="primary" @click="getList()">
        查询
      </a-button>
    </a-space>

    <div class="mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        :scroll="{ y: 420 }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'personStatus'">
            <span v-if="record.personStatus === '0'">在职</span>
            <span v-if="record.personStatus === '1'">离职</span>
          </template>
          <template v-if="column.dataIndex === 'authStatus'">
            <span v-if="record.authStatus === '40'">生效中</span>
            <span v-if="record.authStatus === '20'">审核中</span>
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-button
              v-if="record.authStatus !== '20'"
              type="link"
              danger
              @click="onDel(record)"
            >
              移除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { Modal, message } from 'ant-design-vue'
import type { EquipmentAuthEntity } from '../EquipmentAuthEntity.ts'
import type { EqAuthUserEntity } from '../api'
import { delEqAuthUser, getEqAuthUser } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EquipmentAuthEntity>>()

const visible = ref(true)

const rowData = ref<EquipmentAuthEntity>(props.param)

const processId = computed(() => rowData.value._processId)

const processView = computed(() => !!processId.value)

const title = computed(() => {
  let t = '授权操作人员'

  if (processView.value) {
    t = '授权记录详情'
  }

  if (rowData.value.equipmentSn) {
    return `${rowData.value.name}（${rowData.value.equipmentSn}）的${t}`
  }
  return `${rowData.value.name}的${t}`
})

const quickQry = ref('')

const loading = ref(false)

const dataSource = ref([])

const columns = computed(() => {
  if (processView.value) {
    return [
      {
        title: '序号',
        dataIndex: 'index',
        width: 48,
        customRender: ({ index }: any) => {
          return index + 1
        },
      },
      {
        title: '姓名',
        dataIndex: 'personName',
        width: 85,
      },
      {
        title: '身份证号',
        dataIndex: 'identityNumber',
        width: 120,
      },
      {
        title: '任职部门',
        dataIndex: 'department',
        width: 120,
      },
      {
        title: '人员状态',
        dataIndex: 'personStatus',
        width: 80,
      },
    ]
  }

  return [
    {
      title: '姓名',
      dataIndex: 'personName',
      width: 85,
    },
    {
      title: '身份证号',
      dataIndex: 'identityNumber',
      width: 120,
    },
    {
      title: '任职部门',
      dataIndex: 'department',
      width: 120,
    },
    {
      title: '人员状态',
      dataIndex: 'personStatus',
      width: 80,
    },
    {
      title: '授权状态状态',
      dataIndex: 'authStatus',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'Action',
      width: 80,
    },
  ]
})

getList()

async function getList() {
  loading.value = true
  const res = await getEqAuthUser(rowData.value.id, {
    page: 1,
    size: 999,
    quickQry: quickQry.value,
    processId: processId.value || undefined,
  }).finally(() => {
    loading.value = false
  })

  dataSource.value = res.data.rows
}

function onDel(row: EqAuthUserEntity) {
  Modal.confirm({
    title: '您正在移除当前人员授权！',
    content: '移除授权后将无法撤回，您确认要移除授权吗？',
    async onOk() {
      await delEqAuthUser(row.id)
      message.success('操作成功！')
      getList()
      props.onConfirm(null)
    },
  })
}

function onClose() {
  visible.value = false
}
</script>
