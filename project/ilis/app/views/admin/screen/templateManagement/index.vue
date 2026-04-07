<template>
  <IlisContainer app-id="screenTemplate">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="ScreenTemplateEntity"
        @reset="handleReset"
        @search="handleSearch"
      >
      </IlisFormSearch>
      <a-space>
        <a-button
          type="primary"
          @click="AnyDialogHelper.showModel(AddEdit).then(() => handleReloadTable())"
        >
          新增屏幕模板
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="ScreenTemplateEntity"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation' && record.configurable">
              <a-button type="link" @click="AnyDialogHelper.showModel(TempEdit, record).then(() => handleReloadTable())">
                配置
              </a-button>
              <a-button type="link" @click="AnyDialogHelper.showModel(AddEdit, record).then(() => handleReloadTable())">
                编辑
              </a-button>
              <a-button type="link" danger @click="handleDelete([record as ScreenTemplateEntity])">
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
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { delScreenTemplate, getScreenTemplateList } from './api.ts'
import AddEdit from './components/AddEdit.vue'
import TempEdit from './components/TempEdit.vue'
import { ScreenTemplateEntity } from './ScreenTemplateEntity'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleDelete,
  handleReloadTable,
} = useTableHooks<ScreenTemplateEntity>({
  api: getScreenTemplateList,
  delApi: delScreenTemplate,
})
</script>
