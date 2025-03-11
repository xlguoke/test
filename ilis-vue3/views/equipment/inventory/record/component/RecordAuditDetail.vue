<template>
  <IlisContainer app-id="inventory_audit_detail">
    <div class="pr-3">
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
            :field-list="['status', 'departmentId', 'queryCode']"
            :field-order="['status', 'departmentId', 'queryCode']"
            @reset="handleReset"
            @search="handleSearch"
          >
            <template #departmentId="{ data }">
              <a-tree-select
                v-model:value="data.departmentId"
                style="width: 240px"
                :tree-data="treeData"
                :field-names="{
                  label: 'text',
                  value: 'id',
                }"
                allow-clear
                placeholder="请选择组织机构"
                tree-node-filter-prop="text"
                @change="nextTick(() => handleSearch(data))"
              />
            </template>
          </IlisFormSearch>
        </a-space>
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentInventoryCheckInEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :custom-row="getCustomRow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <IlisInput
                v-model="record.status"
                :entity="EquipmentInventoryCheckInEntity"
                :options="EquipmentInventoryCheckInEntity.getOptions('status')"
                :allow-clear="false"
                disabled
                field="status"
              ></IlisInput>
            </template>
            <template v-if="column.key === 'inventoryUserName'">
              <IlisInput
                v-model="record.inventoryUserName"
                :allow-clear="false"
                :entity="EquipmentInventoryCheckInEntity"
                disabled
                field="inventoryUserName"
              ></IlisInput>
            </template>
            <template v-if="column.key === 'inventoryTime'">
              <IlisInput
                v-model="record.inventoryTime"
                :entity="EquipmentInventoryCheckInEntity"
                show-time
                :allow-clear="false"
                class="w-full"
                field="inventoryTime"
                disabled
              ></IlisInput>
            </template>
            <template v-if="column.key === 'remark'">
              <IlisInput
                v-model="record.remark"
                :entity="EquipmentInventoryCheckInEntity"
                :allow-clear="false"
                class="w-full"
                field="remark"
                disabled
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
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { EquipmentInventoryCheckInEntity } from '../EquipmentInventoryCheckInEntity'
import type { EquipmentInventoryStatisticsCountData } from '../api'
import { delEquipmentInventoryCheckInEq, getEquipmentInventoryCheckInEq, getEquipmentInventoryRecordDetail, getEquipmentInventoryStatisticsCount } from '../api'
import { EquipmentInventoryRecordEntity, EquipmentInventoryRecordStatus, EquipmentInventoryRecordStatusDict } from '../EquipmentInventoryRecordEntity'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import { IlisFormSearch, IlisInput } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import { getOrgComboTree } from '~/api/common'

const treeData = ref<IDepartmentEntity[]>([])

const initData = ref(new EquipmentInventoryRecordEntity())

const statisData = ref<EquipmentInventoryStatisticsCountData>()

const urlParams = new URLSearchParams(location.search)

const id = urlParams.get('id')

const {
  loading,
  dataSource,
  tableHeight,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
} = useTableHooks<EquipmentInventoryCheckInEntity>({
  api: getEquipmentInventoryCheckInEq,
  delApi: delEquipmentInventoryCheckInEq,
  totalKey: 'count',
  payload: {
    inventoryId: id,
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
  getBaseData(EquipmentInventoryRecordEntity.fromJSON({ id }))
}
refresh()
async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}
getTreeData()

async function getStatisticsCount() {
  const { data } = await getEquipmentInventoryStatisticsCount(EquipmentInventoryRecordEntity.fromJSON({ id }))
  statisData.value = data
}

/**
 * 盘点记录基础信息详情
 */
async function getBaseData(query: EquipmentInventoryRecordEntity) {
  const { data } = await getEquipmentInventoryRecordDetail(query)
  data.inventoryType = data.type
  initData.value = EquipmentInventoryRecordEntity.fromJSON(data)
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
