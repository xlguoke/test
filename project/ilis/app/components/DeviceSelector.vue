<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    title="选择设备"
    @cancel="handleCancel"
  >
    <template #footer>
      <slot
        name="beforeConfirm"
        :selected-rows="selectedRows"
        :selected-row-keys="selectedRowKeys"
        :handle-cancel="handleCancel"
        :handle-confirm="handleConfirm"
        :reset="handleReset"
      />
      <a-button @click="handleCancel()">
        取消
      </a-button>
      <a-button type="primary" @click="handleConfirm()">
        确定
      </a-button>
    </template>
    <div class="flex flex-col gap-3 w-full ">
      <IlisFormSearch
        :show-industry="false"
        :entity="DeviceEntity"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #eqDepartId="{ data }">
          <BaseSelectDepart
            v-model="data.eqDepartId"
          ></BaseSelectDepart>
        </template>
      </IlisFormSearch>
      <div class="flex gap-3 w-full">
        <IlisTable
          v-model:expanded-row-keys="expandedRowKeys"
          class="flex-1 w-0"
          row-key="id"
          table-height="380px"
          :loading="loading"
          :entity="DeviceEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow()"
          :field-list="DeviceEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
          @change="handleSortChange"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'rentStatus'">
              {{ getrentStatusText(record.rentStatus) }}
            </template>
          </template>

          <template v-if="props.showSubDevice" #expandedRowRender="{ record }">
            <SubDevice
              :main-device="record"
              :is-select-all="selectedRowKeys.includes(record.id)"
              @change="handleSubDeviceChange"
            ></SubDevice>
          </template>
          <!-- @vue-expect-error 存在的属性 -->
          <template #expandIcon="{ expanded, onExpand, record }">
            <button
              v-if="record && hasSubDevices(record.id)"
              :class="`ant-table-row-expand-icon ${expanded ? 'ant-table-row-expand-icon-expanded' : 'ant-table-row-expand-icon-collapsed'}`"
              @click.stop="(e) => onExpand(record, e)"
            ></button>
            <template v-else>
              <span></span>
            </template>
          </template>
        </IlisTable>
        <BaseSelectorView
          v-if="multiple && isCacheSelect"
          :data="AnyDataTransformHelper.recordListToOptions(selectedRows, ['name', 'id'])"
          @remove-item="handleRemoveItem"
          @remove-all="selectedRows = [];selectedRowKeys = [];"
        />
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IOption } from '~/interface/IOption'
import { message } from 'ant-design-vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { getDeviceList, getDeviceListByIds, getSubDeviceList } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import SubDevice from './SubDevice.vue'
import BaseSelectorView from './UI/BaseSelectorView.vue'

const props = defineProps<{
  /** # 是否展示弹窗 */
  show: boolean
  /** # 是否可以多选 */
  multiple?: boolean
  /** # 已选中的ID列表 */
  checkedIds?: string[]
  /** # 查询时额外携带的参数 */
  payload?: Record<string, any>
  /** # 额外携带的参数可被覆盖 */
  payloadCoverable?: boolean
  /** # 是否展示子设备 */
  showSubDevice?: boolean
  /** # 是否缓存选中数据 */
  isCacheSelect?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: DeviceEntity[]): void
  (e: 'cancel'): void
}>()

const internalOpen = ref(props.show)

let subDevice: Record<string, any> = {}

const subDeviceCache = ref<Record<string, boolean>>({})

const expandedRowKeys = ref([])

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
} = useTableHooks<DeviceEntity>({
  api: getDeviceList,
  immediate: false,
  sizeKey: 'rows',
  isCacheSelect: props.isCacheSelect,
  payload: props.payload,
  payloadCoverable: props.payloadCoverable,
})

watch(() => props.show, async (val) => {
  internalOpen.value = val
  handleReset()
  if (val) {
    expandedRowKeys.value = []
    if (props.checkedIds?.length) {
      selectedRowKeys.value = props.checkedIds
      const { data } = await getDeviceListByIds(props.checkedIds)
      selectedRows.value = data
    }
  }
})

function hasSubDevices(recordId: string) {
  return !!subDeviceCache.value?.[recordId]
}

// 将更新子设备缓存的逻辑提取到一个单独的函数中
async function updateSubDeviceCache() {
  const newCache: Record<string, boolean> = {}
  for (const record of dataSource.value) {
    try {
      const res = await getSubDeviceList(record.id)
      const subDevices = JSON.parse(JSON.stringify(res.data)) || []
      newCache[record.id] = subDevices.length > 0
    }
    catch {
      newCache[record.id] = false
    }
  }
  subDeviceCache.value = newCache
}

// 监听loading状态变化，当loading为false时表示数据已加载完成
watch(() => loading.value, (newLoading) => {
  if (!newLoading && dataSource.value.length) {
    updateSubDeviceCache()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

function getrentStatusText(rentStatus: string) {
  switch (rentStatus) {
    case '0':
      return '空闲中'
    case '1':
      return '待提交'
    case '2':
      return '审核中'
    case '3':
      return '借用中'
    case '4':
      return '归还中'
    default:
      return '-'
  }
}
/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择设备')
  }
  // subDevice对象仅保留key在selectedRowKeys存在的
  subDevice = Object.fromEntries(Object.entries(subDevice)?.filter(([key]) => selectedRowKeys.value.includes(key)))

  let selArr = selectedRows.value.concat(...Object.values(subDevice))
  // selArr去掉id相同的设备
  selArr = selArr.filter((item, index) => {
    return selArr.findIndex(i => i.id === item.id) === index
  })
  emits('confirm', selArr)
}

/**
 * # 取消
 */
function handleCancel() {
  internalOpen.value = false
  emits('cancel')
}

function handleSubDeviceChange({ id, value }: { id: string, value: DeviceEntity[] }) {
  subDevice[id] = value
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
