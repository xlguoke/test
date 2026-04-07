<template>
  <div class="h-full flex flex-col gap-2">
    <a-space>
      <a-tree-select
        v-model:value="query.departId"
        class="w-[260px]"
        :dropdown-style="{ maxHeight: '405px', overflow: 'auto' }"
        placeholder="请选择部门"
        allow-clear
        :tree-data="departmentData"
        tree-default-expand-all
        @change="customSearch"
      >
        <template #maxTagPlaceholder="text">
          <span :title="text.map((i: any) => i.label).join(',')">+ {{ text.length }} ...</span>
        </template>
      </a-tree-select>
      <a-input v-model:value="query.quickQry" placeholder="请输入功能室名称查询" allow-clear @keypress.enter="customSearch" />
      <a-button type="primary" @click="customSearch">
        查询
      </a-button>
      <a-button @click="resetSearch">
        重置
      </a-button>
    </a-space>
    <a-space>
      <a-button type="primary" @click="oepnEditModal">
        新增
      </a-button>
      <!-- 列筛选 -->
      <IlisCustomColumns :type="CUSTOMMIZE_TYPE" @confirm="handleReloadTable" />
      <a-button @click="handleExport('/rest/laboratory/controller/export')">
        导出
      </a-button>
      <a-button v-permission="'setPositionCodeBatch'" @click="handleBatchSet">
        批量配置目的地编号
      </a-button>
      <a-button v-permission="'setTHBatch'" @click="handleBatchSetTH">
        批量设置温湿度
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :loading="loading"
        :data-source="dataSource"
        :entity="LaboratoryEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow()"
        :table-height="tableHeight"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'isLaboratory'">
            {{ `${text}` === '1' ? '√' : '×' }}
          </template>

          <template v-else-if="column.dataIndex === 'minTemperature'">
            <div v-if="record.minTemperature != null">
              {{ record.minTemperature }}℃ ~ {{ record.maxTemperature }}℃
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'minHumidity'">
            <span v-if="record.minHumidity != null">
              <div>{{ record.minHumidity }}% ~ {{ record.maxHumidity }}%</div>
            </span>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <a-space :size="0">
              <a-button type="link" title="详情" @click="detail(record as LaboratoryEntity)">
                详情
              </a-button>
              <a-button type="link" @click="editRow(record as LaboratoryEntity)">
                编辑
              </a-button>
              <a-button type="link" danger @click="deleteRow(record.id, record.uid)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </IlisTable>
    </div>

    <Edit ref="editRef" @callback="getList" />
  </div>
</template>

<script lang="ts" setup>
import type { IOrgEntity } from '~/interface/IOrgEntity'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getOrgList } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import getDepartmentData from '~/providers/api/getDepartment.js'
import { getPageList } from '../../api'
import { CUSTOMMIZE_TYPE, LaboratoryEntity } from '../laboratoryEntity'
import Edit from './components/edit.vue'
import SetPositionCodeBatch from './components/SetPositionCodeBatch.vue'
import SetThBatch from './components/SetThBatch.vue'

const query = ref({
  departId: undefined,
  quickQry: '',
})
const orgDatas = ref<IOrgEntity[]>([])
const departmentData = ref([])

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRowKeys,
  customColumns,
  getList,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleExport,
  handleReloadTable,
} = useTableHooks({
  customType: CUSTOMMIZE_TYPE,
  api: getPageList,
  query,
  totalKey: 'count',
  responseDataTransform: (res) => {
    if (res.success) {
      return res.obj
    }
    return {
      rows: [],
      count: 0,
    }
  },
})

onMounted(async () => {
  getOrgDatas()
  const departs = await getDepartmentData()
  departmentData.value = departs
})

// 新增
const editRef = ref()
function oepnEditModal() {
  editRef.value.showModal()
}

async function handleBatchSet() {
  if (selectedRowKeys.value.length < 1) {
    message.warning('至少选择一条数据')
    return
  }
  await AnyDialogHelper.showModel(SetPositionCodeBatch, { ids: selectedRowKeys.value })
  handleReloadTable()
}
async function handleBatchSetTH() {
  if (selectedRowKeys.value.length < 1) {
    message.warning('至少选择一条数据')
    return
  }
  await AnyDialogHelper.showModel(SetThBatch, { ids: selectedRowKeys.value })
  handleReloadTable()
}

// 重置查询
function resetSearch() {
  query.value = {
    departId: undefined,
    quickQry: '',
  }
  customSearch()
}
// 查询
function customSearch() {
  handleSearch(query.value)
}
// 获取部门信息
async function getOrgDatas() {
  const { data } = await getOrgList()
  orgDatas.value = data
}
function editRow(row: LaboratoryEntity) {
  editRef.value.showModal(row)
}
function detail(row: LaboratoryEntity) {
  editRef.value.showModal(row, true)
}
function deleteRow(did?: string, uid?: string) {
  Modal.confirm({
    title: '确认要删除数据吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后数据无法恢复',
    centered: true,
    onOk: () => {
      if (did && !uid) {
        loading.value = true
        window.$oAjax({
          url: window.$oApi.laboratory.delUrl,
          data: window.$oQs.stringify({ id: did }),
          method: 'post',
        }).then((res: any) => {
          if (res.success) {
            getList()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          message.success('删除成功')
          loading.value = false
        }).catch(() => {
          loading.value = false
        })
      }
      else {
        const newData = [...dataSource.value]
        dataSource.value = newData.filter(item => item.id !== uid)
        message.success('删除成功')
      }
    },
  })
}
</script>
