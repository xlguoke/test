<template>
  <div class="h-full flex flex-col">
    <a-flex justify="space-between">
      <a-space>
        <a-input
          v-model:value.trim="queryForm.testItemName"
          class="w-[180px]"
          allow-clear
          placeholder="检测项目"
        />
        <a-input
          v-model:value.trim="queryForm.name"
          class="w-[180px]"
          allow-clear
          placeholder="参数名称"
        />
        <a-input
          v-model:value.trim="queryForm.displayName"
          class="w-[180px]"
          allow-clear
          placeholder="参数显示名称"
        />
        <a-select v-model:value="queryForm.paramCategoryId" class="w-[180px]" placeholder="检测参数类别">
          <a-select-option v-for="item in testParamCategoryList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-button
          :disabled="!bigCategoryId"
          type="primary"
          html-type="submit"
          @click="handleSearch()"
        >
          查询
        </a-button>
        <a-button :disabled="!bigCategoryId" @click="reset">
          重置
        </a-button>
      </a-space>

      <a-select
        v-if="bigCategoryId"
        :value="unitMeasure"
        class="w-[120px]"
        placeholder="计量单位"
        :options="unitList"
        @change="onSetUnitMeasure"
      />
    </a-flex>

    <a-space>
      <a-button :disabled="!bigCategoryId" class="mt-4" @click="onBatchSetting">
        设置共用试验数量
      </a-button>
      <a-button
        :disabled="!bigCategoryId"
        class="mt-4"
        :loading="cancelLoading"
        @click="onCancelSetting"
      >
        取消共用试验数量
      </a-button>
      <a-button class="mt-4" :loading="exportLoading" :disabled="!bigCategoryId" @click="onExport">
        导出
      </a-button>
      <a-upload
        name="file"
        accept=".xlsx"
        :multiple="false"
        :disabled="!bigCategoryId"
        :show-upload-lis="false"
        :before-upload="importExcelBeforeUpload"
        :file-list="[]"
        @change="importExcel"
      >
        <a-button class="mt-4" :loading="uploadLoading">
          导入
        </a-button>
      </a-upload>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
        children-column-name="none"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'testQuantity'">
            试验数量
            <span v-if="unitMeasure">({{ unitMeasure }})</span>
          </template>
          <template v-if="column.dataIndex === 'shareTestQuantity'">
            共用试验数量
            <span v-if="unitMeasure">({{ unitMeasure }})</span>
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'testQuantity'">
            <a-input-number
              v-model:value="record.testQuantity"
              :min="0"
              class="w-full"
              @blur="onSaveTestQuantity(record)"
            />
          </template>
        </template>
      </a-table>
    </div>

    <!-- 设置 -->
    <EditSetting
      v-model:open="settingVisible"
      :unit-measure="unitMeasure"
      :param-ids="selectedRowKeys"
      @on-save="getList()"
    />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import EditSetting from './EditSetting.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import {
  getTestParamCategory,
  getTestParamList,
  getUnitMeasure,
  quantityExport,
  quantityImport,
  revokeShareTestQuantity,
  setTestQuantity,
  setUnitMeasure,
} from '~/views/unit-config/paramTestCount/api.ts'
import type { TestParamCategoryEntity } from '~/views/unit-config/paramTestCount/interface/TestParamCategory.ts'
import type { TestParamEntity } from '~/views/unit-config/paramTestCount/interface/TestParam.ts'
import { TestParamQuery } from '~/views/unit-config/paramTestCount/interface/TestParam.ts'
import { getSysTypeList } from '~/views/consign/component/selectSample/api.ts'

const props = defineProps({
  bigCategoryId: {
    type: String,
    default: null,
  },
  paramVersionId: {
    type: String,
    default: null,
  },
})

const columns: ColumnType[] = [
  { title: '试验项目名称', dataIndex: 'testItemName', width: '14.25%' },
  { title: '试验参数系统名称', dataIndex: 'name', width: '14.25%' },
  { title: '试验参数显示名称', dataIndex: 'displayName', width: '14.25%' },
  { title: '检测类别', dataIndex: 'paramCategoryName', width: '14.25%' },
  { title: '试验数量', dataIndex: 'testQuantity', width: '14.25%' },
  { title: '共用试验数量名称', dataIndex: 'shareTestQuantityIdent', width: '14.25%' },
  { title: '共用试验数量', dataIndex: 'shareTestQuantity', width: '14.25%' },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const settingVisible = ref(false)

const cancelLoading = ref(false)

const queryForm = ref(new TestParamQuery())

const bigCategoryId = computed(() => props.bigCategoryId)

const paramVersionId = computed(() => props.paramVersionId)

const testParamCategoryList = ref<TestParamCategoryEntity[]>([])

const unitList = ref()

const unitMeasure = ref()

const exportLoading = ref(false)

getTestParamCategory().then((res) => {
  testParamCategoryList.value = res.data
})

getUnitMeasureVal()
getUnits()

const {
  loading,
  dataSource,
  getRowSelection,
  getPagination,
  selectedRows,
  selectedRowKeys,
  handleSearch,
  handleReset,
  getList,
  total,
} = useTableHooks<TestParamEntity>({
  api: getTestParamList,
  immediate: false,
  query: queryForm,
  sizeKey: 'rows',
})

watch(() => bigCategoryId.value, (val: string) => {
  getUnitMeasureVal()

  queryForm.value = new TestParamQuery()
  queryForm.value['bigCategory.paramVersionId'] = paramVersionId.value
  queryForm.value['bigCategory.id'] = val

  selectedRows.value = []
  selectedRowKeys.value = []

  if (bigCategoryId.value) {
    handleSearch()
  }
  else {
    unitMeasure.value = ''
    dataSource.value = []
    total.value = 0
  }
})

watch(() => paramVersionId.value, (val: string) => {
  queryForm.value['bigCategory.paramVersionId'] = val
})

function reset() {
  queryForm.value = new TestParamQuery()
  queryForm.value['bigCategory.paramVersionId'] = paramVersionId.value
  queryForm.value['bigCategory.id'] = bigCategoryId.value
  handleReset()
}

/** 获取计量单位 */
async function getUnits() {
  const { data } = await getSysTypeList('8a8ab0b246dc81120146dc8181c3006d')
  unitList.value = data.rows.map((i: any) => ({ value: i.typename, label: i.typename }))
}

async function onSetUnitMeasure(val) {
  const toast = message.loading('保存中...', 0)
  await setUnitMeasure({
    bigCategoryId: bigCategoryId.value as string,
    unitMeasure: val,
    downward: false,
  }).finally(() => {
    toast()
  })

  message.success('保存成功！')
  getUnitMeasureVal()
}

async function getUnitMeasureVal() {
  if (bigCategoryId.value) {
    const res = await getUnitMeasure(bigCategoryId.value as string)
    unitMeasure.value = res.data || undefined
  }
}

async function onSaveTestQuantity(record: TestParamEntity) {
  await setTestQuantity({
    paramId: record.id,
    testQuantity: record.testQuantity,
  })

  message.success('设置成功！')
}

async function onBatchSetting() {
  if (selectedRowKeys.value.length === 0) {
    message.warn('请勾选要操作的数据！')
    return
  }

  if (selectedRowKeys.value.length < 2) {
    Modal.warning({
      title: '提示',
      content: '至少选择2个试验参数才能设置共用试验数量',
    })
    return
  }

  const hasShare = selectedRows.value.filter(i => i.shareTestQuantityIdent)

  if (hasShare.length) {
    Modal.warning({
      title: '提示',
      content: `试验参数：${hasShare.map(i => i.displayName).join('、')}，不能重复设置共用试验数量！！`,
    })
    return
  }

  settingVisible.value = true
}

async function onCancelSetting() {
  if (selectedRows.value.length === 0) {
    message.warn('请勾选要操作的数据！')
    return
  }

  const notShare = selectedRows.value.filter(i => !i.shareTestQuantityIdent)

  if (notShare.length) {
    Modal.warning({
      title: '提示',
      content: `试验参数：${notShare.map(i => i.displayName).join('、')}，无共用试验数量信息！`,
    })
    return
  }

  cancelLoading.value = true
  await revokeShareTestQuantity(selectedRowKeys.value as string[]).finally(() => {
    cancelLoading.value = false
  })
  message.success('操作成功！')
  getList()
}

async function onExport() {
  exportLoading.value = true
  const res = await quantityExport(queryForm.value).finally(() => {
    exportLoading.value = false
  })
  if (res.code !== 20010) {
    await downloader.excute(res.data, '参数试验数量.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function importExcelBeforeUpload() {
  return false
}

const uploadLoading = ref(false)
async function importExcel(info: any) {
  uploadLoading.value = true
  await quantityImport({ file: info.file }).finally(() => {
    uploadLoading.value = false
  })

  message.success('导入成功')
  getList()
}
</script>
