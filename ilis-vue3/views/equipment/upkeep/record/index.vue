<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentUpkeepRecordEntity"
        :field-order="['departId', 'status', 'commonDate', 'quickQryParam']"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #departId="{ data }">
          <BaseSelectDepart
            v-model="data.departId"
            placeholder="请选择保养部门"
            @change="nextTick(() => handleSearch(data))"
          ></BaseSelectDepart>
        </template>
      </IlisFormSearch>
      <a-space>
        <a-dropdown>
          <a-button :icon="h(PlusOutlined)">
            新增
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="handleAddByPlan()">
                按计划新增
              </a-menu-item>
              <a-menu-item @click="handleAddByDevice()">
                新建保养
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button
          :icon="h(EditOutlined)"
          @click="handleBatchEdit"
        >
          批量编辑
        </a-button>
        <a-button
          :icon="h(PrinterOutlined)"
          @click="handlePrint(selectedRows)"
        >
          打印
        </a-button>
        <a-button
          :icon="h(ExportOutlined)"
          @click="handleExport('rest/eq/upkeep/record/export')"
        >
          导出
        </a-button>
        <IlisCustomColumns
          type="upkeepRecord"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentUpkeepRecordEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="getCustomRow"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'upkeepPlanSn'">
              {{ EquipmentUpkeepRecordTypeDict.getLabelByKey(record.type) }}
              <span
                v-if="text"
                class=" text-primaryColor cursor-pointer"
                @click="handleOpenPlan(record as EquipmentUpkeepRecordEntity)"
              >
                （{{ text }}）
              </span>
            </template>
            <template v-if="column.dataIndex === 'status'">
              <BaseStatusTag :color="EquipmentUpkeepRecordStatusDict.getColorByKey(text)">
                {{ EquipmentUpkeepRecordStatusDict.getLabelByKey(text) }}
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                type="link"
                size="small"
                @click="handleEdit(EquipmentUpkeepRecordEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentUpkeepRecordStatus.UPKEEPED].includes(record.status)"
                type="link"
                size="small"
                @click="handlePrint([EquipmentUpkeepRecordEntity.fromJSON(record)])"
              >
                打印
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EquipmentUpkeepRecordEntity[], {
                  title: '您正在删除设备保养记录！',
                  content: '删除后将无法恢复，您确定要删除当前的设备保养记录吗？',
                })"
              >
                删除
              </a-button>
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '38' })">
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { EditOutlined, ExportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import UpkeepPlanDeviceSelector from '../plan/component/UpkeepPlanDeviceSelector.vue'
import type { UpkeepPlanDeviceSelectorEntity } from '../plan/UpkeepPlanDeviceSelectorEntity'
import type { EquipmentUpkeepDeviceEntity } from '../plan/EquipmentUpkeepDeviceEntity'
import { EquipmentUpkeepRecordEntity, EquipmentUpkeepRecordStatus, EquipmentUpkeepRecordStatusDict, EquipmentUpkeepRecordType, EquipmentUpkeepRecordTypeDict } from './EquipmentUpkeepRecordEntity'
import { createEquipmentUpkeepRecord, delEquipmentUpkeepRecord, getEquipmentUpkeepRecordList } from './api'
import UpkeepPlanSelector from './component/UpkeepPlanSelector.vue'
import AddByPlanDevice from './component/AddByPlanDevice.vue'
import Edit from './component/Edit.vue'
import BatchEdit from './component/BatchEdit.vue'
import { IlisContainer, IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import RadioSelector from '~/components/RadioSelector.vue'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'

const {
  loading,
  dataSource,
  selectedRows,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<EquipmentUpkeepRecordEntity>({
  api: getEquipmentUpkeepRecordList,
  delApi: delEquipmentUpkeepRecord,
  sizeKey: 'rows',
  customType: 'upkeepRecord',
  responseDataTransform: (data) => {
    const options = EquipmentUpkeepRecordEntity.getOptions('upkeepProject')?.map((item) => {
      return {
        typeName: item.label,
        typeCode: item.value?.toString(),
      }
    })
    data?.rows?.forEach((item: EquipmentUpkeepRecordEntity) => {
      item.upkeepProjectName = options?.filter((i) => {
        const codeArr = item.upkeepProject?.split(',')
        return codeArr?.includes(i.typeCode)
      })?.map(i => i.typeName)?.join(',')

      item.status = item.upkeepTime ? EquipmentUpkeepRecordStatus.UPKEEPED : EquipmentUpkeepRecordStatus.WAIT_UPKEEP
      item.type = item.upkeepPlanSn ? EquipmentUpkeepRecordType.PLAN : EquipmentUpkeepRecordType.EQUIPMENT
    })
    return data
  },
})

async function handleAddByPlan() {
  const res = await AnyDialogHelper.showSelector(UpkeepPlanSelector)
  const sel = await AnyDialogHelper.showModel<EquipmentUpkeepDeviceEntity[]>(AddByPlanDevice, { data: res[0] })
  const params = {
    ids: sel.map(item => item.id)?.join(','),
    type: EquipmentUpkeepRecordType.PLAN,
  }
  loading.value = true
  await createEquipmentUpkeepRecord(params).finally(() => {
    loading.value = false
  })
  message.success('新增成功')
  handleReloadTable()
}

async function handleAddByDevice() {
  const res = await AnyDialogHelper.showSelector<UpkeepPlanDeviceSelectorEntity>(UpkeepPlanDeviceSelector, {
    multiple: true,
  })
  const params = {
    ids: res.map(item => item.id)?.join(','),
    type: EquipmentUpkeepRecordType.EQUIPMENT,
  }
  loading.value = true
  await createEquipmentUpkeepRecord(params).finally(() => {
    loading.value = false
  })
  message.success('新增成功')
  handleReloadTable()
}

async function handleEdit(row: EquipmentUpkeepRecordEntity) {
  await AnyDialogHelper.showModel(Edit, { data: row })
  handleReloadTable()
}

async function handleBatchEdit() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择数据！')
  }
  const res = await AnyDialogHelper.showModel(RadioSelector, {
    title: '批量编辑',
    okText: '下一步',
    options: [
      { label: '保养项目', value: 'project' },
      { label: '信息登记', value: 'baseData' },
    ],
  })
  await AnyDialogHelper.showModel(BatchEdit, {
    batchType: res,
    data: selectedRows.value,
  })
  handleReloadTable()
}
async function handlePrint(rows: EquipmentUpkeepRecordEntity[]) {
  const isSameDevice = rows.every(item => item.equipmentId === rows[0].equipmentId)
  const planIds = rows.map(item => item.upkeepPlanId).filter(item => !!item)
  if (!isSameDevice || planIds.length > 1) {
    return message.error('请选择相同设备且最多包含一个计划的数据打印')
  }
  const ids = rows.map(item => item.id)?.join(',')
  IlisPrintUdr.commonPrint([ids], 'EquipmentUpkeep')
}

function handleOpenPlan(row: EquipmentUpkeepRecordEntity) {
  const query = new URLSearchParams({
    upkeepPlanSn: row.upkeepPlanSn as string,
  })
  openIlisTab('设备保养计划', `rest/eq/upkeep/plan/index?${query}`)
}
</script>

<style>

</style>
