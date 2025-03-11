<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EvaluateRecordEntity"
        :init-data="initQuery"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #modelId="{ data }">
          <IlisInput
            v-model="data.modelId"
            :entity="EvaluateRecordEntity"
            :options="evaluateModelSelectOptions"
            field="modelId"
            class="min-w-[240px]"
            @change="handleSearch({ ...data, modelId: $event })"
          ></IlisInput>
        </template>
        <template #consignUnitId="{ data }">
          <IlisInput
            v-model="data.consignUnitId"
            :entity="EvaluateRecordEntity"
            :options="unitSelectOptions"
            field="consignUnitId"
            class="min-w-[240px]"
            @change="handleSearch({ ...data, consignUnitId: $event })"
          ></IlisInput>
        </template>
      </IlisFormSearch>
      <a-space>
        <a-button @click="handleExport('rest/evaluate/record?export')">
          导出记录
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EvaluateRecordEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="CautionStatusDict.getColorByKey(text)" :bordered="false">
                {{ CautionStatusDict.getLabelByKey(text) }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(Detail, record)">
                查看
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '33' })"
              >
                日志
              </a-button>
              <a-button
                v-if="(record as EvaluateRecordEntity).status === CautionStatus.WAIT"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(DealWidth, record).then(() => handleReloadTable())"
              >
                处理
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { getEvaluateModelListAll } from '../model/api'
import { getUnitUserAll } from '../inv/api'
import { CautionStatus, CautionStatusDict, EvaluateRecordEntity } from './EvaluateRecordEntity'
import DealWidth from './components/DealWidth.vue'
import { getEvaluateRecordPage } from './api'
import Detail from './components/Detail.vue'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisFormSearch, IlisInput, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IInputOption } from '~/interface/IInputOption'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReset,
  handleSortChange,
  handleExport,
  handleReloadTable,
} = useTableHooks<EvaluateRecordEntity>({
  api: getEvaluateRecordPage,
  sizeKey: 'rows',
})

const evaluateModelSelectOptions = ref<IInputOption[]>([])

const urlParams = new URLSearchParams(location.search)
const modelId = urlParams.get('modelId')
const initQuery = ref(new EvaluateRecordEntity())
if (modelId) {
  initQuery.value.modelId = modelId
}
async function getEvaluateModelList() {
  const { data } = await getEvaluateModelListAll({ queryAll: 1 })
  evaluateModelSelectOptions.value = data.map((item) => {
    return {
      label: item.name,
      value: item.id.toString(),
    }
  })
}

const unitSelectOptions = ref<IInputOption[]>([])

async function getUnitSelectOptions() {
  const { data } = await getUnitUserAll()
  unitSelectOptions.value = data.map((item) => {
    return {
      label: item.unitName,
      value: item.id.toString(),
    }
  })
}

getEvaluateModelList()
getUnitSelectOptions()
</script>

<style>

</style>
