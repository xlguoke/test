<template>
  <IlisContainer app-id="train_record">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="TrainRecordEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button
          v-permission="'trainRecordAdd'"
          type="primary"
          @click="editData = TrainRecordEntity.fromJSON({});isShowEdit = true"
        >
          新增
        </a-button>
        <CustomAttribute
          v-permission="'trainRecordCustomAttr'"
          customize-type="trainRecord"
          @save="handleReloadTable()"
        />
        <IlisCustomColumns
          v-permission="'trainRecordCustomCloumns'"
          type="trainRecord"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
        <a-button
          v-permission="'trainRecordExport'"
          @click="handleExport('/trainRecordController.do?export')"
        >
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          :key="tableKey"
          show-index
          row-key="id"
          :loading="loading"
          :table-height="tableHeight"
          :data-source="dataSource"
          :entity="TrainRecordEntity"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-space>
                <a v-permission="'trainRecordEdit'" @click="editData = TrainRecordEntity.fromJSON(record); isShowEdit = true">编辑</a>
                <a v-permission="'trainRecordDel'" @click="handleDelete([record] as TrainRecordEntity[])">删除</a>
                <a @click="showDetail(record as TrainRecordEntity)">详情</a>
                <a v-permission="'trainRecordFile'" @click="showMaterial(record as TrainRecordEntity)">资料</a>
              </a-space>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
    <!-- 新增编辑详情 -->
    <EditVue
      v-model:show="isShowEdit"
      :data="editData"
      :success-callback="successCallback"
      :is-detail="isDetail"
      @close="isDetail = false"
    ></EditVue>
    <!-- 资料 -->
    <Material
      v-if="isShowMaterial"
      :id="editData.id?.toString()"
      v-model:show="isShowMaterial"
    ></Material>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { CustomAttribute } from '~/components/customAttribute'
import { useTableHooks } from '~/hooks/useTableHooks'
import { delTrainRecord, getTrainRecordPage } from './api'
import Material from './component/Material.vue'
import EditVue from './edit.vue'
import { TrainRecordEntity } from './TrainRecordEntity'

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getList,
  getPagination,
  handleSearch,
  handleReset,
  handleSortChange,
  handleExport,
  handleReloadTable,
} = useTableHooks<TrainRecordEntity>({
  api: getTrainRecordPage,
  customType: 'trainRecord',
  sizeKey: 'rows',
})

const isShowEdit = ref(false)

const isShowMaterial = ref(false)

const editData = ref(new TrainRecordEntity())

const isDetail = ref(false)

const tableKey = ref(0)

function successCallback() {
  isDetail.value = false
  getList()
}

function showDetail(row: TrainRecordEntity) {
  editData.value = TrainRecordEntity.fromJSON(row)
  isDetail.value = true
  isShowEdit.value = true
}

function showMaterial(row: TrainRecordEntity) {
  editData.value = TrainRecordEntity.fromJSON(row)
  isShowMaterial.value = true
}

function handleDelete(rows: TrainRecordEntity[]) {
  Modal.confirm({
    title: '确认要删除数据吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后数据无法恢复',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await delTrainRecord(rows)
      message.success('删除成功')
      getList()
    },
  })
}
</script>

<style scoped>
a{
  color: #1890ff;
}
</style>
