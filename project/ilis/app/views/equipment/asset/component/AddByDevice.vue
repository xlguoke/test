<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="从设备批量新增"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <template #footer>
      <a-button type="primary" @click="addByQuery">
        引用查询设备
      </a-button>
      <a-button type="primary" @click="addByChecked">
        引用选中设备
      </a-button>
      <a-button @click="internalOpen = false">
        取消
      </a-button>
    </template>
    <a-space direction="vertical" style="width: 100%;">
      <div class="flex items-center">
        <IlisFormSearch
          class="flex-1"
          :entity="DeviceEntity"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template #eqDepartId="{ data }">
            <BaseSelectDepart v-model="data.eqDepartId" />
          </template>
          <template #isAssets="{ data }">
            <a-select v-model:value="data.isAssets" placeholder="是否存在资产编号" @change="handleIsAssetsChange">
              <a-select-option v-for="item in assetSnSearchDict" :key="item.key" :label="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </template>
        </IlisFormSearch>
      </div>

      <IlisTable
        row-key="id"
        :loading="loading"
        :entity="DeviceEntity"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :table-height="tableHeight"
        :custom-row="getCustomRow()"
        :field-list="['name', 'equipmentSn', 'assetSn', 'standard', 'buyDate', 'departName', 'storageSite', 'status', 'factory', 'quantity', 'userName', 'operation']"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" @click="handleOpenDetail(record as DeviceEntity)">
              详情
            </a-button>
          </template>
        </template>
      </IlisTable>
    </a-space>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import { getDeviceList } from '~/api/common'
import sseRequestProgress from '~/components/sseRequestProgress'
import { useTableHooks } from '~/hooks/useTableHooks'

import { assetSnSearchDict, DeviceEntity } from '~/views/equipment/DeviceEntity'

const props = defineProps<IDialogProps<null>>()

const internalOpen = ref(true)

const isAssetsLoad = ref('all')
const {
  loading,
  dataSource,
  tableHeight,
  selectedRows,
  selectedRowKeys,
  lastSearchParams,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
  handleReloadTable,
} = useTableHooks<DeviceEntity>({
  api: getDeviceList,
  sizeKey: 'rows',
  query: ref({ isAssets: isAssetsLoad.value }),
})
/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择设备')
  }
  props.onConfirm(null)
  internalOpen.value = false
}
function handleIsAssetsChange(e: any) {
  isAssetsLoad.value = e
}
function handleOpenDetail(row: DeviceEntity) {
  openIlisTab('设备详情', `/ilis2/equipmentNewController.do?goEquipmentDetail&editId=${row.id}`)
}

async function addByQuery() {
  commonShowProgress(lastSearchParams.value)
}

async function addByChecked() {
  commonShowProgress({
    id: selectedRowKeys.value?.join(','),
  })
}

// 显示进度信息
function commonShowProgress(params: Record<string, any>) {
  sseRequestProgress.show({
    api: 'rest/equipment/assets/sync',
    method: 'post',
    data: params,
    onComplete: (data) => {
      if (data?.length) {
        Modal.error({
          title: '引入失败',
          content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, data.map((item: string) => {
            return h('p', item)
          })),
          centered: true,
          okText: '确定',
        })
      }
      else {
        message.success('引入成功')
        handleReloadTable()
        internalOpen.value = false
        props.onConfirm(null)
      }
    },
  })
}
</script>
