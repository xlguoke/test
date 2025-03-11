<template>
  <div class="h-full flex flex-col gap-2">
    <base-title class="!mb-0">
      {{ checkNewName }}
      <a-tag :color="CHECKNEW_STATUS_DICT.getColorByKey(checkNewStatus)" class="ml-2">
        {{ CHECKNEW_STATUS_DICT.getLabelByKey(checkNewStatus) }}
      </a-tag>
    </base-title>
    <ilis-form-search
      :entity="StandardCheckNewRegisterEntity"
      @reset="handleReset"
      @search="customHandleSearch"
    />
    <a-space wrap>
      <a-button v-permission="'add::wait-check-new'" :icon="h(LinkOutlined)" @click="handleAdd">
        添加待查新规程
      </a-button>
      <a-button v-permission="'mark::not-update'" :icon="h(TagOutlined)" @click="handleMark">
        标记无更新
      </a-button>
      <a-button v-permission="'quote-system-query-result'" :icon="h(SyncOutlined)" @click="handleCheckNewResult">
        引用系统查新结果
      </a-button>
      <a-button v-permission="'delete::check-new-register'" :icon="h(DeleteOutlined)" @click="deleteRows()">
        删除
      </a-button>
      <a-button
        v-permission="'check-new-submit-audit'"
        :icon="h(ToTopOutlined)"
        :loading="auditLoading"
        @click="submitAudit"
      >
        提交审核
      </a-button>
      <!-- 自定义属性配置 -->
      <CustomAttribute v-permission="'custom-attuibute-config'" :customize-type="CUSTOM_ATTRIBUTE_TYPE" @save="handleReloadTable" />
      <!-- 列筛选 -->
      <IlisCustomColumns :type="CUSTOM_COLUMN_TYPE" @confirm="handleReloadTable" />
      <a-button v-permission="'export::check-new-register'" :icon="h(ExportOutlined)" @click="handleExport">
        导出列表
      </a-button>
      <a-button v-permission="'import::check-new-result'" :icon="h(ImportOutlined)" @click="handleImport">
        导入查新结果
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="mt-2 flex-1 h-0">
      <ilis-table
        row-key="id"
        :loading="loading"
        :data-source="dataSource"
        :table-height="tableHeight"
        :entity="StandardCheckNewRegisterEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'action'">
            <a-button
              v-permission="'edit::check-new-register'"
              type="link"
              @click="checkNewRegister(record as StandardCheckNewRegisterEntity)"
            >
              查新登记
            </a-button>
            <a-button
              v-permission="'delete::check-new-register'"
              type="link"
              danger
              @click="deleteRows(record as StandardCheckNewRegisterEntity)"
            >
              删除
            </a-button>
          </template>
        </template>
      </ilis-table>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { DeleteOutlined, ExportOutlined, ImportOutlined, LinkOutlined, SyncOutlined, TagOutlined, ToTopOutlined } from '@ant-design/icons-vue'
import Audit from '../components/Audit.vue'
import { type CHECKNEW_STATUS, CHECKNEW_STATUS_DICT } from '../components/listEntity'
import { CUSTOM_ATTRIBUTE_TYPE, CUSTOM_COLUMN_TYPE, StandardCheckNewRegisterEntity } from './listEntity'
import AddEdit from './components/AddEdit.vue'
import ImportResult from './components/ImportResult.vue'
import { boforeAuditSubmitCheck, deleteApi, exportRegisterListApi, markNotRefresh, modalError, recordListApi } from './api'
import { CHECKNEW_RECORD_STATUS, CheckNewResult } from './components/checkNewResult'
import { WaitCheckNewStandard } from './components/waitCheckNewStandard'
import { CustomAttribute } from '~/components/customAttribute'
import { IlisCustomColumns } from '~/components/ilisComponent'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps<{
  checkNewName: string
  checkNewId: string
  checkNewStatus: CHECKNEW_STATUS
}>()
const { checkNewName, checkNewId, checkNewStatus } = toRefs(props)

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRows,
  selectedRowKeys,
  customColumns,
  lastSearchParams,
  getList,
  handleReloadTable,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
  handleDelete,
  handleSortChange,
} = useTableHooks<StandardCheckNewRegisterEntity>({
  api: recordListApi,
  delApi: deleteApi,
  payload: {
    standardCheckNewId: checkNewId.value,
  },
  customType: CUSTOM_COLUMN_TYPE,
  responseDataTransform: (res) => {
    res.rows.forEach((item: StandardCheckNewRegisterEntity) => {
      item.standardType = `${item.standardType}`
    })
    return res
  },
})

/** 查询 */
function customHandleSearch(query: any) {
  const q = { ...query }
  // 执行日期
  if (q.searchExecuteDate && q.searchExecuteDate.length) {
    q.newStandardExecuteStartDate = q.searchExecuteDate[0]
    q.newStandardExecuteEndDate = q.searchExecuteDate[1]
    delete q.searchExecuteDate
  }
  else {
    q.newStandardExecuteStartDate = q.newStandardExecuteEndDate = undefined
  }
  // 查新日期
  if (q.searchCheckDate && q.searchCheckDate.length) {
    q.checkStartDate = q.searchCheckDate[0]
    q.checkEndDate = q.searchCheckDate[1]
    delete q.searchCheckDate
  }
  else {
    q.checkStartDate = q.checkEndDate = undefined
  }
  handleSearch(q)
}

/** 添加待查新规程 */
async function handleAdd() {
  await AnyDialogHelper.showModel(WaitCheckNewStandard, {
    checkNewId: checkNewId.value,
    onConfirm: () => {
      getList()
    },
  })
  // 点击弹窗确认按钮后执行
  getList()
}

/** 引用系统查询结果  */
async function handleCheckNewResult() {
  await AnyDialogHelper.showModel(CheckNewResult, {
    checkNewId: checkNewId.value,
    onConfirm: () => {
      getList()
    },
  })
  getList()
}

/** 标记无更新：检查状态，只能设置待查询的数据 */
async function handleMarkStatus() {
  return new Promise((resolve) => {
    const { PENDING, NOT_REQUIRED } = CHECKNEW_RECORD_STATUS
    const markValid = selectedRows.value.filter(d => d.status && ![PENDING, NOT_REQUIRED].includes(d.status))
    let msg = '您确定将所选规程的查新结果统一设置为“暂无更新”吗？'
    if (markValid.length > 0) {
      msg = '含有更新记录的规程，是否将其设置为“暂无更新”，请确认'
    }
    Modal.confirm({
      title: '查新结果确认！',
      content: msg,
      centered: true,
      onOk() {
        resolve(true)
      },
      onCancel() {
        resolve(false)
      },
    })
  })
}

/** 标记无更新 */
const markLoading = ref(false)
async function handleMark() {
  if (selectedRowKeys.value.length === 0) {
    return message.warning('请选择规程')
  }
  if (!await handleMarkStatus())
    return

  markLoading.value = true
  await markNotRefresh(selectedRowKeys.value)
    .finally(() => markLoading.value = false)
  message.success('操作成功')
  selectedRowKeys.value = []
  getList()
}

/** 查询登记 */
async function checkNewRegister(row: StandardCheckNewRegisterEntity) {
  await AnyDialogHelper.showModel(AddEdit, row)
  getList()
}

/** 提交审核 */
const auditLoading = ref(false)
async function submitAudit() {
  auditLoading.value = true
  const { data } = await boforeAuditSubmitCheck(checkNewId.value).finally(() => {
    auditLoading.value = false
  })
  if (!data) {
    modalError('当前存在待查新的规程信息，无法提交审核，请查新完成后再提交！', '存在待查新的规程信息！')
    return
  }
  await AnyDialogHelper.showModel(Audit, [{ id: checkNewId.value }])
  window.location.reload()
}

/** 删除 */
function deleteRows(row?: StandardCheckNewRegisterEntity) {
  const delConfig = {
    title: '规程查新删除确认！',
    content: '您确定要删除当前或选择的查新记录吗？',
  }
  if (row) {
    handleDelete([row], delConfig)
  }
  else {
    if (selectedRows.value.length === 0) {
      return message.warning('请选择要删除的数据')
    }
    handleDelete(selectedRows.value, delConfig)
  }
}

/** 导出列表 */
async function handleExport() {
  exportRegisterListApi(lastSearchParams.value)
}

/** 导入查新结果 */
async function handleImport() {
  await AnyDialogHelper.showModel(ImportResult, {
    checkNewId: checkNewId.value,
    queryParam: lastSearchParams.value,
  })
  getList()
}
</script>

<style>

</style>
