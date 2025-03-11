<template>
  <IlisContainer app-id="check_param">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentCheckParamEqEntity"
        :field-order="['checkItemStatus']"
        :field-list="EquipmentCheckParamEqEntity.getSearchFileldList()?.filter(item => !['eqDepartId'].includes(item))"
        @search="handleSearch"
        @reset="handleReset"
      ></IlisFormSearch>
      <a-space>
        <a-button
          :icon="h(PlusOutlined)"
          @click="handleAdd()"
        >
          新增
        </a-button>
        <a-button
          :icon="h(DeleteOutlined)"
          @click="handleDelete(selectedRows)"
        >
          删除
        </a-button>
        <a-button
          :icon="h(ImportOutlined)"
          @click="AnyDialogHelper.showModel(Import).then(() => handleReloadTable())"
        >
          导入
        </a-button>
        <a-button
          :icon="h(PrinterOutlined)"
          @click="handlePrint()"
        >
          打印
        </a-button>
        <a-button
          :icon="h(ExportOutlined)"
          @click="handleExport('rest/checkItemController.do?export')"
        >
          导出
        </a-button>
        <IlisCustomColumns
          type="equipmentCheckItem"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :entity="EquipmentCheckParamEqEntity"
          :data-source="dataSource"
          :loading="loading"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :table-height="tableHeight"
          :custom-row="getCustomRow"
          :custom-columns="customColumns"
          :scroll="{
            x: '1400px',
          }"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'checkItemCount'">
              <div
                class=" text-primaryColor cursor-pointer"
                @click="AnyDialogHelper.showModel(AddEdit, {
                  data: EquipmentCheckParamEqEntity.fromJSON(record),
                }).then(() => handleReloadTable())"
              >
                {{ text }}
              </div>
            </template>
            <template v-if="column.dataIndex === 'checkItemStatus'">
              <BaseStatusTag v-if="record.checkItemCount > 0" :color="EquipmentCheckStatusDict.getColorByKey(text)">
                {{ EquipmentCheckStatusDict.getLabelByKey(text) }}
              </BaseStatusTag>
              <div v-else>
                -
              </div>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-space size="small">
                <a-button
                  type="link"
                  size="small"
                  @click="AnyDialogHelper.showModel(AddEdit, {
                    data: EquipmentCheckParamEqEntity.fromJSON(record),
                  }).then (() => handleReloadTable())"
                >
                  编辑
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  danger
                  @click="handleDelete([record] as EquipmentCheckParamEqEntity[])"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { DeviceEntity } from '../../DeviceEntity'
import { addParamEq, deleteParamEq } from './api'
import { EquipmentCheckParamEqEntity, EquipmentCheckStatusDict } from './EquipmentCheckParamEqEntity'
import Import from './component/Import.vue'
import AddEdit from './component/AddEdit.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getDeviceList } from '~/api/common'
import { BaseStatusTag } from '~/components/UI'
import DeviceSelector from '~/components/selectorViaMethodCall/DeviceSelector.vue'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  lastSearchParams,
  customColumns,
  selectedRows,
  getPagination,
  getCustomRow,
  getRowSelection,
  handleSearch,
  handleReset,
  handleDelete,
  handleExport,
  handleReloadTable,
} = useTableHooks<EquipmentCheckParamEqEntity>({
  api: getDeviceList,
  delApi: deleteParamEq,
  customType: 'equipmentCheckItem',
  sizeKey: 'rows',
  payload: {
    isCheckItem: '1',
  },
})

/**
 * # udr打印
 */
async function handlePrint() {
  IlisPrintUdr.commonPrint([], 'EquipmentCheckParam', {
    jsonParam: lastSearchParams.value,
  })
}

async function handleAdd() {
  const res = await AnyDialogHelper.showSelector<DeviceEntity>(DeviceSelector, {
    multiple: true,
    customParams: {
      payload: {
        isCheckItem: '0',
      },
    },
  })
  loading.value = true
  await addParamEq(res).finally(() => {
    loading.value = false
  })
  message.success('新增成功')
  handleReloadTable()
}
</script>

<style>

</style>
