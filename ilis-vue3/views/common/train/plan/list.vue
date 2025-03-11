<template>
  <IlisContainer app-id="train_plan">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="TrainPlanEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button
          v-permission="'trainPlanAdd'"
          type="primary"
          @click="editData = TrainPlanEntity.fromJSON({});isShowEdit = true"
        >
          新增
        </a-button>
        <CustomAttribute
          v-permission="'trainPlanCustomAttr'"
          customize-type="trainPlan"
          @save="handleReloadTable()"
        />
        <IlisCustomColumns
          v-permission="'trainPlanCustomCloumns'"
          type="trainPlan"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
        <a-button
          v-permission="'trainPlanExport'"
          @click="handleExport('/trainPlanController.do?export')"
        >
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          :key="tableKey"
          show-index
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="TrainPlanEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-space>
                <a
                  v-if="[TrainPlanStatus.WRITING, TrainPlanStatus.APPROVE_FAIL].includes(record.status)"
                  v-permission="'trainPlanEdit'"
                  @click="editData = TrainPlanEntity.fromJSON(record); isShowEdit = true"
                >
                  编辑
                </a>
                <a
                  v-if="[TrainPlanStatus.WRITING, TrainPlanStatus.APPROVE_FAIL].includes(record.status)"
                  v-permission="'trainPlanSubmit'"
                  @click="handleProcess(record as TrainPlanEntity)"
                >
                  提交
                </a>
                <a
                  v-if="[TrainPlanStatus.WRITING, TrainPlanStatus.APPROVE_FAIL].includes(record.status)"
                  v-permission="'trainPlanDel'"
                  @click="handleDelete([record] as TrainPlanEntity[])"
                >
                  删除
                </a>
                <a @click="showDetail(record as TrainPlanEntity)">
                  详情
                </a>
                <a @click="handleLog(record as TrainPlanEntity)">
                  日志
                </a>
                <a
                  v-if="record.status === TrainPlanStatus.APPROVING"
                  v-permission="'trainPlanRevoke'"
                  @click="handleRevoke(record as TrainPlanEntity)"
                >
                  撤回
                </a>
              </a-space>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
    <EditVue
      v-model:show="isShowEdit"
      :data="editData"
      :success-callback="successCallback"
      :is-detail="isDetail"
      @close="isDetail = false"
    ></EditVue>

    <LogModal :id="logId" v-model:show="showLog" log-type="26" />
    <!-- 提交审批弹窗 -->
    <a-modal
      v-model:open="showProcess"
      centered
      width="500px"
      title="提交审核"
      :body-style="{ height: '400px', overflowY: 'auto' }"
      :keyboard="false"
      :mask-closable="false"
      :confirm-loading="processLoading"
      @ok="handleSubmitProcess()"
    >
      <ProcessForm
        ref="processFormRef"
        :process-type="ProcessType.COMMON_TRAIN_PLAN"
        :label-col="{ style: { width: '100px' } }"
      />
    </a-modal>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { delTrainPlan, getTrainPlanPage, revokeTrainPlan, submitTrainPlan } from './api'
import { TrainPlanEntity, TrainPlanStatus } from './TrainPlanEntity'
import EditVue from './edit.vue'
import { IlisContainer, IlisCustomColumns, IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { CustomAttribute } from '~/components/customAttribute'
import { ProcessType } from '~/components/commonProcess'
import { preSubmitProcess } from '~/components/commonProcess/api'

const { tableBoxRef, tableHeight } = useTableHeight()
const {
  loading,
  dataSource,
  getPagination,
  customColumns,
  handleSearch,
  handleReset,
  handleDelete,
  handleSortChange,
  handleExport,
  getList,
  handleReloadTable,
} = useTableHooks<TrainPlanEntity>({
  api: getTrainPlanPage,
  delApi: delTrainPlan,
  customType: 'trainPlan',
  sizeKey: 'rows',
})

const logId = ref('')

const showLog = ref(false)

const isShowEdit = ref(false)

const isDetail = ref(false)

const editData = ref(new TrainPlanEntity())

const showProcess = ref(false)

const processFormRef = ref()

const processLoading = ref(false)

const currentProcess = ref<TrainPlanEntity>()

const tableKey = ref(0)

function successCallback() {
  isDetail.value = false
  getList()
}

function showDetail(row: TrainPlanEntity) {
  editData.value = TrainPlanEntity.fromJSON(row)
  isDetail.value = true
  isShowEdit.value = true
}

/**
 * 查看日志
 */
function handleLog(row: TrainPlanEntity) {
  logId.value = row.id?.toString()
  showLog.value = true
}

/**
 * # 撤回
 */
function handleRevoke(row: TrainPlanEntity) {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '撤回培训计划的申请，是否继续？',
    okText: '确认',
    okType: 'primary',
    cancelText: '取消',
    async onOk() {
      await revokeTrainPlan(row)
      message.success('撤回成功')
      getList()
    },
  })
}

/**
 * 打开审批弹窗
 */
async function handleProcess(row: TrainPlanEntity) {
  currentProcess.value = row
  const { data } = await preSubmitProcess(ProcessType.COMMON_TRAIN_PLAN, row.id.toString())
  if (data.haveProcess) {
    showProcess.value = true
    return
  }
  message.success('提交成功')
  getList()
}

/**
 * 提交审批
 */
async function handleSubmitProcess() {
  processLoading.value = true
  try {
    const data = await processFormRef.value.getProcessFormData()
    data.id = currentProcess.value?.id
    data.ids = currentProcess.value?.id
    data.presetAuditers = JSON.stringify(data.presetAuditers)
    data.formPropertyJson = JSON.stringify(data.formPropertyJson)
    await submitTrainPlan(data)
    message.success('提交成功')
    getList()
    processLoading.value = false
    showProcess.value = false
  }
  catch (error) {
    processLoading.value = false
    throw error
  }
}
</script>

<style scoped>
a{
  color: #1890ff;
}
</style>
