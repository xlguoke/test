<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="从设备批量新增"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <template #footer>
      <a-button type="primary" :loading="btnLoading" @click="addByQuery">
        引用查询设备
      </a-button>
      <a-button type="primary" :loading="btnLoading" @click="addByChecked">
        引用选中设备
      </a-button>
      <a-button :loading="btnLoading" @click="internalOpen = false">
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
        :custom-row="getCustomRow"
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
    <BaseRequestProcess
      v-model="showProgress"
      type="ASSET_AUTO_ADD_"
      :business-key="businessKey"
    ></BaseRequestProcess>
  </ht-modal>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'
import { equipmentAssetAddByDevice } from '../api'
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { getDeviceList, getProgressKey } from '~/api/common'
import { IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import BaseRequestProcess from '~/components/UI/BaseRequestProcess.vue'

const props = defineProps<IDialogProps<null>>()

const internalOpen = ref(true)

const btnLoading = ref(false)

const showProgress = ref(false)

const businessKey = ref('')

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
  payload: {
    isAssets: 1,
  },
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

function handleOpenDetail(row: DeviceEntity) {
  openIlisTab('设备详情', `/ilis2/equipmentNewController.do?goEquipmentDetail&editId=${row.id}`)
}

async function addByQuery() {
  btnLoading.value = true
  const flag = `render${Math.random()}`
  const { data: key } = await getProgressKey(flag)
  businessKey.value = key
  showProgress.value = true
  const { data } = await equipmentAssetAddByDevice({ query: lastSearchParams.value, key }).finally(() => {
    btnLoading.value = false
    showProgress.value = false
  })
  if (data?.length) {
    Modal.error({
      title: '引入失败',
      content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, data.map((item: string) => {
        return h('p', item)
      })),
    })
  }
  else {
    message.success('引入成功')
    handleReloadTable()
    internalOpen.value = false
    props.onConfirm(null)
  }
}

async function addByChecked() {
  btnLoading.value = true
  const flag = `render${Math.random()}`
  const { data: key } = await getProgressKey(flag)
  businessKey.value = key
  showProgress.value = true
  const { data } = await equipmentAssetAddByDevice({ id: selectedRowKeys.value?.join(','), key }).finally(() => {
    btnLoading.value = false
    showProgress.value = false
  })
  if (data?.length) {
    Modal.error({
      title: '引入失败',
      content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, data.map((item: string) => {
        return h('p', item)
      })),
    })
  }
  else {
    message.success('引入成功')
    handleReloadTable()
    internalOpen.value = false
    props.onConfirm(null)
  }
}
</script>
