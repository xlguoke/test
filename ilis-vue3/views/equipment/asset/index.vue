<template>
  <IlisContainer app-id="common_eq_assets">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentAssetEntity"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #departId="{ data }">
          <BaseSelectDepart v-model="data.departId" placeholder="请选择" />
        </template>
        <template #serveLocationId="{ data }">
          <BaseSelectDepart v-model="data.serveLocationId" placeholder="请选择" />
        </template>
      </IlisFormSearch>
      <a-space>
        <a-button
          type="primary"
          :icon="h(PlusOutlined)"
          @click="AnyDialogHelper.showModel(AddEdit, EquipmentAssetEntity.fromJSON({})).then(() => handleReloadTable())"
        >
          新增
        </a-button>
        <a-button
          :icon="h(PlusOutlined)"
          @click="handleAddByDevice"
        >
          从设备批量新增
        </a-button>
        <a-button
          :icon="h(EditOutlined)"
          @click="handleBatchEdit"
        >
          批量编辑
        </a-button>
        <a-button
          :icon="h(CopyOutlined)"
          @click="handleCopy"
        >
          复制
        </a-button>
        <a-button :icon="h(DownloadOutlined)" @click="handleDownloadTemplate">
          下载模板
        </a-button>
        <a-upload
          name="file"
          accept=".xlsx"
          :multiple="false"
          :show-upload-lis="false"
          :before-upload="() => false"
          :file-list="[]"
          @change="handleImport"
        >
          <a-button :icon="h(ImportOutlined)" :loading="uploadLoading">
            导入
          </a-button>
        </a-upload>
        <a-button :icon="h(ExportOutlined)" @click="handleExport('/rest/equipment/assets/export')">
          导出
        </a-button>
        <a-button :icon="h(ExportOutlined)" @click="handlePrintTag(selectedRows)">
          打印资产标签
        </a-button>
        <CustomAttribute
          customize-type="fixedAssets"
          @save="handleReloadTable()"
        />
        <IlisCustomColumns
          type="fixedAssets"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentAssetEntity"
          :table-height="tableHeight"
          :custom-row="getCustomRow"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'assetSn'">
              <BaseStatusTag
                v-if="record?.eqDeleted?.toString() === '1'"
                color="#d9001b"
                title="关联设备已被删除"
              >
                删
              </BaseStatusTag>
              <span>{{ text }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" @click="AnyDialogHelper.showModel(AddEdit, EquipmentAssetEntity.fromJSON(record)).then(() => handleReloadTable())">
                编辑
              </a-button>
              <a-button type="link" @click="AnyDialogHelper.showModel(Detail, EquipmentAssetEntity.fromJSON(record))">
                查看
              </a-button>
              <a-button type="link" danger @click="handleDelete([record as EquipmentAssetEntity])">
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { CopyOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { EquipmentAssetEntity } from './EquipmentAssetEntity'
import AddEdit from './component/AddEdit.vue'
import BatchEdit from './component/BatchEdit.vue'
import PrintTag from './component/PrintTag.vue'
import AddByDevice from './component/AddByDevice.vue'
import Detail from './component/Detail.vue'
import { copyEquipmentAsset, delEquipmentAsset, getEquipmentAssetList, importEquipmentAsset } from './api'
import { IlisContainer, IlisCustomColumns, IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { CustomAttribute } from '~/components/customAttribute'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { BaseSelectDepart, BaseStatusTag } from '~/components/UI'

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  selectedRows,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
} = useTableHooks<EquipmentAssetEntity>({
  customType: 'fixedAssets',
  api: getEquipmentAssetList,
  delApi: delEquipmentAsset,
})

const uploadLoading = ref(false)

async function handleAddByDevice() {
  await AnyDialogHelper.showModel(AddByDevice)
  handleReloadTable()
}

async function handleBatchEdit() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择设备！')
  }
  await AnyDialogHelper.showModel(BatchEdit, selectedRows.value)
  handleReloadTable()
}

async function handleCopy() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择设备！')
  }
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要复制选中的设备吗?',
    centered: true,
    async onOk() {
      loading.value = true
      await copyEquipmentAsset({
        idList: selectedRows.value.map(item => item.id),
        copyCount: 1,
      }).finally(() => {
        loading.value = false
      })
      message.success('复制成功')
      handleReloadTable()
    },
  })
}

function handleDownloadTemplate() {
  window.open('/ilis2/rest/equipment/assets/import/model')
}

async function handleImport(info: any) {
  uploadLoading.value = true
  const { data } = await importEquipmentAsset(info.file).finally(() => {
    uploadLoading.value = false
  })
  if (data?.length) {
    Modal.error({
      title: '导入失败',
      content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, data.map((item: string) => {
        return h('p', item)
      })),
    })
  }
  else {
    message.success('导入成功')
    handleReloadTable()
  }
}

async function handlePrintTag(rows: EquipmentAssetEntity[]) {
  if (!rows?.length) {
    return message.warning('请选择设备')
  }
  await AnyDialogHelper.showModel(PrintTag, selectedRows.value)
  handleReloadTable()
}
</script>
