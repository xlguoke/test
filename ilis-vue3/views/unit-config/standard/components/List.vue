<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <ListSearch @search="search" @reset="reset" />

    <a-flex class="mb-1 mt-2 items-center justify-between">
      <a-space>
        <a-button class="flex items-center" :icon="h(PlusOutlined)" @click="editTable('')">
          添加规程
        </a-button>
        <template v-if="!selectedMode">
          <a-button @click="showModalType">
            变更规程分组
          </a-button>
          <a-button :loading="asyncLoading" @click="duplicatedNorms">
            同步系统规程
          </a-button>
          <a-button @click="exportTemplate">
            下载模板
          </a-button>
          <a-button @click="exportExcel">
            导出
          </a-button>
          <a-upload
            name="file"
            accept=".xlsx"
            :multiple="false"
            :disabled="uploadLoading"
            :show-upload-lis="false"
            :before-upload="importExcelBeforeUpload"
            :file-list="[]"
            @change="importExcel"
          >
            <a-button :loading="uploadLoading">
              导入
            </a-button>
          </a-upload>
        </template>
      </a-space>
      <p class="expired ml-2">
        表示该规程已过期
      </p>
    </a-flex>

    <div ref="tableBoxRef" class="flex-1 overflow-auto">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ x: 1200, y: tableHeight }"
        @change="handleTableChange"
      >
        <template #headerCell="{ title, column }">
          <template v-if="column.dataIndex === 'toReferral'">
            {{ title }}
            <a-tooltip>
              <template #title>
                强制性行业标准转化为推荐性标准
              </template>
              <QuestionCircleOutlined style="color: #999" />
            </a-tooltip>
          </template>
        </template>
        <template #bodyCell="{ column, text, record }">
          <div :class="expiredFun(record.expireDate) ? 'text-orange' : ''">
            <template v-if="column.dataIndex === 'type'">
              {{ STANDARD_TYPE_DICT.getLabelByKey(text) }}
            </template>
            <template v-else-if="column.dataIndex === 'sourceType'">
              {{ SOURCE_TYPE.SYS === text ? '是' : '否' }}
            </template>
            <template v-else-if="column.dataIndex === 'whetherThisUnit'">
              <a-switch
                :checked="text === BOOLEAN_OPT.TRUE"
                checked-children="是"
                un-checked-children="否"
                @change="whetherThisUnitChanges(record as DataSource)"
              />
            </template>
            <template v-else-if="column.dataIndex === 'toReferral'">
              <!-- 系统规程才显示 -->
              <template v-if="record.sourceType === SOURCE_TYPE.SYS">
                <a-switch
                  v-if="hasPermission('standardToReferral')"
                  :checked="text === BOOLEAN_OPT.TRUE"
                  checked-children="是"
                  un-checked-children="否"
                  @change="changeToReferral(record as DataSource)"
                />
                <span v-else>{{ text === BOOLEAN_OPT.TRUE ? '是' : '否' }}</span>
              </template>
              <span v-else>--</span>
            </template>
            <template v-else-if="column.dataIndex === 'fileName'">
              <a href="#" class="text-blue-500 underline hover:underline" @click="openFile(record.fileId)">{{ text }}</a>
              <span v-if="!text">--</span>
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <template v-if="selectedMode">
                <a-button
                  type="link"
                  @click="detailTable(record as DataSource)"
                >
                  详情
                </a-button>
              </template>
              <template v-else>
                <a-button
                  type="link"
                  @click="upload(record as DataSource)"
                >
                  上传
                </a-button>
                <a-button
                  type="link"
                  @click="detailTable(record as DataSource)"
                >
                  详情
                </a-button>
                <a-button
                  v-if="record.sourceType !== SOURCE_TYPE.SYS"
                  type="link"
                  @click="editTable(record.id)"
                >
                  编辑
                </a-button>
                <a-button
                  v-permission="'standardTraceablitity'"
                  type="link"
                  @click="showSource(record.id)"
                >
                  规程溯源
                </a-button>
                <a-button
                  v-if="record.sourceType !== SOURCE_TYPE.SYS"
                  type="link"
                  danger
                  @click="deleteTable(record.id)"
                >
                  删除
                </a-button>
              </template>
            </template>
            <template v-else>
              {{ text || '--' }}
            </template>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 新增、编辑 -->
    <AddEdit ref="addeditRef" @save="getList" />
    <!-- 变更规程分组 -->
    <EditStandardType v-if="!selectedMode" ref="editStandardTypeRef" @success="getList" />
    <!-- 检测重复规程 -->
    <RepeatStandard v-if="!selectedMode" ref="repeatStandardRef" @success="validReapetSuccess" />
    <!-- 导入失败 -->
    <a-modal
      v-if="!selectedMode"
      v-model:open="importData.visible"
      :title="importData.title"
      width="600px"
    >
      <div class="h-min-[300px] h-max-[70vh] overflow-auto">
        <p v-for="(item, i) in importData.errorList" :key="i">
          {{ item }}
        </p>
      </div>
      <template #footer>
        <a-button @click="importDataClose">
          关闭
        </a-button>
      </template>
    </a-modal>

    <!-- 上传 -->
    <Upload ref="uploadRef" @save="getUploadFile" />
    <!-- 溯源 -->
    <Source ref="sourceRef" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { BOOLEAN_OPT, OrderType, SOURCE_TYPE, STANDARD_TYPE_DICT } from '../'
import { deleteStandardApi, getStandardFileApi, importStandardApi, pageListApi, saveStandardApi, syncSystemStandardApi, whetherThisUnitChangeApi } from '../api'
import type { DataSource, Query } from '../api'
import ListSearch from './ListSearch.vue'
import EditStandardType from './EditStandardType.vue'
import AddEdit from './AddEdit.vue'
import type { FileInfo } from './Upload.vue'
import Upload from './Upload.vue'
import Source from './Source.vue'
import RepeatStandard from './RepeatStandard.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import { usePermissionStore } from '~/store/permissionStore'

const props = defineProps({
  /** 选择模式-其他模块引用 */
  selectedMode: {
    type: Boolean,
    default: false,
  },
})

const parentRefreshTypes = inject<() => void>('parentRefreshTypes')

const { hasPermission } = usePermissionStore()

const columns: ColumnType[] = [
  { title: '规程名称', dataIndex: 'standardName', width: '18%', fixed: 'left' },
  { title: '颁布号', dataIndex: 'publishCode', sorter: true },
  { title: '规程类型', dataIndex: 'type' },
  { title: '执行日期', dataIndex: 'executeDate' },
  { title: '过期日期', dataIndex: 'expireDate' },
  { title: '是否系统规程', dataIndex: 'sourceType' },
  { title: '是否为本单位规程', dataIndex: 'whetherThisUnit' },
  { title: '是否强改推规程', dataIndex: 'toReferral' },
  { title: '规程文件', dataIndex: 'fileName' },
  { title: '操作', dataIndex: 'action', width: props.selectedMode ? 80 : 220, fixed: 'right' },
]

const { tableHeight, tableBoxRef } = useTableHeight()
const query: any = ref<Query>({
  standardTypeId: '',
})
const {
  loading,
  dataSource,
  selectedRowKeys,
  selectedRows,
  getList,
  getRowSelection,
  getPagination,
  handleSearch,
  handleReset,
} = useTableHooks<DataSource>({
  api: pageListApi,
  query,
  sizeKey: 'rows',
})

function search(data: Query) {
  query.value = data
  handleSearch()
}

function reset(data: Query) {
  query.value = data
  handleReset()
}

// 排序
function handleTableChange(_pagination: any, _filters: any, sorter: any) {
  const { order, field } = sorter
  const desc = order === 'descend' ? OrderType.DESC : OrderType.ASC
  query.value.orderBy = order ? field : ''
  query.value.order = order ? desc : ''
  getList()
}

// 过期规程
function expiredFun(expireDate: string) {
  if (!expireDate)
    return false

  const currentDate = new Date().toLocaleDateString()
  return new Date(expireDate).getTime() < new Date(currentDate).getTime()
}

/** 变更规程 */
const editStandardTypeRef = ref()
function showModalType() {
  const keys = selectedRowKeys.value || []
  if (keys.length > 0) {
    editStandardTypeRef.value.showModal(keys)
  }
  else {
    message.warning('请选择需要变更规程分组的数据')
  }
}

/** 同步系统规程 */
const asyncLoading = ref(false)
const repeatStandardRef = ref()
function duplicatedNorms() {
  asyncLoading.value = true
  syncSystemStandardApi().then(async (res) => {
    if (res.data.length > 1) {
      repeatStandardRef.value.showModal(res.data)
    }
    else {
      await repeatStandardRef.value.syncBaseStandard()
    }
    asyncLoading.value = false
  }).catch(() => {
    message.error('同步失败')
    asyncLoading.value = false
  })
}

/** 验证重复规程完成 */
function validReapetSuccess(isAsync?: boolean) {
  if (isAsync) {
    duplicatedNorms()
  }
  else {
    getList()
  }
}

/** 下载模板 */
function exportTemplate() {
  window.open(`/ilis2/baseStandardManageController/export/template.do`)
}

/** 导出 */
function exportExcel() {
  const params: any = {}
  for (const k in query.value) {
    if (!query.value[k])
      continue
    params[k] = query.value[k]
  }
  const url = `/ilis2/baseStandardManageController/export.do?${new URLSearchParams(params)}`
  window.open(url)
}

function importExcelBeforeUpload() {
  return false
}

/** 导入 */
const uploadLoading = ref(false)
const importData = ref({
  visible: false,
  title: '',
  errorList: [],
})
async function importExcel(info: any) {
  uploadLoading.value = true
  try {
    const { data } = await importStandardApi({ file: info.file })
    if (data && data.code === 20000) {
      message.success('导入成功')
      getList()
      if (parentRefreshTypes)
        parentRefreshTypes()
    }
    else {
      importData.value.title = data.msg || data.message || '导入失败'
      importData.value.errorList = data.data
      importData.value.visible = true
    }
  }
  finally {
    uploadLoading.value = false
  }
}

// 关闭导入失败弹窗
function importDataClose() {
  importData.value.visible = false
  importData.value.title = '导入失败'
  importData.value.errorList = []
}

// 上传
const uploadRef = ref()
const editRow = ref()
function upload(row: DataSource) {
  uploadRef.value.showModal()
  editRow.value = row
}
// 上传回调
async function getUploadFile(file?: FileInfo) {
  if (!file || !file.fileId)
    return ''
  try {
    loading.value = true
    await saveStandardApi({
      id: editRow.value.id,
      fileId: file.fileId,
      standardName: editRow.value.standardName,
      executeDate: editRow.value.executeDate,
      expireDate: editRow.value.expireDate,
      standardTypeId: query.value.standardTypeId,
    })
    getList()
  }
  finally {
    loading.value = false
  }
}

// 详情
function detailTable(row: DataSource) {
  window.open(`http://www.doc88.com/tag/${row.standardName}${row.publishCode}`)
}

// 编辑
const addeditRef = ref()
function editTable(id: string) {
  if (!props.selectedMode && !id && !query.value.standardTypeId) {
    message.warning('请选择规程分组')
    return
  }
  addeditRef.value.showModal(id, query.value.standardTypeId)
}

// 规程溯源
const sourceRef = ref()
function showSource(id: string) {
  sourceRef.value.showModal(id, true)
}

// 删除
function deleteTable(id: string) {
  Modal.confirm({
    title: '删除提示',
    content: '确定删除该规程？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteStandardApi(id)
      message.success('删除成功')
      getList()
    },
  })
}

// 是否为本单位规程
async function whetherThisUnitChanges(row: DataSource, ignoreTip = false) {
  try {
    loading.value = true
    await whetherThisUnitChangeApi({
      id: row.id,
      checked: !(row.whetherThisUnit === BOOLEAN_OPT.TRUE),
    })
    if (ignoreTip === false) {
      message.success('修改成功')
    }
    getList()
  }
  finally {
    loading.value = false
  }
}

// 修改强改推
async function changeToReferral(row: DataSource) {
  loading.value = true
  try {
    const data = { ...row, standardTypeId: '' }
    data.toReferral = row.toReferral === BOOLEAN_OPT.TRUE ? BOOLEAN_OPT.FALSE : BOOLEAN_OPT.TRUE
    await saveStandardApi(data)
    message.success('修改成功')
    getList()
  }
  finally {
    loading.value = false
  }
}

// 打开文件
async function openFile(fileId: string) {
  loading.value = true
  try {
    const { data } = await getStandardFileApi(fileId)
    const blob = new Blob([data], {
      type: 'application/pdf',
    })
    const href = window.URL.createObjectURL(blob)
    window.open(href, '_blank')
  }
  finally {
    loading.value = false
  }
}

// 刷新列表
function refreshList(id?: string) {
  query.value.standardTypeId = id || ''
  handleSearch()
}

defineExpose({
  refreshList,
  whetherThisUnitChanges,
  selectedRows,
})
</script>

<style scoped>
.text-orange{
  color: #ff5722;
}
.expired::before{
  display: inline-block;
  content: '';
  width: 12px;
  height: 12px;
  background-color: #ff5722;
}
</style>
