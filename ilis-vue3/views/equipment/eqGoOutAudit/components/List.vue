<template>
  <div class="h-full flex flex-col gap-2">
    <IlisFormSearch
      :entity="EqGoOutAuditEntity"
      @search="customHandleSearch"
      @reset="handleReset"
    >
      <template #q="{ data }">
        <a-form-item-rest>
          <a-input-group compact>
            <a-select v-model:value="quickType" style="width: 120px;" @change="data.q = ''">
              <a-select-option v-for="d in quickTypeOptions" :key="d.value" :value="d.value">
                {{ d.label }}
              </a-select-option>
            </a-select>
            <a-input
              v-model:value="data.q"
              style="width: 220px;"
              placeholder="请输入"
              allow-clear
            />
          </a-input-group>
        </a-form-item-rest>
      </template>
    </IlisFormSearch>
    <a-space>
      <a-button v-permission="'add::eqEgressApply'" type="primary" @click="handleAdd">
        <PlusOutlined />新增外出申请
      </a-button>
      <a-button v-permission="'print::eqEgressApply'" :loading="printLoading" @click="handlePrint">
        <PrinterOutlined />打印
      </a-button>
      <a-button v-permission="'export::eqEgressApply'" @click="handleExport(exportApiUrl)">
        <ExportOutlined />导出
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :entity="EqGoOutAuditEntity"
        :data-source="dataSource"
        :loading="loading"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :table-height="tableHeight"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'tag'">
            <span v-if="record.tag === 'recall' && record.applyStatus === EGRESS_APPLY_STATUS.SUBMIT" class="text-[red]">退</span>
            <span v-else></span>
          </template>
          <template v-else-if="column.dataIndex === 'options'">
            <a-button
              v-if="record.applyStatus !== EGRESS_APPLY_STATUS.SUBMIT"
              v-permission="'detail::eqEgressApply'"
              type="link"
              @click="handleDetail(record as EqGoOutAuditEntity)"
            >
              详情
            </a-button>
            <template v-else>
              <a-button v-permission="'edit::eqEgressApply'" type="link" @click="handleEdit(record as EqGoOutAuditEntity)">
                编辑
              </a-button>
              <a-button v-permission="'submit::eqEgressApply'" type="link" :loading="submitLoading" @click="handleSubmit(record as EqGoOutAuditEntity)">
                提交
              </a-button>
              <a-button v-permission="'delete::eqEgressApply'" type="link" danger @click="handleDelete([record as EqGoOutAuditEntity])">
                删除
              </a-button>
            </template>
            <a-button
              v-if="record.applyStatus === EGRESS_APPLY_STATUS.AUDIT"
              v-permission="'recall::eqEgressApply'"
              type="link"
              @click="handleRecall(record as EqGoOutAuditEntity)"
            >
              撤回
            </a-button>
            <a-button type="link" @click="handleLog(record as EqGoOutAuditEntity)">
              日志
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ExportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { Modal, Textarea, message } from 'ant-design-vue'
import { auditApi, deleteApi, exportApiUrl, pageListApi, recallApi } from '../api'
import { EGRESS_APPLY_STATUS, EqGoOutAuditEntity } from '..'
import AddEdit, { type PropsParam } from './AddEdit.vue'
import DetailModal from './DetailModal.vue'
import { type IProcessForm, ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

const quickTypeOptions = [
  { label: '外出申请单号', value: 'egressApplySn' },
  { label: '工程项目名称', value: 'project' },
  { label: '任务编号', value: 'testTaskSn' },
  { label: '借用人', value: 'borrowUser' },
]
const quickType = ref('egressApplySn')

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRowKeys,
  getList,
  handleSearch,
  handleReset,
  handleDelete,
  getRowSelection,
  getPagination,
  handleExport,
} = useTableHooks<EqGoOutAuditEntity>({
  api: pageListApi,
  delApi: deleteApi,
  totalKey: 'count',
})

/**
 * 搜索
 */
function customHandleSearch(data: any) {
  if (data.createDate && data.createDate.length) {
    data.createDateStartStr = `${data.createDate[0]} 00:00:00`
    data.createDateEndStr = `${data.createDate[1]} 23:59:59`
    delete data.createDate
  }
  else {
    data.createDateStartStr = undefined
    data.createDateEndStr = undefined
  }
  for (let i = 0; i < quickTypeOptions.length; i++) {
    const item = quickTypeOptions[i]
    if (item.value === quickType.value) {
      data[item.value] = data.q
    }
    else {
      data[item.value] = undefined
    }
  }
  delete data.q
  handleSearch(data)
}

/**
 * 打印
 */
const printLoading = ref(false)
function handlePrint() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择一条数据')
    return ''
  }
  IlisPrintUdr.commonPrint(selectedRowKeys.value as string[], 'EqEgressApply')
}

/** 新增 */
async function handleAdd() {
  await AnyDialogHelper.showModel(AddEdit)
  getList()
}

/** 编辑 */
async function handleEdit(record: EqGoOutAuditEntity) {
  await AnyDialogHelper.showModel(AddEdit, {
    entity: record,
    editType: 'edit',
  } as PropsParam)
  getList()
}

/** 详情 */
async function handleDetail(record: EqGoOutAuditEntity) {
  await AnyDialogHelper.showModel(DetailModal, record)
}

/** 提交 */
const submitLoading = ref(false)
async function handleSubmit(record: EqGoOutAuditEntity) {
  submitLoading.value = true
  setTimeout(() => {
    submitLoading.value = false
  }, 500)
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.EQ_EGRESS_APPLY,
    processId: record.id,
    hideRemark: true,
    submitAuditApi: auditApi,
    submitDataTransfer: (data: any) => {
      return {
        id: record.id,
        formPropertyJson: data.formPropertyJson,
        presetAuditors: data.presetAuditers,
      }
    },
  } as IProcessForm)
  getList()
  message.success('提交成功')
}

/** 撤回 */
const recallVal = ref('')
function handleRecall(record: EqGoOutAuditEntity) {
  recallVal.value = ''
  Modal.confirm({
    title: '确认撤回？',
    content: () => h(Textarea, {
      placeholder: '请输入撤回原因',
      onChange: (e) => {
        recallVal.value = e.target.value || ''
      },
    }),
    onOk: async () => {
      if (!recallVal.value) {
        message.warning('请输入撤回原因')
        return Promise.reject(new Error('请输入撤回原因'))
      }
      await recallApi({
        id: record.egressApplyId,
        recallDesc: recallVal.value,
      })
      message.success('撤回成功')
      getList()
    },
  })
}

/** 日志 */
async function handleLog(record: EqGoOutAuditEntity) {
  await AnyDialogHelper.showModel(LogModalByApi, {
    id: record.id,
    logType: '39',
  })
}
</script>

<style>

</style>
