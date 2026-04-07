<!-- 该文件同时作为资产调拨申请和设备调拨申请使用 -->
<template>
  <IlisContainer :app-id="allotConfig[type].moduleMountId">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        show-search-tag
        :entity="EquipmentAllotApplyEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button
          v-permission="allotConfig[type].permissions.add"
          type="primary" :icon="h(PlusOutlined)" @click="handleEdit(EquipmentAllotApplyEntity.fromJSON({}))"
        >
          新增申请
        </a-button>
        <CustomAttribute
          v-permission="allotConfig[type].permissions.customProperties"
          :customize-type="allotConfig[type].customPropertiesKey"
          @save="handleReloadTable()"
        />
        <IlisCustomColumns
          v-permission="allotConfig[type].permissions.customColumns"
          :type="allotConfig[type].customColumnKey"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
        <a-button
          v-permission="allotConfig[type].permissions.export"
          @click="handleExport('rest/equipment/allot/apply/export')"
        >
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          resizable
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentAllotApplyEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          :custom-row="getCustomRow()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <BaseStatusTag
                :color="EquipmentAllotStatusDict.getColorByKey(record.status || '')"
                :title="() => getTitle((record as EquipmentAllotApplyEntity))"
              >
                {{ EquipmentAllotStatusDict.getLabelByKey(record.status || '') }}
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'eqNum'">
              <span
                class="cursor-pointer text-colorPrimary"
                @click="AnyDialogHelper.showModel(DetailModal, { type: props.type, data: EquipmentAllotApplyEntity.fromJSON(record) })"
              >{{ record.eqNum }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="(record as EquipmentAllotApplyEntity).status !== EquipmentAllotStatus.APPROVE_ING"
                v-permission="allotConfig[type].permissions.delete"
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EquipmentAllotApplyEntity[])"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentAllotStatus.WAIT_APPROVE, EquipmentAllotStatus.APPROVE_REJECT].includes(record.status)"
                v-permission="allotConfig[type].permissions.edit"
                type="link"
                size="small"
                @click="handleEdit(EquipmentAllotApplyEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentAllotStatus.WAIT_APPROVE, EquipmentAllotStatus.APPROVE_REJECT].includes(record.status)"
                v-permission="allotConfig[type].permissions.process"
                type="link"
                size="small"
                @click="handleProcess(record as EquipmentAllotApplyEntity)"
              >
                提交
              </a-button>
              <a-button
                v-if="[EquipmentAllotStatus.APPROVE_ING].includes(record.status)"
                v-permission="allotConfig[type].permissions.revoke"
                type="link"
                size="small"
                @click="handleRevoke(record as EquipmentAllotApplyEntity)"
              >
                撤回
              </a-button>
              <a-button
                v-permission="allotConfig[type].permissions.print"
                type="link"
                size="small"
                @click="handlePrint(record as EquipmentAllotApplyEntity)"
              >
                打印
              </a-button>
              <a-button
                v-permission="allotConfig[type].permissions.detail"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(DetailModal, { type: props.type, data: EquipmentAllotApplyEntity.fromJSON(record) })"
              >
                详情
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal } from '~/components/commonProcess'
import { BaseStatusTag } from '~/components/UI'
import { AllotType } from '~/enum/AllotType'
import { useTableHooks } from '~/hooks/useTableHooks'
import { delEquipmentAllot, getAuditUser, getEquipmentAllotList, getNoPassReason, revokeEquipmentAllot, submitEquipmentAllot } from './api'
import AddEdit from './component/AddEdit.vue'
import DetailModal from './component/DetailModal.vue'
import { allotConfig, EquipmentAllotApplyEntity, EquipmentAllotStatus, EquipmentAllotStatusDict } from './EquipmentAllotApplyEntity'

const props = withDefaults(defineProps<{
  type?: AllotType
}>(), {
  type: AllotType.EQUIPMENT,
})

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleSortChange,
  handleReloadTable,
} = useTableHooks<EquipmentAllotApplyEntity>({
  customType: allotConfig[props.type].customColumnKey,
  api: getEquipmentAllotList,
  delApi: delEquipmentAllot,
  payload: {
    type: props.type,
  },
})

async function handlePrint(row: EquipmentAllotApplyEntity) {
  if (!row) {
    message.warning('请先选择一条数据')
    return
  }
  const UDRPrint = new IlisPrintUdr()
  UDRPrint.commonPrint([row.id], allotConfig[props.type].printKey)
}

async function handleEdit(row: EquipmentAllotApplyEntity) {
  await AnyDialogHelper.showModel(AddEdit, { type: props.type, data: row })
  handleReloadTable()
}

async function handleRevoke(row: EquipmentAllotApplyEntity) {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要撤回吗',
    centered: true,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      await revokeEquipmentAllot(row)
      message.success('撤回成功')
      handleReloadTable()
    },
  })
}

async function handleProcess(row: EquipmentAllotApplyEntity) {
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: allotConfig[props.type].processKey,
    processId: row.id,
    queryParams: {
      id: row.id,
    },
    submitAuditApi: submitEquipmentAllot,
  })
  handleReloadTable()
}

async function getTitle(row: EquipmentAllotApplyEntity) {
  if (row.status === EquipmentAllotStatus.APPROVE_ING) {
    const { data } = await getAuditUser(row.id)
    return `待${data}审核`
  }
  else if (row.status === EquipmentAllotStatus.APPROVE_REJECT) {
    const { data } = await getNoPassReason(row.id)
    return `${data.userRealName}审核不通过，原因：${data.comment}`
  }
  else {
    return ''
  }
}
</script>

<style>

</style>
