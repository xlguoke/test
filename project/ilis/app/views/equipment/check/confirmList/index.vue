<template>
  <IlisContainer app-id="check_confirm_list">
    <BaseSpinWrapper :spinning="loading">
      <IlisFormSearch
        :entity="EquipmentCheckConfirmEntity"
        @reset="customReset"
        @search="handleSearch"
      >
        <template #checkPlanName="{ data }">
          <IlisInput
            v-model="data.checkPlanName"
            field="checkPlanName"
            :entity="EquipmentCheckConfirmEntity"
            :options="checkPlanOptions"
          >
          </IlisInput>
        </template>
      </IlisFormSearch>
      <a-flex justify="between">
        <HtButtonGroup class="flex-1 w-0">
          <a-dropdown v-if="hasPermission('saveEquipmentCheckRecord')" :disabled="EQUIPMENT_10">
            <template #overlay>
              <a-menu @click="handleAddMenuClick">
                <a-menu-item key="addByPlan">
                  按计划新增
                </a-menu-item>
                <a-menu-item key="addByDevice">
                  按设备新增
                </a-menu-item>
                <a-menu-item key="addBySend">
                  按送检登记新增
                </a-menu-item>
              </a-menu>
            </template>
            <a-button :title="EQUIPMENT_10 ? '已启用按检校计划确认登记' : ''">
              新增检校确认
              <DownOutlined></DownOutlined>
            </a-button>
          </a-dropdown>
          <a-button v-if="hasPermission('submitCheckRecord')" :icon="h(FileDoneOutlined)" @click="handleProcess(selectedRows)">
            提交审批
          </a-button>
          <a-button v-if="hasPermission('directConfirm')" :icon="h(FileDoneOutlined)" @click="handleDirectConfirm">
            直接确认
          </a-button>
          <a-button :icon="h(PrinterOutlined)" @click="IlisPrintUdr.commonPrint([], 'EquipmentCheckLedger', { jsonParam: lastSearchParams })">
            打印
          </a-button>
          <a-button v-if="hasPermission('checkImportEq')" :icon="h(ImportOutlined)" @click="handleImport">
            导入
          </a-button>
          <a-button v-if="!EQUIPMENT_10 && hasPermission('checkImportEqConfig')" :icon="h(SettingOutlined)" @click="AnyDialogHelper.showModel(ImportConfigModal).then(() => handleReloadTable())">
            导入项配置
          </a-button>
          <a-button v-if="!EQUIPMENT_10 && hasPermission('CopyEquipmentCheck')" :icon="h(CopyOutlined)" @click="handleCopy">
            复制
          </a-button>
          <a-dropdown v-if="hasPermission('submitCheckRecord')">
            <template #overlay>
              <a-menu @click="handleBatchMenuClick">
                <a-menu-item key="batchUploadCert">
                  批量上传证书
                </a-menu-item>
                <a-menu-item key="batchClearCert">
                  批量清除证书
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              批量操作
              <DownOutlined></DownOutlined>
            </a-button>
          </a-dropdown>
          <a-button v-if="hasPermission('deleteOrRestore')" danger @click="batchVoidRestore(VIOD_RESOTRE.VIOD)">
            作废
          </a-button>
          <a-button v-if="hasPermission('deleteOrRestore')" @click="batchVoidRestore(VIOD_RESOTRE.RESTORE)">
            取消作废
          </a-button>
          <IlisCustomColumns
            type="equipmentCheck"
            @confirm="handleReloadTable()"
          ></IlisCustomColumns>
          <a-button
            :icon="h(ExportOutlined)"
            @click="handleExport('checkController.do?export', {
              objId: selectedRows.map(item => item.id)?.join(','),
            })"
          >
            导出
          </a-button>
        </HtButtonGroup>
        <div v-permission="'showDeleteData'" class="pt-2 ml-8 whitespace-nowrap">
          <a-checkbox v-model:checked="queryParams.isCancel" @change="changeIsCancel">
            显示已作废数据
          </a-checkbox>
        </div>
      </a-flex>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :data-source="dataSource"
          :entity="EquipmentCheckConfirmEntity"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          :custom-columns="customColumns"
          :extra-columns="extraColumns"
          :field-order="['checkPlanName']"
          :table-width="800"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <BaseStatusTag :color="CheckStatusDict.getColorByKey(record.status)">
                {{ CheckStatusDict.getLabelByKey(record.status) }}
              </BaseStatusTag>
              <BaseStatusTag v-if="record.deleted" color="#e73e3e">
                废
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="[CheckStatus.WAIT_APPROVE, CheckStatus.APPROVE_REJECT, CheckStatus.APPROVE_REJECTED].includes(record.status)"
                v-permission="'editEquipmentCheckRecord'"
                type="link"
                @click="AnyDialogHelper.showModel(AddByDevice, { EQUIPMENT_10, id: record.id }).then(() => handleReloadTable())"
              >
                编辑
              </a-button>
              <a-button
                v-if="[CheckStatus.WAIT_APPROVE, CheckStatus.APPROVE_REJECT, CheckStatus.APPROVE_REJECTED].includes(record.status)"
                v-permission="'submitCheckRecord'"
                type="link"
                @click="handleProcess([record as EquipmentCheckConfirmEntity])"
              >
                提交
              </a-button>
              <a-button
                v-if="[CheckStatus.WAIT_APPROVE, CheckStatus.APPROVE_REJECT, CheckStatus.APPROVE_REJECTED, CheckStatus.APPROVE_SUCCESS].includes(record.status)"
                type="link"
                @click="handlePrintRow(record as EquipmentCheckConfirmEntity)"
              >
                打印
              </a-button>
              <a-button
                v-if="[CheckStatus.APPROVE_ING].includes(record.status)"
                type="link"
                @click="handleRevoke(record as EquipmentCheckConfirmEntity)"
              >
                撤回
              </a-button>
              <a-button
                v-if="[CheckStatus.APPROVE_ING, CheckStatus.APPROVE_SUCCESS].includes(record.status)"
                type="link"
                @click="AnyDialogHelper.showModel(AddByDevice, {
                  EQUIPMENT_10,
                  id: record.id,
                  isReadonly: true,
                }).then(() => handleReloadTable())"
              >
                详情
              </a-button>
              <a-button
                v-if="[CheckStatus.WAIT_APPROVE, CheckStatus.APPROVE_REJECT, CheckStatus.APPROVE_REJECTED].includes(record.status) && !EQUIPMENT_10"
                v-permission="'deleteChekRecord'"
                type="link"
                danger
                @click="handleDelete([record] as EquipmentCheckConfirmEntity[])"
              >
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { EquipmentCheckPlanEntity } from '../plan/EquipmentCheckPlanEntity'
import type { IOption } from '~/interface/IOption'
import {
  CopyOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FileDoneOutlined,
  ImportOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'

import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import HtButtonGroup from '~/components/htButtonGroup'
import CheckPlanSelector from '~/components/selectorViaMethodCall/CheckPlanSelector.vue'
import { BaseStatusTag } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { getCheckPlanList } from '../plan/api'
import { addEquipmentCheckConfirmByPlan, batchDelCertificate, batchInvalid, copyEquipmentCheckConfirm, delEquipmentCheckConfirm, getEquipmentCheckConfirmList, revokeCheckConfirm, submitEquipmentCheckConfirm, VIOD_RESOTRE } from './api'
import AddByDevice from './components/AddByDevice.vue'
import AddBySend from './components/AddBySend.vue'
import BatchUploadCertModal from './components/BatchUploadCertModal.vue'
import DirectConfirm from './components/DirectConfirm.vue'
import ImportConfigModal from './components/ImportConfigModal.vue'
import ImportModal from './components/ImportModal.vue'
import { CheckStatus, CheckStatusDict, EquipmentCheckConfirmEntity } from './EquipmentCheckConfirmEntity'

const { hasPermission } = usePermissionStore()

const queryParams = ref({
  isCancel: false,
})

const {
  loading,
  dataSource,
  customColumns,
  selectedRows,
  selectedRowKeys,
  lastSearchParams,
  tableBoxRef,
  tableHeight,
  getList,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleDelete,
  handleExport,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<EquipmentCheckConfirmEntity>({
  sizeKey: 'rows',
  customType: 'equipmentCheck',
  api: getEquipmentCheckConfirmList,
  delApi: delEquipmentCheckConfirm,
})

function initIsDelete() {
  return {
    isCancel: queryParams.value.isCancel ? 1 : undefined,
    deleted: queryParams.value.isCancel ? 1 : undefined,
  }
}

// 重置
function customReset(q: any) {
  handleReset({
    ...q,
    ...initIsDelete(),
  })
}

// 切换是否显示已作废数据
function changeIsCancel() {
  const query = {
    ...lastSearchParams.value,
    ...initIsDelete(),
  }
  handleSearch(query)
}

const checkPlanOptions = ref<IOption[]>([])

/** # 系统控制参数 检校确认仅支持从已通过审批的计划中引用设备 */
const EQUIPMENT_10 = ref(false)

const extraColumns = computed(() => {
  if (EQUIPMENT_10.value) {
    return [{
      title: '计划名称',
      dataIndex: 'checkPlanName',
      width: 100,
    }]
  }
  return []
})

async function init() {
  EQUIPMENT_10.value = await getBusinessParam('EQUIPMENT_10')
}

init()

async function getPlanOptions() {
  const { data } = await getCheckPlanList({ rows: 999 })
  checkPlanOptions.value = data?.rows?.map((item: any) => {
    return {
      label: item.name,
      value: item.name,
    }
  })
}
getPlanOptions()

async function handleAddMenuClick(node: any) {
  switch (node.key) {
    case 'addByPlan':
      handleAddByPlan()
      break
    case 'addByDevice':
      handleAddByDevice()
      break
    case 'addBySend':
      handleAddBySend()
      break
  }
}

async function handleAddByPlan() {
  const res = await AnyDialogHelper.showSelector<EquipmentCheckPlanEntity>(CheckPlanSelector)
  await addEquipmentCheckConfirmByPlan(res[0])
  handleReloadTable()
}

async function handleAddByDevice() {
  await AnyDialogHelper.showModel(AddByDevice, { EQUIPMENT_10: EQUIPMENT_10.value })
  handleReloadTable()
}

async function handleAddBySend() {
  await AnyDialogHelper.showModel(AddBySend)
  handleReloadTable()
}

async function handleBatchMenuClick(node: any) {
  switch (node.key) {
    case 'batchUploadCert':
      await AnyDialogHelper.showModel(BatchUploadCertModal)
      handleReloadTable()
      break
    case 'batchClearCert':
      handleBatchClearCert()
      break
  }
}

async function handleBatchClearCert() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择数据！')
  }
  if (selectedRows.value?.some(item => item.status === CheckStatus.APPROVE_ING || item.status === CheckStatus.APPROVE_SUCCESS)) {
    return message.warning('不能操作审批中和审批通过的数据，请重新选择')
  }
  Modal.confirm({
    title: '提示',
    content: '是否清除已选设备的检校证书附件？?',
    centered: true,
    async onOk() {
      await batchDelCertificate(selectedRows.value)
      handleReloadTable()
      message.success('操作成功')
    },
  })
}

async function handleCopy() {
  if (selectedRows.value?.length !== 1) {
    return message.warning('请选择一条数据！')
  }
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要复制选中的数据吗?',
    centered: true,
    async onOk() {
      loading.value = true
      await copyEquipmentCheckConfirm({
        ids: selectedRows.value.map(item => item.id)?.join(','),
      }).finally(() => {
        loading.value = false
      })
      message.success('复制成功')
      handleReloadTable()
    },
  })
}

async function handleProcess(rows: EquipmentCheckConfirmEntity[]) {
  if (!rows?.length) {
    return message.warning('请选择数据！')
  }
  if (rows?.some(item => item.status === CheckStatus.APPROVE_ING || item.status === CheckStatus.APPROVE_SUCCESS)) {
    return message.warning(`检校状态为“${CheckStatusDict.getLabelByKey(CheckStatus.WAIT_APPROVE)}”或“${CheckStatusDict.getLabelByKey(CheckStatus.APPROVE_REJECT)}”的才能提交，请重新选择`)
  }
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.EQ_CHECK_SURE,
    processId: rows[0].id,
    queryParams: { id: rows?.map(item => item.id)?.join(',') },
    submitAuditApi: submitEquipmentCheckConfirm,
    submitDataTransfer: (data: any) => {
      return {
        ...data,
        presetAuditers: encodeURIComponent(data.presetAuditers),
      }
    },
  })
  handleReloadTable()
}

async function handleRevoke(row: EquipmentCheckConfirmEntity) {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要撤回吗',
    centered: true,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      await revokeCheckConfirm(row)
      message.success('撤回成功')
      handleReloadTable()
    },
  })
}

async function handleDirectConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择一条数据')
  }
  if (selectedRows.value?.length > 1) {
    return message.warning('只能选择一条数据')
  }
  if (selectedRows.value?.[0]?.status === CheckStatus.APPROVE_SUCCESS) {
    return message.warning('已审批通过，不能再提交')
  }
  if (selectedRows.value?.[0]?.status === CheckStatus.APPROVE_ING) {
    return message.warning('审核中，不能再提交')
  }
  await AnyDialogHelper.showModel(DirectConfirm, selectedRows.value?.[0])
  handleReloadTable()
}

async function handleImport() {
  await AnyDialogHelper.showModel(ImportModal, { EQUIPMENT_10: EQUIPMENT_10.value })
  handleReloadTable()
}

async function handlePrintRow(row: EquipmentCheckConfirmEntity) {
  if (!row.confirmFile || row.confirmFile === 'null') {
    IlisPrintUdr.commonPrint([row.id], 'EquipmentCheck')
  }
  else {
    const iframe = document.createElement('iframe')
    iframe.src = row.confirmFile
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    iframe.onload = function () {
      const win = iframe.contentWindow
      if (win) {
        win.print()
        win.onafterprint = function () {
          document.body.removeChild(iframe)
        }
      }
    }
  }
}

async function batchVoidRestore(type: VIOD_RESOTRE) {
  if (selectedRows.value.length === 0) {
    return message.warning('请选择检校确认数据')
  }
  const isDel = type === VIOD_RESOTRE.VIOD
  if (!isDel) {
    const unDelete = selectedRows.value.some(item => !item.deleted)
    if (unDelete) {
      return message.warning('仅支持已作废的检校确认数据（确认状态列中有作废标识）进行取消！')
    }
  }
  else {
    const unSuccess = selectedRows.value.some(item => item.deleted || item.status !== CheckStatus.APPROVE_SUCCESS)
    if (unSuccess) {
      return message.warning('仅支持确认状态为“已通过”的数据进行作废！')
    }
  }
  const msg = isDel ? '' : '取消'
  Modal.confirm({
    title: `${msg}作废检校确认记录！`,
    content: () => h('div', {}, [
      `您确定要${msg}作废当前所选择的`,
      h('span', { style: { color: 'red' } }, selectedRows.value.length),
      '条检校确认数据吗？',
    ]),
    centered: true,
    async onOk() {
      try {
        loading.value = true
        const { data } = await batchInvalid({
          ids: selectedRowKeys.value as string[],
          type,
        })
        loading.value = false
        if (data.code === 20000) {
          message.success('操作成功！')
          getList()
        }
      }
      catch (err) {
        loading.value = false
        throw new Error((err as Error).message)
      }
    },
  })
}
</script>
