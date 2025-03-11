<template>
  <IlisContainer app-id="in_out_ledger">
    <div class=" h-full flex flex-col gap-2">
      <IlisFormSearch
        :entity="StandardMaterialAccountEntity"
        @reset="handleReset"
        @search="customHandleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button @click="handlePrint()">
          <PrinterOutlined />
          打印
        </a-button>
        <a-button @click="handleExport('rest/standardBookStoreController/in-out-ledger/export')">
          <ExportOutlined />
          导出
        </a-button>
        <IlisCustomColumns
          type="standard-archives-stock-ledger"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          :key="tableKey"
          show-index
          row-key="id"
          :loading="loading"
          :table-height="tableHeight"
          :data-source="dataSource"
          :entity="StandardMaterialAccountEntity"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'bookName'">
              <div>
                <a-tooltip v-if="record.isExceed">
                  <template #title>
                    规程已失效
                  </template>
                  <span style="color: red;">{{ text }}</span>
                </a-tooltip>
                <span v-else>{{
                  text
                }}</span>
              </div>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { ExportOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from '@unovis/ts'
import { StandardMaterialAccountEntity } from './StandardMaterialAccountEntity'
import { getStandardMaterialAccountPage } from './api'
import { IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import openHitekUdrTool from '~/utils/UDR'

const urlParams = new URLSearchParams(window.location.search)

const {
  loading,
  dataSource,
  lastSearchParams,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReset,
  handleSortChange,
  handleExport,
  handleReloadTable,
} = useTableHooks<StandardMaterialAccountEntity>({
  api: getStandardMaterialAccountPage,
  customType: 'standard-archives-stock-ledger',
  payload: {
    bookLocationId: urlParams.get('bookLocationId') || '',
  },
})

const tableKey = ref(0)

function customHandleSearch(q: any) {
  const query = { ...q }
  if (query.dateRange && query.dateRange.length) {
    query.createDateStart = query.dateRange[0]
    query.createDateEnd = query.dateRange[1]
    delete query.dateRange
  }
  else {
    query.createDateStart = undefined
    query.createDateEnd = undefined
  }
  handleSearch(query)
}

/**
 * # udr打印
 */
async function handlePrint() {
  const strFullPath = window.document.location.href
  const strPath = window.document.location.pathname
  const pos = strFullPath.indexOf(strPath)
  const prePath = strFullPath.substring(0, pos)
  const postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1)
  const basePath = prePath + postPath
  const query = cloneDeep(lastSearchParams.value) as Record<string, any>
  const cacheKey = await setServerCacheData({
    templateType: 'EquipmentCheckParam',
    jsonParam: query,
  })
  let url = `${basePath}/udrController.do?goUdrTemplatePrint`
  url += '&module=none'
  url += `&paramId=${cacheKey}`
  openHitekUdrTool(url, 'hide')
}
</script>
