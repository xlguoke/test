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
          v-model:expandedRowKeys="expandedRowKeys"
          class="flex-1 w-0"
          row-key="id"
          table-height="55vh"
          :loading="loading"
          :entity="DeviceEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow"
          :field-list="DeviceEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
          @change="handleSortChange"
        >
          <template v-if="props.showSubDevice" #expandedRowRender="{ record }">
            <SubDevice
              :main-device="record"
              :is-select-all="selectedRowKeys.includes(record.id)"
              @change="handleSubDeviceChange"
            ></SubDevice>
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
import { message } from 'ant-design-vue'
import SubDevice from './SubDevice.vue'
import BaseSelectorView from './UI/BaseSelectorView.vue'
import { getDeviceList } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import type { IOption } from '~/interface/IOption'

const props = defineProps<{
  /** # 是否展示弹窗 */
  show: boolean
  /** # 是否可以多选 */
  multiple?: boolean
  /** # 已选中的ID列表 */
  checkedIds?: string[]
  /** # 查询时额外携带的参数 */
  payload?: Record<string, any>
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
  defaultPageSizeOptions: ['10', '20', '50', '100', '500'],
  payload: props.payload,
})

watch(() => props.show, (val) => {
  internalOpen.value = val
  handleReset()
  if (val) {
    expandedRowKeys.value = []
    if (props.checkedIds) {
      selectedRowKeys.value = props.checkedIds
    }
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

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
