<template>
  <IlisContainer app-id="common_eq_software">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="SoftwareEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button @click="AnyDialogHelper.showModel(AddEdit, SoftwareEntity.fromJSON({})).then(() => handleReloadTable())">
          新增软件
        </a-button>
        <a-button @click="handleExport('rest/software/management/export')">
          导出
        </a-button>
        <CustomAttribute
          customize-type="softwareManagement"
          @save="handleReloadTable()"
        />
        <IlisCustomColumns
          type="softwareManagement"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="SoftwareEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :custom-columns="customColumns"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-switch
                v-model:checked="(record as SoftwareEntity).status"
                :loading="switchLoading"
                :checked-value="SoftwareStatus.OPEN"
                :un-checked-value="SoftwareStatus.CLOSE"
                @change="handleStatusChange((record as SoftwareEntity))"
              ></a-switch>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(AddEdit, SoftwareEntity.fromJSON(record)).then(() => handleReloadTable())">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(Detail, SoftwareEntity.fromJSON(record))">
                详情
              </a-button>
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '35' })">
                日志
              </a-button>
              <a-button type="link" size="small" @click="handleDelete([record] as SoftwareEntity[])">
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
import { message } from 'ant-design-vue'
import { SoftwareEntity, SoftwareStatus } from './SoftwareEntity'
import { delSoftware, getSoftwareList, putSoftware } from './api'
import AddEdit from './component/AddEdit.vue'
import Detail from './component/Detail.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisCustomColumns, IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { CustomAttribute } from '~/components/customAttribute'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleExport,
  handleDelete,
} = useTableHooks<SoftwareEntity>({
  api: getSoftwareList,
  delApi: delSoftware,
  customType: 'softwareManagement',
})

const switchLoading = ref(false)

async function handleStatusChange(row: SoftwareEntity) {
  switchLoading.value = true
  await putSoftware(row).finally(() => (switchLoading.value = false))
  message.success('操作成功')
  handleReloadTable()
}
</script>
