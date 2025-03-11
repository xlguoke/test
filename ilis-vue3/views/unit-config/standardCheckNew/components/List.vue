<template>
  <div class="h-full flex flex-col gap-2">
    <ilis-form-search
      :entity="StandardCheckNewEntity"
      @reset="handleReset"
      @search="handleSearch"
    />
    <a-space>
      <a-button v-permission="'add::check-new'" :icon="h(PlusOutlined)" @click="handleAdd">
        新增查新
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <ilis-table
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :table-height="tableHeight"
        :entity="StandardCheckNewEntity"
        :pagination="getPagination()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'verifiable'">
            {{ record.verified }} / {{ record.verifiable }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag
              :color="CHECKNEW_STATUS_DICT.getColorByKey(text)"
              class="cursor-pointer"
              :title="statusDescribe[record.id] || ''"
              @mouseenter="showStatusStatus(record as StandardCheckNewEntity)"
            >
              {{ CHECKNEW_STATUS_DICT.getLabelByKey(text) }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button
              v-if="showEdit(record.status)"
              v-permission="'edit::check-new'"
              type="link"
              @click="handleEdit(record as StandardCheckNewEntity)"
            >
              编辑
            </a-button>
            <a-button
              v-if="showEdit(record.status)"
              v-permission="'check-new-register'"
              type="link"
              @click="checkNewRegister(record as StandardCheckNewEntity)"
            >
              查新登记
            </a-button>
            <a-button
              v-if="showAudit(record.status)"
              v-permission="'check-new-submit-audit'"
              type="link"
              @click="submitAudit(record as StandardCheckNewEntity)"
            >
              提交审核
            </a-button>
            <a-button
              v-if="showRecord(record.status)"
              v-permission="'check-new-recordlist'"
              type="link"
              @click="openRecord(record as StandardCheckNewEntity)"
            >
              查看记录
            </a-button>
            <a-button
              v-if="showExport(record.status)"
              v-permission="'export::check-new-register'"
              type="link"
              @click="exportFun(record as StandardCheckNewEntity)"
            >
              导出台账
            </a-button>
            <!-- <a-button
              v-if="showExport(record.status)"
              v-permission="''"
              type="link"
              @click="printRecord"
            >
              打印记录表
            </a-button> -->
            <a-button
              v-if="showRevocation(record.status)"
              v-permission="'revocation::check-new'"
              type="link"
              danger
              @click="revocation(record.id)"
            >
              撤回
            </a-button>
            <a-button
              v-if="showEdit(record.status)"
              v-permission="'delete::check-new'"
              type="link"
              danger
              @click="deleteRow(record as StandardCheckNewEntity)"
            >
              删除
            </a-button>
          </template>
        </template>
      </ilis-table>
    </div>

    <!-- 新增、编辑 -->
    <AddEdit ref="addEditRef" @save="getList" />

    <!-- 查看记录 -->
    <ht-modal
      v-model:open="recordVisible"
      :title="showRow?.name"
      width="70%"
      hide-confirm
      @cancel="recordVisible = false"
    >
      <RecordList :id="showRow.id" :key="showRow.id" />
    </ht-modal>
  </div>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { exportRegisterListApi } from '../register/api'
import { checkNewStatusDescribe, deleteApi, pageListApi, revokeApi } from './api'
import { CHECKNEW_STATUS, CHECKNEW_STATUS_DICT, StandardCheckNewEntity } from './listEntity'
import AddEdit from './AddEdit.vue'
import RecordList from './RecordList.vue'
import Audit from './Audit.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

const statusDescribe: any = ref({})
const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getList,
  getPagination,
  handleSearch,
  handleReset,
  handleDelete,
  handleSortChange,
} = useTableHooks<StandardCheckNewEntity>({
  api: pageListApi,
  delApi: deleteApi,
  responseDataTransform: (res) => {
    statusDescribe.value = {}
    res.rows.forEach((d: StandardCheckNewEntity) => {
      statusDescribe.value[d.id] = ''
    })
    return res
  },
})

const addEditRef = ref()

/** 编辑、查新登记、删除按钮显示：未开始、进行中、待提交、未通过 */
function showEdit(status: CHECKNEW_STATUS) {
  const { NOT_START, PENDING, WAIT_SUBMIT, REJECTED } = CHECKNEW_STATUS
  return [NOT_START, PENDING, WAIT_SUBMIT, REJECTED].includes(status)
}

/** 待审核按钮显示：未开始、进行中、待提交、未通过 */
function showAudit(status: CHECKNEW_STATUS) {
  const { WAIT_SUBMIT, REJECTED } = CHECKNEW_STATUS
  return [WAIT_SUBMIT, REJECTED].includes(status)
}

/** 撤回按钮显示：审核中 */
function showRevocation(status: CHECKNEW_STATUS) {
  return status === CHECKNEW_STATUS.AUDIT
}

/** 查看记录按钮显示：审核中、已完成 */
function showRecord(status: CHECKNEW_STATUS) {
  const { AUDIT, FINISH } = CHECKNEW_STATUS
  return [AUDIT, FINISH].includes(status)
}

/** 导出台账按钮显示：已完成 */
function showExport(status: CHECKNEW_STATUS) {
  return status === CHECKNEW_STATUS.FINISH
}

/** 新增 */
function handleAdd() {
  addEditRef.value.showModal()
}

/** 编辑 */
function handleEdit(row: StandardCheckNewEntity) {
  addEditRef.value.showModal(row)
}

/** 提交审核 */
async function submitAudit(row: StandardCheckNewEntity) {
  await AnyDialogHelper.showModel(Audit, [row])
  getList()
}

/** 查询登记 */
function checkNewRegister(row: StandardCheckNewEntity) {
  if ((top as any).addTabs) {
    (top as any).addTabs({
      id: 'standardCheckNewRegister',
      title: '查新登记',
      close: false,
      url: `/ilis2/standard/view/check-new.do?page=register&id=${row.id}`,
    })
  }
  else {
    window.open(`/ilis2/standard/view/check-new.do?page=register&id=${row.id}`, '_blank')
  }
}

/** 撤回 */
function revocation(id: string) {
  Modal.warning({
    title: '提示',
    content: '确认要撤回该数据吗?',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      loading.value = true
      revokeApi(id).then(() => {
        message.success('操作成功')
        getList()
      }).finally(() => {
        loading.value = false
      })
    },
  })
}

/** 查看记录 */
const recordVisible = ref(false)
const showRow = ref(new StandardCheckNewEntity())
function openRecord(row: StandardCheckNewEntity) {
  showRow.value = row
  recordVisible.value = true
}

/** 导出台账 */
function exportFun(row: StandardCheckNewEntity) {
  exportRegisterListApi({
    standardCheckNewId: `${row.id}`,
  })
}

/** 打印记录表 */
// function printRecord() {}

/** 删除 */
function deleteRow(row: StandardCheckNewEntity) {
  handleDelete([row])
}

/** 状态列：鼠标悬浮显示信息 */
async function showStatusStatus(row: StandardCheckNewEntity) {
  if (statusDescribe.value[row.id])
    return
  const { data } = await checkNewStatusDescribe(`${row.id}`)
  statusDescribe.value[row.id] = data
}
</script>

<style>

</style>
