<template>
  <a-modal
    v-model:open="open"
    :title="title"
    width="80%"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      class="pt-4"
      :label-col="{ style: { width: '75px' } }"
    >
      <a-row :gutter="16">
        <a-col span="6">
          <a-form-item label="开始日期" name="recordStartDate" :rules="[{ required: true, message: '请选择日期！' }]">
            <span v-if="isDetail">{{ formState.recordStartDate }}</span>
            <a-date-picker
              v-else
              v-model:value="formState.recordStartDate"
              class="w-full"
              value-format="YYYY-MM-DD"
              @change="handleSearch()"
            />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="结束日期" name="recordEndDate" :rules="[{ required: true, message: '请选择日期！' }]">
            <span v-if="isDetail">{{ formState.recordEndDate }}</span>
            <a-date-picker
              v-else
              v-model:value="formState.recordEndDate"
              class="w-full"
              value-format="YYYY-MM-DD"
              @change="handleSearch()"
            />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="功能室" name="laboratoryId" :rules="[{ required: true, message: '请选择功能室！' }]">
            <div v-if="isDetail" class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="formState.laboratoryName">
              {{ formState.laboratoryName }}
            </div>
            <a-tree-select
              v-else
              v-model:value="laboratoryIds"
              :tree-data="laboratoryTreeData"
              tree-checkable
              allow-clear
              tree-default-expand-all
              placeholder="请选择"
              :max-tag-count="2"
              @change="onSelectLab"
            />
          </a-form-item>
        </a-col>
        <a-col span="6">
          <a-form-item label="台账名称" required>
            <span v-if="isDetail">{{ ledgerName }}</span>
            <a-input
              v-else
              v-model:value="ledgerName"
              placeholder="请输入"
              :maxlength="50"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <a-table
      row-key="id"
      :columns="columns"
      :data-source="dataSource"
      :pagination="isDetail ? detailPagination : getPagination()"
      :loading="loading"
      :scroll="{ y: 320 }"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'recordDate'">
          {{ record.recordDate ? dayjs(record.recordDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
        </template>
        <template v-if="column.dataIndex === 'temStatus'">
          {{ MStatusDict.getLabelByKey(record.temStatus) }}
        </template>
        <template v-if="column.dataIndex === 'humStatus'">
          {{ MStatusDict.getLabelByKey(record.humStatus) }}
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button @click="cancel">
        {{ isDetail ? "关闭" : "取消" }}
      </a-button>
      <a-button
        v-if="!isDetail"
        type="primary"
        :loading="submitLoading"
        @click="onSubmit"
      >
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import type {
  HumitureRecordDataItem,
  HumitureRecordListParams,
} from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import {
  getHumitureRecordList,
} from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import { MStatusDict } from '~/views/common/humiture/record'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { CreateHumitureLedgerEntity, createHumitureLedger } from '~/views/common/humiture/ledger/api/createHumitureLedger.ts'
import type {
  HumitureLedgerDetailRecordItem,
} from '~/views/common/humiture/ledger/api/getHumitureLedgerDetail.ts'
import {
  getHumitureLedgerDetail,
} from '~/views/common/humiture/ledger/api/getHumitureLedgerDetail.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object,
    default: () => {},
  },
  /** 查看详情ID */
  checkId: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '巡查时间', dataIndex: 'recordDate', width: 180 },
  { title: '功能室', dataIndex: 'laboratoryName', width: 180 },
  { title: '标准温度（℃）', dataIndex: 'standardTem', width: 180 },
  { title: '巡查温度（℃）', dataIndex: 'tem', width: 180 },
  { title: '温度状态', dataIndex: 'temStatus', width: 180 },
  { title: '标准湿度（%RH）', dataIndex: 'standardHum', width: 180 },
  { title: '巡查湿度（%RH）', dataIndex: 'hum', width: 180 },
  { title: '湿度状态', dataIndex: 'humStatus', width: 180 },
]

const open = computed(() => props.open)

const ledgerName = ref('')

const laboratoryIds = ref<string[]>([])

const formRef = ref()

const submitLoading = ref(false)

const formState = ref<HumitureRecordListParams>({})

const { laboratoryTreeData } = useLaboratoryOptionsHook()

const isDetail = computed(() => !!props.checkId)

const title = computed(() => isDetail.value ? '台账信息' : '创建台账')

const {
  loading,
  dataSource,
  handleSearch,
  getPagination,
} = useTableHooks<HumitureRecordDataItem | HumitureLedgerDetailRecordItem>({
  api: getHumitureRecordList,
  query: formState,
  immediate: false,
})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    if (isDetail.value) {
      onLoadDetail()
    }
    else {
      onReset()
    }
  }
})

const detailPagination = ref({
  total: dataSource.value.length,
  pageSize: 10,
  current: 1,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  onChange: (p: number, s: number) => {
    detailPagination.value.current = p
    detailPagination.value.pageSize = s
  },
})

function onReset() {
  formState.value = {}
  handleSearch()
}

function onSelectLab() {
  formState.value.laboratoryId = laboratoryIds.value.join(',')
  handleSearch()
}

// 加载详情
async function onLoadDetail() {
  if (props.checkId) {
    const res = await getHumitureLedgerDetail(props.checkId)
    const data = res.data

    formState.value.recordStartDate = data.ledgerStartDate ? dayjs(data.ledgerStartDate).format('YYYY-MM-DD') : ''
    formState.value.recordEndDate = data.ledgerEndDate ? dayjs(data.ledgerEndDate).format('YYYY-MM-DD') : ''
    formState.value.laboratoryName = data.laboratoryName

    ledgerName.value = data.name
    laboratoryIds.value = data.laboratoryId ? data.laboratoryId.split(',') : []

    dataSource.value = data.recordList
  }
}

function onSubmit() {
  if (!ledgerName.value) {
    message.warn('请输入台账名称！')
    return
  }

  if (+new Date(formState.value.recordEndDate as string) < +new Date(formState.value.recordStartDate as string)) {
    Modal.info({
      title: '提示',
      content: '结束时间必须大于或等于开始时间！',
    })
    return
  }

  formRef.value.validateFields().then(async () => {
    const data = new CreateHumitureLedgerEntity()
    data.laboratoryId = formState.value.laboratoryId
    data.ledgerStartDate = formState.value.recordStartDate
    data.ledgerEndDate = formState.value.recordEndDate
    data.name = ledgerName.value

    submitLoading.value = true
    await createHumitureLedger(data).finally(() => {
      submitLoading.value = false
    })
    emits('onSave')
    message.success('操作成功')
    cancel()
  })

  // Modal.confirm({
  //   title: '提示',
  //   centered: true,
  //   content: '你选择的时间段范围内已存在台账，是否继续创建？',
  //   onOk: () => {
  //     formRef.value.validateFields().then(async () => {
  //       submitLoading.value = true
  //       // await saveStandardApi(formState.value).finally(() => {
  //       //   submitLoading.value = false
  //       // })
  //       message.success('保存成功')
  //       emits('onSave')
  //       cancel()
  //     })
  //   },
  // })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
  formState.value = {}
  ledgerName.value = ''
  dataSource.value = []
  laboratoryIds.value = []
  detailPagination.value.current = 1
  detailPagination.value.pageSize = 10
}
</script>
