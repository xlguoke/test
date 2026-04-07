<template>
  <BaseSpinWrapper :spinning="loading">
    <ListSearch @search="search" @reset="reset" />

    <div class="flex items-center justify-between">
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
          <a-button @click="handleMergeStandard">
            合并规程
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
          <a-button @click="configVerificationPerson">
            配置验证人员
          </a-button>
        </template>
      </a-space>
      <p class="expired ml-2">
        表示该规程已过期
      </p>
    </div>

    <div ref="tableBoxRef" class="flex-1 h-0 overflow-auto">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :custom-row="getCustomRow()"
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
            <template v-if="column.dataIndex === 'mark' && !!text">
              <a-tag color="red">
                待验证
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'type'">
              {{ STANDARD_TYPE_DICT.getLabelByKey(text) }}
            </template>
            <template v-else-if="column.dataIndex === 'sourceType'">
              {{ SOURCE_TYPE.SYS === text ? '是' : '否' }}
            </template>
            <template v-else-if="column.dataIndex === 'whetherThisUnit'">
              <div @click.stop="() => {}">
                <a-switch
                  :checked="text === BOOLEAN_OPT.TRUE"
                  checked-children="是"
                  un-checked-children="否"
                  @change="whetherThisUnitChanges(record as DataSource)"
                />
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'toReferral'">
              <!-- 系统规程才显示 -->
              <template v-if="record.sourceType === SOURCE_TYPE.SYS">
                <div v-if="hasPermission('standardToReferral')" @click.stop="() => {}">
                  <a-switch
                    :checked="text === BOOLEAN_OPT.TRUE"
                    checked-children="是"
                    un-checked-children="否"
                    @change="changeToReferral(record as DataSource)"
                  />
                </div>
                <span v-else>{{ text === BOOLEAN_OPT.TRUE ? '是' : '否' }}</span>
              </template>
              <span v-else>--</span>
            </template>
            <template v-else-if="column.dataIndex === 'fileName'">
              <a href="#" class="text-blue-500 underline hover:underline" @click.stop="openFile(record as DataSource)">{{ text }}</a>
              <span v-if="!text">--</span>
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <div @click.stop="() => {}">
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
                    v-if="record.type !== STANDARD_TYPE.STANDARD"
                    type="link"
                    @click="showTestMethod(record as DataSource)"
                  >
                    检测方法验证
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
              </div>
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
    <ht-modal
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
    </ht-modal>

    <!-- 选择验证人员 -->
    <ht-modal
      v-model:open="checkVisible"
      title="配置验证人员"
      width="500px"
      :confirm-loading="saveLoading"
      @ok="onOk"
      @cancel="onCancel"
    >
      <a-form ref="formRef" :model="checkForm" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          label="验证人员" name="verificationUserName"
          :rules="[{ required: true, message: '请选择验证人员', trigger: 'change' }]"
        >
          <a-flex gap="4">
            <a-input v-model:value="checkForm.verificationUserName" disabled placeholder="请选择验证人员" />
            <a-button type="primary" @click="personVisible = true">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
      </a-form>
    </ht-modal>

    <!-- 选择验证人员 -->
    <PersonSelector v-model:show="personVisible" @confirm="confirmSelectedPerson" />
    <!-- 上传 -->
    <IlisUpload v-model:show="showUpload" :accept="['.pdf']" :max="1" force @success="getUploadFile" />
    <!-- 溯源 -->
    <Source ref="sourceRef" />
    <!-- 合并规程 -->
    <MergeStandard v-if="!selectedMode" ref="mergeStandardRef" @success="getList" />
  </BaseSpinWrapper>
</template>

<script setup lang='ts'>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { DataSource, Query } from '../api'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { ref } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { BOOLEAN_OPT, OrderType, SOURCE_TYPE, STANDARD_TYPE, STANDARD_TYPE_DICT } from '../'
import { deleteStandardApi, importStandardApi, pageListApi, saveStandardApi, saveVerificationUser, syncSystemStandardApi, updateStandardFileApi, whetherThisUnitChangeApi } from '../api'
import AddEdit from './AddEdit.vue'
import CheckTestMethod from './CheckTestMethod.vue'
import EditStandardType from './EditStandardType.vue'
import ListSearch from './ListSearch.vue'
import MergeStandard from './MergeStandard.vue'
import RepeatStandard from './RepeatStandard.vue'
import Source from './Source.vue'

const props = defineProps({
  /** 选择模式-其他模块引用 */
  selectedMode: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:isLoading'])

const parentRefreshTypes = inject<() => void>('parentRefreshTypes')

const { hasPermission } = usePermissionStore()

const columns = computed<ColumnType[]>(() => {
  const cols: ColumnType[] = [
    { title: '标记', dataIndex: 'mark', width: '80px', fixed: 'left' },
    { title: '规程名称', dataIndex: 'standardName', width: '18%', fixed: 'left' },
    { title: '颁布号', dataIndex: 'publishCode', sorter: true },
    { title: '规程类型', dataIndex: 'type' },
    { title: '发布日期', dataIndex: 'publishDate' },
    { title: '执行日期', dataIndex: 'executeDate' },
    { title: '过期日期', dataIndex: 'expireDate' },
    { title: '是否系统规程', dataIndex: 'sourceType' },
    { title: '是否为本单位规程', dataIndex: 'whetherThisUnit' },
    { title: '是否强改推规程', dataIndex: 'toReferral' },
    { title: '规程文件', dataIndex: 'fileName' },
  ]
  if (!props.selectedMode) {
    cols.push({ title: '操作', dataIndex: 'action', width: 220, fixed: 'right' })
  }
  return cols
})

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
  getCustomRow,
} = useTableHooks<DataSource>({
  api: pageListApi,
  query,
  sizeKey: 'rows',
  immediate: false,
})

watch(() => loading.value, (val) => {
  emits('update:isLoading', val)
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

/** 合并规程 */
const mergeStandardRef = ref()
async function handleMergeStandard() {
  const rows = selectedRows.value || []
  if (rows.length > 1) {
    mergeStandardRef.value.showModal(rows)
  }
  else {
    message.warning('请至少选择两条数据')
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
const showUpload = ref(false)
const editRow = ref()
function upload(row: DataSource) {
  showUpload.value = true
  editRow.value = row
}
// 上传回调
async function getUploadFile(files: any[]) {
  const file = files[0]
  try {
    loading.value = true
    await updateStandardFileApi({
      id: editRow.value.id,
      fileId: file.id,
    })
    getList()
  }
  catch (err) {
    console.error(err)
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

// 检测方法验证
async function showTestMethod(row: DataSource) {
  await AnyDialogHelper.showModel(CheckTestMethod, row)
  getList()
}

// 删除
function deleteTable(id: string) {
  Modal.confirm({
    title: '删除提示',
    content: '确定删除该规程？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      loading.value = true
      await deleteStandardApi(id)
      message.success('删除成功')
      getList()
    },
  })
}

// 是否为本单位规程
const rowData = ref<DataSource>()
const isIgnoreTip = ref<boolean>()
const checkVisible = ref(false)
const personVisible = ref(false)
async function whetherThisUnitChanges(row: DataSource, ignoreTip = false) {
  if (row.whetherThisUnit === '0' && row.type !== STANDARD_TYPE.STANDARD && !props.selectedMode) {
    rowData.value = row
    isIgnoreTip.value = ignoreTip
    checkVisible.value = true
  }
  submitWhetherThisUnit(row, ignoreTip)
}

// 修改是否为本单位规程
async function submitWhetherThisUnit(row: DataSource, ignoreTip = false) {
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
  catch (err) {
    console.error(err)
    loading.value = false
  }
}

// 选择验证人员
const saveLoading = ref(false)
const formRef = ref()
const checkForm = ref({
  verificationUserId: '',
  verificationUserName: '',
})
function confirmSelectedPerson(data: IUserSelectVoEntity[]) {
  checkForm.value.verificationUserName = data[0].name
  checkForm.value.verificationUserId = data[0].id
  personVisible.value = false
  formRef.value.validateFields()
}
// 关闭选择验证人员弹窗
function onCancel() {
  checkVisible.value = false
  checkForm.value.verificationUserId = ''
  checkForm.value.verificationUserName = ''
  rowData.value = undefined
  isIgnoreTip.value = undefined
  formRef.value.resetFields()
}
// 确认验证人员
async function onOk() {
  try {
    saveLoading.value = true
    await formRef.value.validateFields()

    let ids: any = selectedRowKeys.value
    if (rowData.value) {
      ids = [rowData.value.id]
    }
    await saveVerificationUser({
      standardIds: ids,
      ...checkForm.value,
    })

    message.success('操作成功!')
    onCancel()
  }
  catch (err) {
    console.error(err)
  }
  saveLoading.value = false
}

/** 配置验证人员（批量操作） */
function configVerificationPerson() {
  const rows = selectedRows.value
  if (rows.length === 0 || rows.some(d => !d.mark)) {
    message.warning('请选择待验证的数据')
    return
  }

  rowData.value = undefined
  checkVisible.value = true
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
  catch (err) {
    console.error(err)
    loading.value = false
  }
}

// 打开文件
async function openFile(row: DataSource) {
  if (!row.fileUrl)
    return
  window.open(row.fileUrl, '_blank')
}

// 刷新列表
async function refreshList(id?: string) {
  query.value.standardTypeId = id || ''
  return await handleSearch()
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
.ant-spin-nested-loading,
:deep(.ant-spin-nested-loading .ant-spin-container){
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
