<template>
  <HtModal
    v-model:open="internalOpen"
    title="盘点登记"
    width="90vw"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="internalOpen = false;onConfirm(null)">
        关闭
      </a-button>
    </template>
    <a-space direction="vertical" style="width: 100%;">
      <div class="flex justify-between items-center border-b pb-3 mb-3">
        <div>
          <div class=" flex gap-3 items-center ">
            <span class="font-bold">{{ initData.inventoryName }}</span>
            <BaseStatusTag
              :color="EquipmentInventoryRecordStatusDict.getColorByKey(initData.status || '')"
              :title="getTitle(initData)"
            >
              {{ EquipmentInventoryRecordStatusDict.getLabelByKey(initData.status || '') }}
            </BaseStatusTag>
          </div>
          <div>{{ initData.inventorySn }}</div>
        </div>
        <div class="flex gap-8 items-center">
          <div class="flex flex-col items-center">
            <div class="text-[18px] font-bold">
              {{ statisData?.inventoryProgress }}
            </div>
            <div class="text-[12px] font-[#aaaaaa]">
              盘点进度
            </div>
          </div>
          <div class="flex flex-col items-center">
            <div class="text-[18px] font-bold text-[#70b603]">
              {{ statisData?.[20] || 0 }}
            </div>
            <div class="text-[12px] font-[#aaaaaa]">
              正常
            </div>
          </div>
          <div class="flex flex-col items-center">
            <div class="text-[18px] font-bold text-[#d9001b]">
              {{ statisData?.[30] || 0 }}
            </div>
            <div class="text-[12px] font-[#aaaaaa]">
              盘点异常
            </div>
          </div>
          <div class="flex flex-col items-center">
            <div class="text-[18px] font-bold text-[#f59a23]">
              {{ statisData?.[40] || 0 }}
            </div>
            <div class="text-[12px] font-[#aaaaaa]">
              位置异常
            </div>
          </div>
        </div>
      </div>

      <a-space direction="vertical">
        <IlisFormSearch
          :entity="EquipmentInventoryCheckInEntity"
          :field-list="['status', 'type', 'departmentId', 'queryCode']"
          :field-order="['status', 'type', 'departmentId', 'queryCode']"
          @reset="handleReset"
          @search="handleSearch"
        >
          <template #departmentId="{ data }">
            <BaseSelectDepart
              v-model="data.departmentId"
              placeholder="请选择所属部门"
              @change="nextTick(() => handleSearch(data))"
            ></BaseSelectDepart>
          </template>
        </IlisFormSearch>
        <a-space v-if="!param.isDetail">
          <a-button
            :icon="h(PlusOutlined)"
            @click="handleSelectAsset"
          >
            添加固定资产
          </a-button>
          <a-button
            :icon="h(EditOutlined)"
            @click="handleBatchCheckIn()"
          >
            批量登记
          </a-button>
          <a-button
            :icon="h(ExportOutlined)"
            @click="handleExport('rest/eq/inventory/detail/export', {
              inventoryId: initData.id,
            })"
          >
            导出
          </a-button>
          <a-button
            :icon="h(DeleteOutlined)"
            @click="handleDelete(selectedRows).then(() => { refresh() })"
          >
            删除
          </a-button>
        </a-space>
      </a-space>
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :entity="EquipmentInventoryCheckInEntity"
        :table-height="tableHeight"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'status'">
            <IlisInput
              v-model="record.status"
              :entity="EquipmentInventoryCheckInEntity"
              :options="EquipmentInventoryCheckInEntity.getOptions('status')?.map(item => {
                const obj = { ...item, disabled: false }
                if (item.value === EquipmentInventoryCheckInStatus.WAIT){
                  obj.disabled = true
                }
                return obj
              })"
              :allow-clear="false"
              :disabled="param.isDetail"
              field="status"
              @change="nextTick(() => handStatusChange(record as EquipmentInventoryCheckInEntity))"
            ></IlisInput>
          </template>
          <template v-if="column.key === 'inventoryUserName'">
            <div @click.stop="handleEditPerson(index)">
              <IlisInput
                v-model="record.inventoryUserName"
                :allow-clear="false"
                :entity="EquipmentInventoryCheckInEntity"
                :disabled="param.isDetail"
                field="inventoryUserName"
              ></IlisInput>
            </div>
          </template>
          <template v-if="column.key === 'inventoryTime'">
            <IlisInput
              v-model="record.inventoryTime"
              :entity="EquipmentInventoryCheckInEntity"
              show-time
              :allow-clear="false"
              class="w-full"
              field="inventoryTime"
              :disabled="param.isDetail"
              @change="nextTick(() => checkIn(record as EquipmentInventoryCheckInEntity))"
            ></IlisInput>
          </template>
          <template v-if="column.key === 'remark'">
            <IlisInput
              v-model="record.remark"
              :entity="EquipmentInventoryCheckInEntity"
              :allow-clear="false"
              class="w-full"
              :disabled="param.isDetail"
              field="remark"
              @blur="nextTick(() => checkIn(record as EquipmentInventoryCheckInEntity))"
            ></IlisInput>
          </template>
          <template v-if="column.key === 'operation'">
            <HtUploadFile
              business-type="INVENTORY_REGISTER"
              force-init
              hide-file-list
              :business-id="record.id"
            >
              <template #default="{ openFun }">
                <a-button type="link" @click="openFun">
                  附件管理
                </a-button>
              </template>
            </HtUploadFile>
          </template>
        </template>
      </IlisTable>
    </a-space>
    <!-- 人员选择器 -->
    <PersonSelector
      v-model:show="showPersonSelector"
      @confirm="handleSelectPerson($event)"
    />
  </HtModal>
</template>

<script lang="ts" setup>
import { DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { EquipmentInventoryCheckInEntity, EquipmentInventoryCheckInStatus } from '../EquipmentInventoryCheckInEntity'
import type { EquipmentInventoryStatisticsCountData } from '../api'
import { addEquipmentInventoryCheckInEq, delEquipmentInventoryCheckInEq, equipmentInventoryCheckIn, getEquipmentInventoryCheckInEq, getEquipmentInventoryRecordDetail, getEquipmentInventoryStatisticsCount } from '../api'
import { EquipmentInventoryRecordEntity, EquipmentInventoryRecordStatus, EquipmentInventoryRecordStatusDict } from '../EquipmentInventoryRecordEntity'
import BatchCheckIn from './BatchCheckIn.vue'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import { IlisFormSearch, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'
import AssetSelector from '~/components/selectorViaMethodCall/AssetSelector.vue'

interface IDialogProps {
  data: EquipmentInventoryRecordEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const internalOpen = ref(true)

const showPersonSelector = ref(false)

const editIndex = ref()

const currentUserInfo = getLocalUserInfo()

const initData = ref<EquipmentInventoryRecordEntity>(props.param.data)

const statisData = ref<EquipmentInventoryStatisticsCountData>()

const {
  loading,
  dataSource,
  selectedRows,
  tableHeight,
  getList,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleExport,
  handleSearch,
  handleReset,
  handleDelete,
  handleReloadTable,
} = useTableHooks<EquipmentInventoryCheckInEntity>({
  api: getEquipmentInventoryCheckInEq,
  delApi: delEquipmentInventoryCheckInEq,
  totalKey: 'count',
  payload: {
    inventoryId: props.param.data?.id,
  },
  responseDataTransform: (data) => {
    data?.rows?.forEach((item: any) => {
      item.name = item.equipmentName
      item.standard = item.equipmentStandard
    })
    return data
  },
})

function refresh() {
  getStatisticsCount()
  getBaseData(props.param.data)
}
refresh()

async function getStatisticsCount() {
  const { data } = await getEquipmentInventoryStatisticsCount(initData.value)
  statisData.value = data
}

function handleEditPerson(index: number) {
  if (props.param.isDetail) {
    return
  }
  showPersonSelector.value = true
  editIndex.value = index
}

/**
 * 盘点记录基础信息详情
 */
async function getBaseData(query: EquipmentInventoryRecordEntity) {
  const { data } = await getEquipmentInventoryRecordDetail(query)
  data.inventoryType = data.type
  initData.value = EquipmentInventoryRecordEntity.fromJSON(data)
}

/**
 * # 选择设备
 */
async function handleSelectAsset() {
  const data = await AnyDialogHelper.showSelector<DeviceEntity>(AssetSelector, {
    multiple: true,
    // isCacheSelect: true,
  })
  const ids = data.map(item => item.id)
  await addEquipmentInventoryCheckInEq({ inventoryId: initData.value.id, assetIds: ids })
  message.success('添加成功')
  getList()
  refresh()
}

async function handStatusChange(row: EquipmentInventoryCheckInEntity) {
  if (row.status === EquipmentInventoryCheckInStatus.WAIT) {
    row.inventoryTime = ''
    row.inventoryUserId = ''
    row.inventoryUserName = ''
    row.remark = ''
    nextTick(() => {
      checkIn(row)
    })
    return
  }

  if (!row.inventoryUserName) {
    row.inventoryUserName = currentUserInfo?.realName || ''
    row.inventoryUserId = currentUserInfo?.userId || ''
  }
  if (!row.inventoryTime) {
    row.inventoryTime = Date.now() as any
  }
  nextTick(() => {
    checkIn(row)
  })
}

function handleSelectPerson(data: IUserSelectVoEntity[]) {
  showPersonSelector.value = false
  dataSource.value[editIndex.value].inventoryUserName = data[0].name
  dataSource.value[editIndex.value].inventoryUserId = data[0].id
  checkIn(dataSource.value[editIndex.value])
}

async function checkIn(row: EquipmentInventoryCheckInEntity) {
  await equipmentInventoryCheckIn({
    inventorId: initData.value.id,
    inventoryAssets: [{
      id: row.id,
      inventoryStatus: row.status,
      inventoryUserId: row.inventoryUserId,
      inventoryUserName: row.inventoryUserName,
      inventoryTime: new Date(row.inventoryTime || '').getTime(),
      status: row.status,
      remark: row.remark,
    }],
  })
  handleReloadTable()
  refresh()
}

/**
 * # 批量登记
 */
async function handleBatchCheckIn() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择要操作的数据')
  }
  await AnyDialogHelper.showModel(BatchCheckIn, {
    data: selectedRows.value,
    record: initData.value,
  })
  handleReloadTable()
  refresh()
}

function getTitle(row: EquipmentInventoryRecordEntity) {
  if (row.status === EquipmentInventoryRecordStatus.APPROVE_ING) {
    return `待${row.nextAuditUserName}审核`
  }
  else if (row.status === EquipmentInventoryRecordStatus.APPROVE_FAIL) {
    return `${row.auditUserName}审核不通过，原因：${row.auditComment}`
  }
}
</script>
